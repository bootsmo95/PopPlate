import { and, count, desc, eq } from 'drizzle-orm'
import { db } from '../../database/index'
import { dishes, restaurants } from '../../database/schema'
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

  const restaurant = await requireAccessibleRestaurant(restaurantRow.id, user)

  const [{ count: dishCount }] = await db
    .select({ count: count() })
    .from(dishes)
    .where(eq(dishes.restaurantId, restaurant.id))

  const [{ count: publishedDishCount }] = await db
    .select({ count: count() })
    .from(dishes)
    .where(and(eq(dishes.restaurantId, restaurant.id), eq(dishes.status, 'published')))

  const latestDishes = await db
    .select()
    .from(dishes)
    .where(eq(dishes.restaurantId, restaurant.id))
    .orderBy(desc(dishes.createdAt))
    .limit(6)

  return {
    ...restaurant,
    dishCount,
    publishedDishCount,
    latestDishes,
  }
})
