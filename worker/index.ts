import { createServer, type Server } from 'node:http'
import { db } from '../server/database/index.js'
import { generationJobs, dishes } from '../server/database/schema.js'
import { eq, asc, and, lt, sql } from 'drizzle-orm'
import { handleGenerate } from './handlers/generate.js'
import { recoverStaleGenerationJobs } from '../server/utils/generation-timeout.js'

const POLL_INTERVAL_MS = 5000
const WORKER_HEALTH_PORT = Number(process.env.WORKER_HEALTH_PORT ?? process.env.PORT ?? 3001)
const MAX_WORKER_CONCURRENCY = 3
const WORKER_CONCURRENCY = Math.min(
  MAX_WORKER_CONCURRENCY,
  Math.max(1, Number(process.env.WORKER_CONCURRENCY ?? MAX_WORKER_CONCURRENCY) || 1),
)

let isShuttingDown = false
let healthServer: Server | null = null
let lastPollAt: Date | null = null
let lastSuccessfulPollAt: Date | null = null
let activeJobId: string | null = null
const activeJobIds = new Set<string>()
let lastJobId: string | null = null

async function ensureMeshySchema(): Promise<void> {
  await db.execute(sql`ALTER TABLE "generation_jobs" ADD COLUMN IF NOT EXISTS "external_task_id" text`)
  await db.execute(sql`ALTER TABLE "generation_jobs" ADD COLUMN IF NOT EXISTS "progress" integer DEFAULT 0 NOT NULL`)
}

async function recoverStaleJobs(): Promise<void> {
  const staleJobs = await recoverStaleGenerationJobs()
  for (const job of staleJobs) {
    console.log(`[worker] Recovered stale job ${job.id} (dish: ${job.dishId})`)
  }
}

async function claimNextJob() {
  // Atomic job pickup: UPDATE ... WHERE status='queued' RETURNING * (prevents race conditions)
  const [job] = await db
    .update(generationJobs)
    .set({
      status: 'processing',
      startedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(generationJobs.status, 'queued'),
        eq(generationJobs.id, sql`(SELECT id FROM generation_jobs WHERE status = 'queued' ORDER BY created_at ASC LIMIT 1)`)
      )
    )
    .returning()

  if (!job) {
    return null
  }

  return job
}

async function processJob(job: NonNullable<Awaited<ReturnType<typeof claimNextJob>>>): Promise<void> {
  activeJobId = job.id
  activeJobIds.add(job.id)
  lastJobId = job.id

  console.log(`[worker] Job ${job.id} -> processing`)

  try {
    const result = await handleGenerate(job.id, job.dishId)

    await db
      .update(generationJobs)
      .set({
        status: 'ready',
        progress: 100,
        completedAt: new Date(),
        updatedAt: new Date(),
        outputPreviewModelGlbUrl: result.glbUrl,
        outputPreviewModelUsdzUrl: result.usdzUrl,
        outputPosterUrl: result.posterUrl,
      })
      .where(eq(generationJobs.id, job.id))

    await db
      .update(dishes)
      .set({
        status: 'ready',
        previewModelGlbUrl: result.glbUrl,
        previewModelUsdzUrl: result.usdzUrl,
        posterUrl: result.posterUrl,
        updatedAt: new Date(),
      })
      .where(eq(dishes.id, job.dishId))

    console.log(`[worker] Job ${job.id} -> ready (dish: ${job.dishId})`)
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    const errorCode = 'GENERATION_ERROR'

    await db
      .update(generationJobs)
      .set({
        status: 'failed',
        completedAt: new Date(),
        updatedAt: new Date(),
        errorCode,
        errorMessage,
      })
      .where(eq(generationJobs.id, job.id))

    await db
      .update(dishes)
      .set({
        status: 'failed',
        updatedAt: new Date(),
      })
      .where(eq(dishes.id, job.dishId))

    console.error(`[worker] Job ${job.id} -> failed: ${errorMessage}`)
  } finally {
    activeJobIds.delete(job.id)
    activeJobId = activeJobIds.values().next().value ?? null
  }
}

async function fillWorkerSlots(): Promise<void> {
  while (!isShuttingDown && activeJobIds.size < WORKER_CONCURRENCY) {
    const job = await claimNextJob()
    if (!job) return

    void processJob(job).catch((err) => {
      console.error(`[worker] Unexpected error while processing job ${job.id}:`, err)
    })
  }
}

async function poll(): Promise<void> {
  if (isShuttingDown) return

  lastPollAt = new Date()

  try {
    await recoverStaleJobs()
    await fillWorkerSlots()
    lastSuccessfulPollAt = new Date()
  } catch (err) {
    console.error('[worker] Unexpected error in poll loop:', err)
  }

  if (!isShuttingDown) {
    setTimeout(poll, POLL_INTERVAL_MS)
  }
}

function startHealthServer(): void {
  if (!Number.isFinite(WORKER_HEALTH_PORT) || WORKER_HEALTH_PORT <= 0) {
    console.log('[worker] Health server disabled')
    return
  }

  healthServer = createServer((req, res) => {
    if (req.url !== '/healthz') {
      res.writeHead(404, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ error: 'not_found' }))
      return
    }

    const statusCode = isShuttingDown ? 503 : 200
    res.writeHead(statusCode, { 'content-type': 'application/json' })
    res.end(JSON.stringify({
      status: isShuttingDown ? 'shutting_down' : 'ok',
      uptimeSeconds: Math.round(process.uptime()),
      lastPollAt: lastPollAt?.toISOString() ?? null,
      lastSuccessfulPollAt: lastSuccessfulPollAt?.toISOString() ?? null,
      activeJobId,
      activeJobIds: [...activeJobIds],
      activeJobCount: activeJobIds.size,
      workerConcurrency: WORKER_CONCURRENCY,
      lastJobId,
    }))
  })

  healthServer.listen(WORKER_HEALTH_PORT, () => {
    console.log(`[worker] Health server listening on :${WORKER_HEALTH_PORT}/healthz`)
  })
}

function shutdown(signal: string): void {
  console.log(`[worker] Received ${signal}, shutting down gracefully...`)
  isShuttingDown = true
  healthServer?.close()
  // Give in-flight work a moment to finish, then exit
  setTimeout(() => {
    console.log('[worker] Shutdown complete')
    process.exit(0)
  }, 1000)
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

async function main(): Promise<void> {
  console.log('[worker] Starting PopPlate worker...')
  console.log(`[worker] Concurrency set to ${WORKER_CONCURRENCY} job(s)`)
  startHealthServer()
  await ensureMeshySchema()
  console.log('[worker] Meshy schema ensured')
  await poll()
}

main().catch((err) => {
  console.error('[worker] Fatal startup error:', err)
  process.exit(1)
})
