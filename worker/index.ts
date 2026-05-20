import { createServer, type Server } from 'node:http'
import { db } from '../server/database/index.js'
import { generationJobs, dishes } from '../server/database/schema.js'
import { eq, asc, and, lt, sql } from 'drizzle-orm'
import { handleGenerate } from './handlers/generate.js'

const POLL_INTERVAL_MS = 5000
const WORKER_HEALTH_PORT = Number(process.env.WORKER_HEALTH_PORT ?? process.env.PORT ?? 3001)

let isShuttingDown = false
let healthServer: Server | null = null
let lastPollAt: Date | null = null
let lastSuccessfulPollAt: Date | null = null
let activeJobId: string | null = null
let lastJobId: string | null = null

async function ensureMeshySchema(): Promise<void> {
  await db.execute(sql`ALTER TABLE "generation_jobs" ADD COLUMN IF NOT EXISTS "external_task_id" text`)
  await db.execute(sql`ALTER TABLE "generation_jobs" ADD COLUMN IF NOT EXISTS "progress" integer DEFAULT 0 NOT NULL`)
}

const STALE_TIMEOUT_MS = 30 * 60 * 1000

async function recoverStaleJobs(): Promise<void> {
  const cutoff = new Date(Date.now() - STALE_TIMEOUT_MS)

  const staleJobs = await db
    .update(generationJobs)
    .set({
      status: 'failed',
      errorCode: 'STALE_TIMEOUT',
      errorMessage: 'Job exceeded 30-minute timeout (worker may have crashed)',
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(generationJobs.status, 'processing'),
        lt(generationJobs.startedAt, cutoff)
      )
    )
    .returning({ id: generationJobs.id, dishId: generationJobs.dishId })

  for (const job of staleJobs) {
    await db
      .update(dishes)
      .set({ status: 'failed', updatedAt: new Date() })
      .where(eq(dishes.id, job.dishId))

    console.log(`[worker] Recovered stale job ${job.id} (dish: ${job.dishId})`)
  }
}

async function processNextJob(): Promise<void> {
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
    return
  }

  activeJobId = job.id
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
    activeJobId = null
  }
}

async function poll(): Promise<void> {
  if (isShuttingDown) return

  lastPollAt = new Date()

  try {
    await recoverStaleJobs()
    await processNextJob()
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
  startHealthServer()
  await ensureMeshySchema()
  console.log('[worker] Meshy schema ensured')
  await poll()
}

main().catch((err) => {
  console.error('[worker] Fatal startup error:', err)
  process.exit(1)
})
