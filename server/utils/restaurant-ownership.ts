import { eq } from 'drizzle-orm'
import { db } from '../database/index'
import { restaurants } from '../database/schema'
import type { SessionUser } from './auth'
import { hasUnlimitedAccess } from './access'

export async function requireAccessibleRestaurant(restaurantId: string, user: SessionUser) {
  const [restaurant] = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.id, restaurantId))
    .limit(1)

  if (!restaurant) {
    throw createError({ statusCode: 404, message: 'Restaurant not found' })
  }

  if (!hasUnlimitedAccess(user) && restaurant.ownerId !== user.id) {
    throw createError({ statusCode: 403, message: 'You do not own this restaurant' })
  }

  return restaurant
}
