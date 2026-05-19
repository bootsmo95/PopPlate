import { db } from '../../database/index'
import { analyticsEvents, dishes, dishSourceImages, generationJobs, qrCodes } from '../../database/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '../../utils/auth'
import { requireOwnedDish } from '../../utils/dish-ownership'
import { hasUnlimitedAccess } from '../../utils/access'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuth(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'id is required' })
  }
  await requireOwnedDish(id, user)

  const hardDelete = getQuery(event).hard === 'true'
  if (hardDelete) {
    if (!hasUnlimitedAccess(user)) {
      throw createError({ statusCode: 403, message: 'Only admins can permanently delete dishes' })
    }

    await db.delete(analyticsEvents).where(eq(analyticsEvents.dishId, id))
    await db.delete(qrCodes).where(eq(qrCodes.dishId, id))
    await db.delete(generationJobs).where(eq(generationJobs.dishId, id))
    await db.delete(dishSourceImages).where(eq(dishSourceImages.dishId, id))

    const [deleted] = await db
      .delete(dishes)
      .where(eq(dishes.id, id))
      .returning()

    if (!deleted) {
      throw createError({ statusCode: 404, message: 'Dish not found' })
    }

    return { success: true, deleted: true }
  }

  const [archived] = await db
    .update(dishes)
    .set({ status: 'archived', updatedAt: new Date() })
    .where(eq(dishes.id, id))
    .returning()

  if (!archived) {
    throw createError({ statusCode: 404, message: 'Dish not found' })
  }

  return { success: true }
})
