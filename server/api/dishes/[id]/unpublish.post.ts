import { db } from '../../../database/index'
import { dishes } from '../../../database/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '../../../utils/auth'
import { requireOwnedDish } from '../../../utils/dish-ownership'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuth(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'id is required' })
  }

  const dish = await requireOwnedDish(id, user)
  if (dish.status !== 'published') {
    throw createError({ statusCode: 422, message: 'Only published dishes can be unpublished' })
  }

  const [updatedDish] = await db
    .update(dishes)
    .set({ status: 'ready', publishedAt: null, updatedAt: new Date() })
    .where(eq(dishes.id, id))
    .returning()

  return { dish: updatedDish }
})
