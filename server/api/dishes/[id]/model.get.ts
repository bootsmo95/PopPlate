import { eq } from 'drizzle-orm'
import { db } from '../../../database/index'
import { dishes } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'id is required' })
  }

  const format = getQuery(event).format as string | undefined

  const [dish] = await db
    .select({
      glb: dishes.previewModelGlbUrl,
      usdz: dishes.previewModelUsdzUrl,
      poster: dishes.posterUrl,
    })
    .from(dishes)
    .where(eq(dishes.id, id))

  if (!dish) {
    throw createError({ statusCode: 404, message: 'Dish not found' })
  }

  let url: string | null = null
  let contentType = 'application/octet-stream'

  if (format === 'usdz') {
    url = dish.usdz
    contentType = 'model/vnd.usdz+zip'
  } else if (format === 'poster') {
    url = dish.poster
    contentType = 'image/png'
  } else {
    url = dish.glb
    contentType = 'model/gltf-binary'
  }

  if (!url) {
    throw createError({ statusCode: 404, message: `No ${format ?? 'glb'} model available` })
  }

  const upstream = await fetch(url)

  if (!upstream.ok) {
    throw createError({ statusCode: 502, message: 'Failed to fetch model from upstream' })
  }

  setResponseHeader(event, 'Content-Type', contentType)
  setResponseHeader(event, 'Cache-Control', 'public, max-age=86400')

  const arrayBuffer = await upstream.arrayBuffer()
  return send(event, Buffer.from(arrayBuffer))
})
