import { db } from '../../database/index'
import { dishes, restaurants } from '../../database/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '../../utils/auth'
import { nanoid } from 'nanoid'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const body = await readBody<{
    name: string
    shortDescription?: string
    priceText?: string
    allergens?: string
    ingredients?: string
    restaurantId: string
  }>(event)

  if (!body?.name) {
    throw createError({ statusCode: 400, message: 'name is required' })
  }
  if (!body?.restaurantId) {
    throw createError({ statusCode: 400, message: 'restaurantId is required' })
  }

  const [restaurant] = await db.select({ id: restaurants.id }).from(restaurants).where(eq(restaurants.id, body.restaurantId)).limit(1)
  if (!restaurant) {
    throw createError({ statusCode: 404, message: 'Restaurant not found' })
  }

  const publicDishId = nanoid(8)

  const [created] = await db
    .insert(dishes)
    .values({
      restaurantId: body.restaurantId,
      publicDishId,
      name: body.name,
      shortDescription: body.shortDescription ?? null,
      priceText: body.priceText ?? null,
      allergens: body.allergens ?? null,
      ingredients: body.ingredients ?? null,
      status: 'draft',
    })
    .returning()

  return created
})
