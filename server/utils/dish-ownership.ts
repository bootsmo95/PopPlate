import { eq } from 'drizzle-orm'
import { db } from '../database/index'
import { dishes, restaurants } from '../database/schema'
import type { SessionUser } from './auth'
import { hasUnlimitedAccess } from './access'

export async function requireOwnedDish(dishId: string, user: SessionUser) {
  const [dish] = await db
    .select({
      id: dishes.id,
      restaurantId: dishes.restaurantId,
      publicDishId: dishes.publicDishId,
      name: dishes.name,
      shortDescription: dishes.shortDescription,
      priceText: dishes.priceText,
      allergens: dishes.allergens,
      ingredients: dishes.ingredients,
      status: dishes.status,
      posterUrl: dishes.posterUrl,
      previewModelGlbUrl: dishes.previewModelGlbUrl,
      previewModelUsdzUrl: dishes.previewModelUsdzUrl,
      scaleCm: dishes.scaleCm,
      createdByUserId: dishes.createdByUserId,
      createdAt: dishes.createdAt,
      updatedAt: dishes.updatedAt,
      publishedAt: dishes.publishedAt,
      ownerId: restaurants.ownerId,
    })
    .from(dishes)
    .innerJoin(restaurants, eq(restaurants.id, dishes.restaurantId))
    .where(eq(dishes.id, dishId))
    .limit(1)

  if (!dish) {
    throw createError({ statusCode: 404, message: 'Retten blev ikke fundet' })
  }

  if (!hasUnlimitedAccess(user) && dish.ownerId !== user.id) {
    throw createError({ statusCode: 403, message: 'Du har ikke adgang til denne ret' })
  }

  const { ownerId: _ownerId, ...ownedDish } = dish
  return ownedDish
}
