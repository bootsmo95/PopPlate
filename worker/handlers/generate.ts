import { db } from '../../server/database/index.js'
import { generationJobs, dishSourceImages, dishes } from '../../server/database/schema.js'
import { eq, asc } from 'drizzle-orm'
import { createImageTo3DTask, getTaskStatus } from '../../server/utils/meshy.js'
import { compressGlb } from '../utils/compress-glb.js'
import { getPublicUrl, uploadFile } from '../../server/utils/storage.js'
import { generatedAssetKey } from '../../server/utils/storage-keys.js'

export interface GenerateResult {
  glbUrl: string
  usdzUrl: string | null
  posterUrl: string | null
}

const POLL_INTERVAL_MS = 5000
const MAX_POLL_ATTEMPTS = 360

export async function handleGenerate(
  jobId: string,
  dishId: string,
): Promise<GenerateResult> {
  const [dish] = await db
    .select({
      id: dishes.id,
      restaurantId: dishes.restaurantId,
      publicDishId: dishes.publicDishId,
    })
    .from(dishes)
    .where(eq(dishes.id, dishId))
    .limit(1)

  if (!dish) {
    throw new Error('Dish not found')
  }

  const images = await db
    .select({ imageUrl: dishSourceImages.imageUrl })
    .from(dishSourceImages)
    .where(eq(dishSourceImages.dishId, dishId))
    .orderBy(asc(dishSourceImages.sortOrder))

  if (images.length === 0) {
    throw new Error('No source images found for dish')
  }

  const imageUrls = images.slice(0, 4).map(img => img.imageUrl)
  const isMultiImage = imageUrls.length > 1

  console.log(`[generate] Submitting ${imageUrls.length} image(s) to Meshy for dish ${dishId}`)

  const { taskId } = await createImageTo3DTask(imageUrls)

  await db
    .update(generationJobs)
    .set({ externalTaskId: taskId, updatedAt: new Date() })
    .where(eq(generationJobs.id, jobId))

  console.log(`[generate] Meshy task created: ${taskId}`)

  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS))

    const status = await getTaskStatus(taskId, isMultiImage)

    if (status.progress > 0) {
      await db
        .update(generationJobs)
        .set({ progress: status.progress, updatedAt: new Date() })
        .where(eq(generationJobs.id, jobId))
    }

    if (status.status === 'SUCCEEDED') {
      console.log(`[generate] Meshy task ${taskId} succeeded, compressing model...`)

      const glbUrl = status.model_urls?.glb
      if (!glbUrl) throw new Error('No GLB URL in Meshy response')

      const compressedGlb = await downloadAndCompress(glbUrl)
      const glbKey = generatedAssetKey(dish.restaurantId, dishId, `${dish.publicDishId}.glb`)
      await uploadFile(glbKey, compressedGlb, 'model/gltf-binary')
      const compressedGlbUrl = getPublicUrl(glbKey)

      const usdzUrl = status.model_urls?.usdz
        ? await downloadAndUpload(
            status.model_urls.usdz,
            generatedAssetKey(dish.restaurantId, dishId, `${dish.publicDishId}.usdz`),
            'model/vnd.usdz+zip',
          )
        : null
      const posterDataUrl = status.thumbnail_url
        ? await downloadAndUpload(
            status.thumbnail_url,
            generatedAssetKey(dish.restaurantId, dishId, `${dish.publicDishId}.png`),
            'image/png',
          )
        : null

      console.log(`[generate] Compressed GLB: ${Math.round(compressedGlb.length / 1024)}KB uploaded to storage`)
      if (usdzUrl) {
        console.log(`[generate] USDZ available for iOS Quick Look`)
      }

      return {
        glbUrl: compressedGlbUrl,
        usdzUrl,
        posterUrl: posterDataUrl,
      }
    }

    if (status.status === 'FAILED') {
      throw new Error(status.task_error?.message ?? 'Meshy generation failed')
    }

    if (status.status === 'CANCELED') {
      throw new Error('Meshy task was canceled')
    }

    if (status.status === 'PENDING' && status.preceding_tasks !== undefined) {
      console.log(`[generate] Task ${taskId}: queued, ${status.preceding_tasks} tasks ahead`)
    } else {
      console.log(`[generate] Task ${taskId}: ${status.status} ${status.progress}%`)
    }
  }

  throw new Error('Generation timed out after 30 minutes')
}

async function downloadAndCompress(glbUrl: string): Promise<Buffer> {
  const response = await fetch(glbUrl)
  if (!response.ok) throw new Error(`Failed to download GLB: ${response.status}`)

  const rawBuffer = Buffer.from(await response.arrayBuffer())
  console.log(`[generate] Downloaded GLB: ${Math.round(rawBuffer.length / 1024 / 1024)}MB`)

  const compressed = await compressGlb(rawBuffer)
  console.log(`[generate] Compressed to: ${Math.round(compressed.length / 1024)}KB`)

  return compressed
}

async function downloadAndUpload(url: string, key: string, mimeType: string): Promise<string | null> {
  const response = await fetch(url)
  if (!response.ok) return null

  const buffer = Buffer.from(await response.arrayBuffer())
  await uploadFile(key, buffer, mimeType)
  return getPublicUrl(key)
}
