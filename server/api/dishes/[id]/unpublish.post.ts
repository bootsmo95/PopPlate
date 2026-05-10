import { db } from '../../../database/index'
import { dishes } from '../../../database/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'id is required' })
  }

  const [dish] = await db.select().from(dishes).where(eq(dishes.id, id))
  if (!dish) {
    throw createError({ statusCode: 404, message: 'Dish not found' })
  }

  const [updatedDish] = await db
    .update(dishes)
    .set({ status: 'ready', publishedAt: null, updatedAt: new Date() })
    .where(eq(dishes.id, id))
    .returning()

  return { dish: updatedDish }
})
