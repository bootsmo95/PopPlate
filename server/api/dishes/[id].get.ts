import { db } from '../../database/index'
import { dishes, dishSourceImages, generationJobs } from '../../database/schema'
import { eq, desc } from 'drizzle-orm'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'id is required' })
  }

  const [dish] = await db
    .select()
    .from(dishes)
    .where(eq(dishes.id, id))

  if (!dish) {
    throw createError({ statusCode: 404, message: 'Dish not found' })
  }

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
