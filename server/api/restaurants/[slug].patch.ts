import { eq } from 'drizzle-orm'
import { db } from '../../database/index'
import { restaurants } from '../../database/schema'
import { requireAuth } from '../../utils/auth'
import { requireAccessibleRestaurant } from '../../utils/restaurant-ownership'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuth(event)

  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, message: 'slug is required' })
  }

  const [restaurantRow] = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.slug, slug))
    .limit(1)

  if (!restaurantRow) {
    throw createError({ statusCode: 404, message: 'Restauranten blev ikke fundet' })
  }

  await requireAccessibleRestaurant(restaurantRow.id, user)

  const body = await readBody<{
    name?: string
    tagline?: string | null
    address?: string | null
    city?: string | null
    openingHours?: string | null
  }>(event)

  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  }

  if (body.name !== undefined) {
    const trimmed = body.name.trim()
    if (!trimmed) {
      throw createError({ statusCode: 400, message: 'Navn må ikke være tomt' })
    }
    updateData.name = trimmed
  }

  if (body.tagline !== undefined) updateData.tagline = body.tagline?.trim() || null
  if (body.address !== undefined) updateData.address = body.address?.trim() || null
  if (body.city !== undefined) updateData.city = body.city?.trim() || null
  if (body.openingHours !== undefined) updateData.openingHours = body.openingHours?.trim() || null

  const [updated] = await db
    .update(restaurants)
    .set(updateData)
    .where(eq(restaurants.id, restaurantRow.id))
    .returning()

  return updated
})
