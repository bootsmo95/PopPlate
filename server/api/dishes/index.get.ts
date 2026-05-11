import { eq, desc, inArray } from 'drizzle-orm'
import { db } from '../../database/index'
import { dishes, restaurants } from '../../database/schema'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuth(event)

  const userRestaurants = await db
    .select({ id: restaurants.id })
    .from(restaurants)
    .where(eq(restaurants.ownerId, user.id))

  const restaurantIds = userRestaurants.map(r => r.id)

  if (restaurantIds.length === 0) {
    return []
  }

  const userDishes = await db
    .select()
    .from(dishes)
    .where(inArray(dishes.restaurantId, restaurantIds))
    .orderBy(desc(dishes.createdAt))

  return userDishes
})
