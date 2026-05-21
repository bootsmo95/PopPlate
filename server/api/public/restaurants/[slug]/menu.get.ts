import { and, desc, eq } from 'drizzle-orm'
import { db } from '../../../../database/index'
import { dishes, restaurants } from '../../../../database/schema'
import { isDurableStorageAssetUrl } from '../../../../utils/storage'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, message: 'slug is required' })
  }

  const [restaurant] = await db
    .select({
      id: restaurants.id,
      name: restaurants.name,
      slug: restaurants.slug,
      status: restaurants.status,
    })
    .from(restaurants)
    .where(and(eq(restaurants.slug, slug), eq(restaurants.status, 'active')))
    .limit(1)

  if (!restaurant) {
    throw createError({ statusCode: 404, message: 'Restaurant not found' })
  }

  const publishedDishes = await db
    .select({
      id: dishes.id,
      publicDishId: dishes.publicDishId,
      name: dishes.name,
      shortDescription: dishes.shortDescription,
      priceText: dishes.priceText,
      allergens: dishes.allergens,
      ingredients: dishes.ingredients,
      hasModel: dishes.previewModelGlbUrl,
      hasUsdz: dishes.previewModelUsdzUrl,
      hasPoster: dishes.posterUrl,
      scaleCm: dishes.scaleCm,
      publishedAt: dishes.publishedAt,
      createdAt: dishes.createdAt,
    })
    .from(dishes)
    .where(and(eq(dishes.restaurantId, restaurant.id), eq(dishes.status, 'published')))
    .orderBy(desc(dishes.publishedAt), desc(dishes.createdAt))

  return {
    restaurant,
    dishes: publishedDishes.map((dish) => ({
      id: dish.id,
      publicDishId: dish.publicDishId,
      name: dish.name,
      shortDescription: dish.shortDescription,
      priceText: dish.priceText,
      allergens: dish.allergens,
      ingredients: dish.ingredients,
      hasModel: !!dish.hasModel,
      hasUsdz: isDurableStorageAssetUrl(dish.hasUsdz),
      hasPoster: !!dish.hasPoster,
      scaleCm: dish.scaleCm,
      publishedAt: dish.publishedAt,
      createdAt: dish.createdAt,
    })),
  }
})
