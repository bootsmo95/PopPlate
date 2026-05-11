import { eq } from 'drizzle-orm'
import { db } from '../../database/index'
import { dishes } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const path = getRouterParam(event, 'path') ?? ''
  const match = path.match(/^([a-f0-9-]+)\.(glb|usdz|png)$/)

  if (!match) {
    throw createError({ statusCode: 400, message: 'Invalid model path' })
  }

  const [, dishId, ext] = match

  const [dish] = await db
    .select({
      glb: dishes.previewModelGlbUrl,
      usdz: dishes.previewModelUsdzUrl,
      poster: dishes.posterUrl,
    })
    .from(dishes)
    .where(eq(dishes.id, dishId))

  if (!dish) {
    throw createError({ statusCode: 404, message: 'Dish not found' })
  }

  let url: string | null = null
  let contentType: string

  switch (ext) {
    case 'usdz':
      url = dish.usdz
      contentType = 'model/vnd.usdz+zip'
      break
    case 'png':
      url = dish.poster
      contentType = 'image/png'
      break
    default:
      url = dish.glb
      contentType = 'model/gltf-binary'
      break
  }

  if (!url) {
    throw createError({ statusCode: 404, message: `No ${ext} file available` })
  }

  const upstream = await fetch(url)

  if (!upstream.ok) {
    throw createError({ statusCode: 502, message: 'Failed to fetch from upstream' })
  }

  setResponseHeader(event, 'Content-Type', contentType)
  setResponseHeader(event, 'Cache-Control', 'public, max-age=86400')
  setResponseHeader(event, 'Content-Disposition', `inline; filename="model.${ext}"`)

  const arrayBuffer = await upstream.arrayBuffer()
  return send(event, Buffer.from(arrayBuffer))
})
