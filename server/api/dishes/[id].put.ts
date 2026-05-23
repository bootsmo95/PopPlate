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

  const body = await readBody<{
    name?: string
    shortDescription?: string | null
    priceText?: string | null
    allergens?: string | null
    ingredients?: string | null
    scaleCm?: number | null
  }>(event)

  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  }

  if (body.name !== undefined) updateData.name = body.name
  if (body.shortDescription !== undefined) updateData.shortDescription = body.shortDescription
  if (body.priceText !== undefined) updateData.priceText = body.priceText
  if (body.allergens !== undefined) updateData.allergens = body.allergens
  if (body.ingredients !== undefined) updateData.ingredients = body.ingredients

  if (body.scaleCm !== undefined) {
    if (body.scaleCm !== null && (!Number.isFinite(body.scaleCm) || body.scaleCm <= 0 || body.scaleCm > 200)) {
      throw createError({ statusCode: 400, message: 'Retstørrelse skal være mellem 0 og 200 cm.' })
    }

    updateData.scaleCm = body.scaleCm
  }

  const [updated] = await db
    .update(dishes)
    .set(updateData)
    .where(eq(dishes.id, id))
    .returning()

  if (!updated) {
    throw createError({ statusCode: 404, message: 'Retten blev ikke fundet' })
  }

  return updated
})
