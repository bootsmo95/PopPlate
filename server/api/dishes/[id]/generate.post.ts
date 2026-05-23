import { db } from '../../../database/index'
import { dishes, dishSourceImages, generationJobs } from '../../../database/schema'
import { eq, desc, count, inArray, and, gte } from 'drizzle-orm'
import { requireAuth, getDbUser } from '../../../utils/auth'
import { hasUnlimitedAccess } from '../../../utils/access'
import { getTierLimits } from '../../../utils/tiers'
import { requireOwnedDish } from '../../../utils/dish-ownership'
import { recoverStaleGenerationJobs, reconcileDishGenerationStatus } from '../../../utils/generation-timeout'
import { getBillingCycleStart } from '../../../utils/generation-usage'

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
      message: 'Retten skal have mindst 2 kildebilleder før generering',
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
      message: 'Der er allerede en generation i gang for denne ret',
    })
  }

  // Wrap limit checks + job insert + dish update in a transaction to prevent
  // TOCTOU race conditions on the monthly/per-dish generation limits.
  const newJob = await db.transaction(async (tx) => {
    // Check tier limits (monthly + per-dish regeneration) in a single guard
    if (!hasUnlimitedAccess(user)) {
      const limits = getTierLimits(user.accountTier)

      // Monthly generation limit
      const dbUser = await getDbUser(user.id)
      const anchorDate = dbUser?.createdAt ?? new Date()
      const cycleStart = getBillingCycleStart(anchorDate)
      const [countResult] = await tx
        .select({ count: count() })
        .from(generationJobs)
        .where(and(
          eq(generationJobs.requestedByUserId, user.id),
          gte(generationJobs.createdAt, cycleStart),
        ))
      const monthlyCount = countResult?.count ?? 0

      if (monthlyCount >= limits.maxGenerationsPerMonth) {
        throw createError({
          statusCode: 403,
          message: 'Du har nået din månedlige grænse for 3D-generationer. Grænsen nulstilles ved din næste faktureringsdato.',
        })
      }

      // Per-dish regeneration limit
      const [{ count: completedCount }] = await tx
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

    const [latestJob] = await tx
      .select()
      .from(generationJobs)
      .where(eq(generationJobs.dishId, id))
      .orderBy(desc(generationJobs.createdAt))
      .limit(1)

    const nextAttemptNumber = latestJob ? latestJob.attemptNumber + 1 : 1

    const [insertedJob] = await tx
      .insert(generationJobs)
      .values({
        dishId: id,
        status: 'queued',
        attemptNumber: nextAttemptNumber,
        requestedByUserId: user.id,
      })
      .returning()

    await tx
      .update(dishes)
      .set({
        status: 'processing',
        updatedAt: new Date(),
      })
      .where(eq(dishes.id, id))

    return insertedJob
  })

  return newJob
})
