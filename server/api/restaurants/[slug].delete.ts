import { eq, inArray } from 'drizzle-orm'
import { db } from '../../database/index'
import {
  analyticsEvents,
  dishes,
  dishSourceImages,
  generationJobs,
  qrCodes,
  restaurants,
  users,
} from '../../database/schema'
import { requireAuth } from '../../utils/auth'
import { hasUnlimitedAccess } from '../../utils/access'
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
  const hardDelete = getQuery(event).hard === 'true'

  if (!hardDelete) {
    const [archived] = await db
      .update(restaurants)
      .set({ status: 'archived', updatedAt: new Date() })
      .where(eq(restaurants.id, restaurant.id))
      .returning()

    return { success: true, archived: !!archived }
  }

  if (!hasUnlimitedAccess(user)) {
    throw createError({ statusCode: 403, message: 'Kun administratorer kan slette restauranter permanent' })
  }

  const restaurantDishes = await db
    .select({ id: dishes.id })
    .from(dishes)
    .where(eq(dishes.restaurantId, restaurant.id))

  const dishIds = restaurantDishes.map(dish => dish.id)

  if (dishIds.length) {
    await db.delete(analyticsEvents).where(inArray(analyticsEvents.dishId, dishIds))
    await db.delete(qrCodes).where(inArray(qrCodes.dishId, dishIds))
    await db.delete(generationJobs).where(inArray(generationJobs.dishId, dishIds))
    await db.delete(dishSourceImages).where(inArray(dishSourceImages.dishId, dishIds))
    await db.delete(dishes).where(inArray(dishes.id, dishIds))
  }

  await db.delete(analyticsEvents).where(eq(analyticsEvents.restaurantId, restaurant.id))
  await db
    .update(users)
    .set({ restaurantId: null, updatedAt: new Date() })
    .where(eq(users.restaurantId, restaurant.id))

  const [deleted] = await db
    .delete(restaurants)
    .where(eq(restaurants.id, restaurant.id))
    .returning()

  if (!deleted) {
    throw createError({ statusCode: 404, message: 'Restauranten blev ikke fundet' })
  }

  return { success: true, deleted: true }
})
