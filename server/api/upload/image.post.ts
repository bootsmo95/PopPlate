import { readMultipartFormData, createError } from 'h3'
import { eq } from 'drizzle-orm'
import { db, schema } from '../../database/index'
import { requireAuth } from '../../utils/auth'
import { toDataUrl } from '../../utils/inline-assets'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

export default defineEventHandler(async (event) => {
  // Require authentication
  await requireAuth(event)

  // Parse multipart form data
  const parts = await readMultipartFormData(event)
  if (!parts || parts.length === 0) {
    throw createError({ statusCode: 400, message: 'No form data received' })
  }

  // Extract fields
  let dishId: string | undefined
  let filePart: (typeof parts)[number] | undefined

  for (const part of parts) {
    if (part.name === 'dishId') {
      dishId = part.data.toString('utf-8').trim()
    } else if (part.filename) {
      filePart = part
    }
  }

  // Validate required fields
  if (!dishId) {
    throw createError({ statusCode: 400, message: 'dishId is required' })
  }
  if (!filePart) {
    throw createError({ statusCode: 400, message: 'No file provided' })
  }

  // Look up dish and derive restaurantId server-side
  const [dish] = await db
    .select({ id: schema.dishes.id, restaurantId: schema.dishes.restaurantId })
    .from(schema.dishes)
    .where(eq(schema.dishes.id, dishId))
    .limit(1)

  if (!dish) {
    throw createError({ statusCode: 404, message: 'Dish not found' })
  }
  const restaurantId = dish.restaurantId

  const rawFilename = filePart.filename!
  const ext = rawFilename.slice(rawFilename.lastIndexOf('.')).toLowerCase()
  // Sanitize: use a generated name to prevent path traversal and weird characters
  const filename = `${crypto.randomUUID()}${ext}`

  // Validate file extension
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw createError({
      statusCode: 400,
      message: `Invalid file type. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`,
    })
  }

  // Validate MIME type if provided
  const mimeType = filePart.type ?? 'application/octet-stream'
  if (filePart.type && !ALLOWED_MIME_TYPES.includes(filePart.type)) {
    throw createError({
      statusCode: 400,
      message: `Invalid MIME type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
    })
  }

  // Validate file size
  if (filePart.data.length > MAX_FILE_SIZE) {
    throw createError({
      statusCode: 400,
      message: 'File size exceeds the 10 MB limit',
    })
  }

  // MVP fallback: store inline in DB instead of external object storage.
  // This avoids the current MinIO routing issues while keeping uploads functional.
  const storageKey = `inline:${filename}`
  const imageUrl = toDataUrl(filePart.data, mimeType)

  // Persist record in DB
  const [record] = await db
    .insert(schema.dishSourceImages)
    .values({
      dishId,
      storageKey,
      imageUrl,
    })
    .returning()

  return record
})
