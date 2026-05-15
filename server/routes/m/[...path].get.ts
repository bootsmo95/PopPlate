import { eq } from 'drizzle-orm'
import { Readable } from 'node:stream'
import { db } from '../../database/index'
import { dishes } from '../../database/schema'
import { getAllowedStorageHosts } from '../../utils/storage'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
const ALLOWED_UPSTREAM_HOSTS = ['assets.meshy.ai', 'cdn.meshy.ai']

export default defineEventHandler(async (event) => {
  const path = getRouterParam(event, 'path') ?? ''
  const match = path.match(/^([a-zA-Z0-9_-]+)\.(glb|usdz|png)$/)

  if (!match) {
    throw createError({ statusCode: 400, message: 'Invalid model path' })
  }

  const identifier = match[1]!
  const ext = match[2]!

  const isUuid = UUID_RE.test(identifier)

  const [dish] = await db
    .select({
      status: dishes.status,
      glb: dishes.previewModelGlbUrl,
      usdz: dishes.previewModelUsdzUrl,
      poster: dishes.posterUrl,
    })
    .from(dishes)
    .where(isUuid ? eq(dishes.id, identifier) : eq(dishes.publicDishId, identifier))

  if (!dish || dish.status !== 'published') {
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

  // Data URLs are stored inline — return directly
  if (url.startsWith('data:')) {
    const commaIdx = url.indexOf(',')
    if (commaIdx === -1) {
      throw createError({ statusCode: 500, message: 'Malformed data URL' })
    }
    const raw = Buffer.from(url.slice(commaIdx + 1), 'base64')
    setResponseHeader(event, 'Content-Type', contentType)
    setResponseHeader(event, 'Cache-Control', 'public, max-age=86400')
    return send(event, raw)
  }

  // Validate upstream URL against allowlist
  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    throw createError({ statusCode: 500, message: 'Invalid upstream URL' })
  }
  const allowedHosts = new Set([...ALLOWED_UPSTREAM_HOSTS, ...getAllowedStorageHosts()])
  if (!allowedHosts.has(parsedUrl.hostname)) {
    throw createError({ statusCode: 403, message: 'Upstream host not allowed' })
  }

  const upstream = await fetch(url)

  if (!upstream.ok) {
    throw createError({ statusCode: 502, message: 'Failed to fetch from upstream' })
  }

  setResponseHeader(event, 'Content-Type', contentType)
  setResponseHeader(event, 'Cache-Control', 'public, max-age=86400')
  setResponseHeader(event, 'Content-Disposition', `inline; filename="model.${ext}"`)

  const contentLength = upstream.headers.get('content-length')
  if (contentLength) {
    setResponseHeader(event, 'Content-Length', Number(contentLength))
  }

  const reader = upstream.body?.getReader()
  if (!reader) {
    throw createError({ statusCode: 502, message: 'No response body' })
  }

  return new Readable({
    async read() {
      try {
        const { done, value } = await reader.read()
        if (done) {
          this.push(null)
        } else {
          this.push(Buffer.from(value))
        }
      } catch (err) {
        this.destroy(err instanceof Error ? err : new Error(String(err)))
      }
    },
  })
})
