import { db } from '../server/database/index.js'
import { generationJobs, dishes } from '../server/database/schema.js'
import { eq, asc, and, sql } from 'drizzle-orm'
import { handleGenerate } from './handlers/generate.js'

const POLL_INTERVAL_MS = 5000

let isShuttingDown = false

async function ensureMeshySchema(): Promise<void> {
  await db.execute(sql`ALTER TABLE "generation_jobs" ADD COLUMN IF NOT EXISTS "external_task_id" text`)
  await db.execute(sql`ALTER TABLE "generation_jobs" ADD COLUMN IF NOT EXISTS "progress" integer DEFAULT 0 NOT NULL`)
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

  console.log(`[worker] Job ${job.id} → processing`)

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

    console.log(`[worker] Job ${job.id} → ready (dish: ${job.dishId})`)
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

    console.error(`[worker] Job ${job.id} → failed: ${errorMessage}`)
  }
}

async function poll(): Promise<void> {
  if (isShuttingDown) return

  try {
    await processNextJob()
  } catch (err) {
    console.error('[worker] Unexpected error in poll loop:', err)
  }

  if (!isShuttingDown) {
    setTimeout(poll, POLL_INTERVAL_MS)
  }
}

function shutdown(signal: string): void {
  console.log(`[worker] Received ${signal}, shutting down gracefully...`)
  isShuttingDown = true
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
  await ensureMeshySchema()
  console.log('[worker] Meshy schema ensured')
  await poll()
}

main().catch((err) => {
  console.error('[worker] Fatal startup error:', err)
  process.exit(1)
})
