import { db } from '../../../database/index'
import { dishes } from '../../../database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const publicDishId = getRouterParam(event, 'publicDishId')
  if (!publicDishId) {
    throw createError({ statusCode: 400, message: 'publicDishId is required' })
  }

  const [dish] = await db
    .select()
    .from(dishes)
    .where(eq(dishes.publicDishId, publicDishId))

  if (!dish) {
    throw createError({ statusCode: 404, message: 'Dish not found' })
  }

  if (dish.status !== 'published') {
    throw createError({ statusCode: 404, message: 'Dish not found' })
  }

  return {
    publicDishId: dish.publicDishId,
    name: dish.name,
    shortDescription: dish.shortDescription,
    priceText: dish.priceText,
    allergens: dish.allergens,
    hasModel: !!dish.previewModelGlbUrl,
    hasUsdz: !!dish.previewModelUsdzUrl,
    hasPoster: !!dish.posterUrl,
    restaurantId: dish.restaurantId,
    scaleCm: dish.scaleCm,
  }
})
