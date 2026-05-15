import { db } from '../../database/index'
import { dishes } from '../../database/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '../../utils/auth'
import { requireOwnedDish } from '../../utils/dish-ownership'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuth(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'id is required' })
  }
  await requireOwnedDish(id, user)

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
