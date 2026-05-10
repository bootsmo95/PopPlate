import { db } from '../server/database/index.js'
import { generationJobs, dishes } from '../server/database/schema.js'
import { eq, asc } from 'drizzle-orm'
import { handleGenerate } from './handlers/generate.js'

const POLL_INTERVAL_MS = 5000

let isShuttingDown = false

async function processNextJob(): Promise<void> {
  // Pick the oldest queued job
  const [job] = await db
    .select()
    .from(generationJobs)
    .where(eq(generationJobs.status, 'queued'))
    .orderBy(asc(generationJobs.createdAt))
    .limit(1)

  if (!job) {
    return
  }

  console.log(`[worker] Picked up job ${job.id} (dish: ${job.dishId}, attempt: ${job.attemptNumber})`)

  // Mark as processing
  await db
    .update(generationJobs)
    .set({
      status: 'processing',
      startedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(generationJobs.id, job.id))

  console.log(`[worker] Job ${job.id} → processing`)

  try {
    const result = await handleGenerate(job.id, job.dishId)

    // Mark job as ready and update dish with output URLs
    await db
      .update(generationJobs)
      .set({
        status: 'ready',
        completedAt: new Date(),
        updatedAt: new Date(),
        outputPreviewModelGlbUrl: result.glbUrl,
        outputPosterUrl: result.posterUrl,
      })
      .where(eq(generationJobs.id, job.id))

    await db
      .update(dishes)
      .set({
        status: 'ready',
        previewModelGlbUrl: result.glbUrl,
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

console.log('[worker] Starting PopPlate worker...')
poll()
