import { db } from '../../../../database/index'
import { dishSourceImages } from '../../../../database/schema'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from '../../../../utils/auth'
import { deleteFile } from '../../../../utils/storage'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = getRouterParam(event, 'id')
  const imageId = getRouterParam(event, 'imageId')

  if (!id) {
    throw createError({ statusCode: 400, message: 'id is required' })
  }
  if (!imageId) {
    throw createError({ statusCode: 400, message: 'imageId is required' })
  }

  // Find the record first to get the storageKey
  const [image] = await db
    .select()
    .from(dishSourceImages)
    .where(and(eq(dishSourceImages.id, imageId), eq(dishSourceImages.dishId, id)))

  if (!image) {
    throw createError({ statusCode: 404, message: 'Image not found' })
  }

  // Delete from S3
  await deleteFile(image.storageKey)

  // Delete DB record
  await db
    .delete(dishSourceImages)
    .where(eq(dishSourceImages.id, imageId))

  return { success: true }
})
