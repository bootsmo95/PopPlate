import { requireAuth } from '../../../../utils/auth'
import { requireOwnedDish } from '../../../../utils/dish-ownership'
import { sendModelAsset } from '../../../../utils/model-proxy'

const VALID_EXTENSIONS = new Set(['glb', 'usdz', 'png'])

export default defineEventHandler(async (event) => {
  const { user } = await requireAuth(event)

  const id = getRouterParam(event, 'id')
  const ext = getRouterParam(event, 'ext')

  if (!id || !ext || !VALID_EXTENSIONS.has(ext)) {
    throw createError({ statusCode: 400, message: 'Invalid model path' })
  }

  const dish = await requireOwnedDish(id, user)

  return sendModelAsset(event, {
    glb: dish.previewModelGlbUrl,
    usdz: dish.previewModelUsdzUrl,
    poster: dish.posterUrl,
  }, ext)
})
