import { db } from '../../../database/index'
import { dishSourceImages } from '../../../database/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '../../../utils/auth'
import { requireOwnedDish } from '../../../utils/dish-ownership'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuth(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'id is required' })
  }
  await requireOwnedDish(id, user)

  const images = await db
    .select()
    .from(dishSourceImages)
    .where(eq(dishSourceImages.dishId, id))
    .orderBy(dishSourceImages.sortOrder)

  return images
})
