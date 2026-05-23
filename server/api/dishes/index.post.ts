import { eq, count, inArray } from 'drizzle-orm'
import { db } from '../../database/index'
import { dishes, restaurants } from '../../database/schema'
import { requireAuth } from '../../utils/auth'
import { hasUnlimitedAccess } from '../../utils/access'
import { getTierLimits } from '../../utils/tiers'
import { requireAccessibleRestaurant } from '../../utils/restaurant-ownership'
import { nanoid } from 'nanoid'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuth(event)

  const body = await readBody<{
    name: string
    shortDescription?: string
    priceText?: string
    allergens?: string
    ingredients?: string
    restaurantId: string
  }>(event)

  if (!body?.name) {
    throw createError({ statusCode: 400, message: 'Navn er påkrævet' })
  }
  if (!body?.restaurantId) {
    throw createError({ statusCode: 400, message: 'Restaurant er påkrævet' })
  }

  await requireAccessibleRestaurant(body.restaurantId, user)

  // Check tier dish limit across all restaurants
  if (!hasUnlimitedAccess(user)) {
    const userRestaurants = await db
      .select({ id: restaurants.id })
      .from(restaurants)
      .where(eq(restaurants.ownerId, user.id))
    const userRestaurantIds = userRestaurants.map(r => r.id)
    const limits = getTierLimits(user.accountTier)
    const [{ count: totalDishes }] = await db
      .select({ count: count() })
      .from(dishes)
      .where(inArray(dishes.restaurantId, userRestaurantIds))

    if (totalDishes >= limits.maxDishesTotal) {
      throw createError({
        statusCode: 403,
        message: `Your ${user.accountTier} plan allows up to ${limits.maxDishesTotal} dishes total. Upgrade to add more.`,
      })
    }
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
      scaleCm: 24,
      status: 'draft',
      createdByUserId: user.id,
    })
    .returning()

  return created
})
