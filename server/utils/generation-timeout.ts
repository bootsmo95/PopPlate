import { and, eq, inArray, isNotNull, lt, sql } from 'drizzle-orm'
import { db } from '../database'
import { dishes, generationJobs } from '../database/schema'

const STALE_GENERATION_TIMEOUT_MS = 30 * 60 * 1000

type RecoverStaleOptions = {
  dishId?: string
}

function staleJobCutoff() {
  return new Date(Date.now() - STALE_GENERATION_TIMEOUT_MS)
}

export async function recoverStaleGenerationJobs(options: RecoverStaleOptions = {}) {
  const conditions = [
    inArray(generationJobs.status, ['queued', 'processing']),
    lt(sql<Date>`coalesce(${generationJobs.startedAt}, ${generationJobs.createdAt})`, staleJobCutoff()),
  ]

  if (options.dishId) {
    conditions.push(eq(generationJobs.dishId, options.dishId))
  }

  const staleJobs = await db
    .update(generationJobs)
    .set({
      status: 'failed',
      errorCode: 'STALE_TIMEOUT',
      errorMessage: 'Job exceeded 30-minute timeout',
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(...conditions))
    .returning({ id: generationJobs.id, dishId: generationJobs.dishId })

  for (const job of staleJobs) {
    await reconcileDishGenerationStatus(job.dishId)
  }

  return staleJobs
}

export async function reconcileDishGenerationStatus(dishId: string) {
  const [latestJob] = await db
    .select({
      status: generationJobs.status,
    })
    .from(generationJobs)
    .where(eq(generationJobs.dishId, dishId))
    .orderBy(sql`${generationJobs.createdAt} desc`)
    .limit(1)

  if (latestJob?.status === 'queued' || latestJob?.status === 'processing') {
    return
  }

  const nextStatus = latestJob?.status === 'ready'
    ? 'ready'
    : sql<string>`case when ${dishes.previewModelGlbUrl} is not null then 'ready' else 'failed' end`

  await db
    .update(dishes)
    .set({
      status: nextStatus,
      updatedAt: new Date(),
    })
    .where(and(eq(dishes.id, dishId), eq(dishes.status, 'processing')))
}

export async function reconcileGeneratedDishes() {
  return db
    .update(dishes)
    .set({
      status: 'ready',
      updatedAt: new Date(),
    })
    .where(and(eq(dishes.status, 'processing'), isNotNull(dishes.previewModelGlbUrl)))
    .returning({ id: dishes.id })
}
