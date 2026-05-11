import { db } from '../../../database/index'
import { dishes, qrCodes } from '../../../database/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '../../../utils/auth'
import { uploadFile, getPublicUrl } from '../../../utils/storage'
import { qrImageKey } from '../../../utils/storage-keys'
import QRCode from 'qrcode'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'id is required' })
  }

  // Fetch dish
  const [dish] = await db.select().from(dishes).where(eq(dishes.id, id))
  if (!dish) {
    throw createError({ statusCode: 404, message: 'Dish not found' })
  }

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

  const appBaseUrl = process.env.NUXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const publicUrl = `${appBaseUrl}/d/${dish.publicDishId}`

  // Generate QR code as PNG buffer
  const qrBuffer = await QRCode.toBuffer(publicUrl, {
    type: 'png',
    width: 512,
    margin: 2,
  })

  // Upload QR image to S3 (outside transaction — compensate on failure)
  const key = qrImageKey(dish.restaurantId, dish.id, 'qr.png')
  await uploadFile(key, qrBuffer, 'image/png')
  const imageUrl = getPublicUrl(key)

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
