import { db } from '../../database/index'
import { dishSourceImages, generationJobs } from '../../database/schema'
import { eq, desc } from 'drizzle-orm'
import { requireAuth } from '../../utils/auth'
import { requireOwnedDish } from '../../utils/dish-ownership'
import { recoverStaleGenerationJobs, reconcileDishGenerationStatus } from '../../utils/generation-timeout'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuth(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'id is required' })
  }

  await recoverStaleGenerationJobs({ dishId: id })
  await reconcileDishGenerationStatus(id)

  const dish = await requireOwnedDish(id, user)

  const sourceImages = await db
    .select()
    .from(dishSourceImages)
    .where(eq(dishSourceImages.dishId, id))
    .orderBy(dishSourceImages.sortOrder)

  const latestJobs = await db
    .select()
    .from(generationJobs)
    .where(eq(generationJobs.dishId, id))
    .orderBy(desc(generationJobs.createdAt))
    .limit(1)

  return {
    ...dish,
    sourceImages,
    latestGenerationJob: latestJobs[0] ?? null,
  }
})
