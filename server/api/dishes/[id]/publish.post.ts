import { db } from '../../../database/index'
import { dishes, qrCodes } from '../../../database/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '../../../utils/auth'
import { requireOwnedDish } from '../../../utils/dish-ownership'
import { getPublicUrl, uploadFile } from '../../../utils/storage'
import { qrImageKey } from '../../../utils/storage-keys'
import { buildPublicDishUrl } from '../../../utils/public-url'
import QRCode from 'qrcode'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuth(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'id is required' })
  }

  const dish = await requireOwnedDish(id, user)

  // Validate publish gate
  if (dish.status !== 'ready') {
    throw createError({
      statusCode: 422,
      message: 'Dish must have status "ready" before publishing',
    })
  }
  if (!dish.name) {
    throw createError({ statusCode: 422, message: 'Dish must have a name before publishing' })
  }
  if (!dish.posterUrl) {
    throw createError({
      statusCode: 422,
      message: 'Dish must have a poster image before publishing',
    })
  }
  if (!dish.previewModelGlbUrl) {
    throw createError({
      statusCode: 422,
      message: 'Dish must have a 3D model before publishing',
    })
  }

  const publicUrl = buildPublicDishUrl(dish.publicDishId, event)

  // Generate QR code as PNG buffer
  const qrBuffer = await QRCode.toBuffer(publicUrl, {
    type: 'png',
    width: 512,
    margin: 2,
  })

  const storageKey = qrImageKey(dish.restaurantId, id, `${dish.publicDishId}.png`)
  await uploadFile(storageKey, qrBuffer, 'image/png')
  const imageUrl = getPublicUrl(storageKey)

  // Wrap DB mutations in a transaction to avoid half-state
  const result = await db.transaction(async (tx) => {
    const [updatedDish] = await tx
      .update(dishes)
      .set({ status: 'published', publishedAt: new Date(), updatedAt: new Date() })
      .where(eq(dishes.id, id))
      .returning()

    await tx.delete(qrCodes).where(eq(qrCodes.dishId, id))
    const [qrCode] = await tx
      .insert(qrCodes)
      .values({ dishId: id, publicUrl, imageUrl })
      .returning()

    return { dish: updatedDish, qrCode }
  })

  return result
})
