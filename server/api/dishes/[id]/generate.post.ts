import { db } from '../../../database/index'
import { dishes, dishSourceImages, generationJobs } from '../../../database/schema'
import { eq, desc, count, inArray, and } from 'drizzle-orm'
import { requireAuth } from '../../../utils/auth'
import { hasUnlimitedAccess } from '../../../utils/access'
import { getTierLimits } from '../../../utils/tiers'
import { requireOwnedDish } from '../../../utils/dish-ownership'
import { recoverStaleGenerationJobs, reconcileDishGenerationStatus } from '../../../utils/generation-timeout'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuth(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'id is required' })
  }

  await requireOwnedDish(id, user)
  await recoverStaleGenerationJobs({ dishId: id })
  await reconcileDishGenerationStatus(id)

  // Validate dish has enough source images
  const [imageCount] = await db
    .select({ count: count() })
    .from(dishSourceImages)
    .where(eq(dishSourceImages.dishId, id))

  if ((imageCount?.count ?? 0) < 2) {
    throw createError({
      statusCode: 422,
      message: 'Dish must have at least 2 source images before generating',
    })
  }

  // Check for in-flight jobs — prevent duplicates
  const [inflightJob] = await db
    .select()
    .from(generationJobs)
    .where(and(eq(generationJobs.dishId, id), inArray(generationJobs.status, ['queued', 'processing'])))
    .limit(1)

  if (inflightJob) {
    throw createError({
      statusCode: 409,
      message: 'A generation job is already in progress for this dish',
    })
  }

  // Check regeneration tier limit
  if (!hasUnlimitedAccess(user)) {
    const limits = getTierLimits(user.accountTier)
    const [{ count: completedCount }] = await db
      .select({ count: count() })
      .from(generationJobs)
      .where(and(eq(generationJobs.dishId, id), eq(generationJobs.status, 'ready')))

    if (completedCount >= limits.maxRegenerationsPerDish) {
      throw createError({
        statusCode: 403,
        message: `Your ${user.accountTier} plan allows up to ${limits.maxRegenerationsPerDish} generation(s) per dish. Upgrade to regenerate more.`,
      })
    }
  }

  const [latestJob] = await db
    .select()
    .from(generationJobs)
    .where(eq(generationJobs.dishId, id))
    .orderBy(desc(generationJobs.createdAt))
    .limit(1)

  const nextAttemptNumber = latestJob ? latestJob.attemptNumber + 1 : 1

  const [newJob] = await db
    .insert(generationJobs)
    .values({
      dishId: id,
      status: 'queued',
      attemptNumber: nextAttemptNumber,
      requestedByUserId: user.id,
    })
    .returning()

  await db
    .update(dishes)
    .set({
      status: 'processing',
      updatedAt: new Date(),
    })
    .where(eq(dishes.id, id))

  return newJob
})
