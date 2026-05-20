import { db } from '../../../database/index'
import { qrCodes } from '../../../database/schema'
import { eq, desc } from 'drizzle-orm'
import { requireAuth } from '../../../utils/auth'
import { requireOwnedDish } from '../../../utils/dish-ownership'
import { canonicalizePublicDishUrl } from '../../../utils/public-url'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuth(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'id is required' })
  }
  const dish = await requireOwnedDish(id, user)

  const [qrCode] = await db
    .select()
    .from(qrCodes)
    .where(eq(qrCodes.dishId, id))
    .orderBy(desc(qrCodes.createdAt))
    .limit(1)

  if (!qrCode) return null

  return {
    ...qrCode,
    publicUrl: canonicalizePublicDishUrl(qrCode.publicUrl, dish.publicDishId),
  }
})
