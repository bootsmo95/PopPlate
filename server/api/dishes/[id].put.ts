import { db } from '../../database/index'
import { dishes } from '../../database/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'id is required' })
  }

  const body = await readBody<{
    name?: string
    shortDescription?: string
    priceText?: string
    allergens?: string
    ingredients?: string
  }>(event)

  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  }

  if (body.name !== undefined) updateData.name = body.name
  if (body.shortDescription !== undefined) updateData.shortDescription = body.shortDescription
  if (body.priceText !== undefined) updateData.priceText = body.priceText
  if (body.allergens !== undefined) updateData.allergens = body.allergens
  if (body.ingredients !== undefined) updateData.ingredients = body.ingredients

  const [updated] = await db
    .update(dishes)
    .set(updateData)
    .where(eq(dishes.id, id))
    .returning()

  if (!updated) {
    throw createError({ statusCode: 404, message: 'Dish not found' })
  }

  return updated
})
