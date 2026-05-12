import { db } from '../../server/database/index.js'
import { generationJobs, dishSourceImages } from '../../server/database/schema.js'
import { eq, asc } from 'drizzle-orm'
import { createImageTo3DTask, getTaskStatus } from '../../server/utils/meshy.js'
import { compressGlb } from '../utils/compress-glb.js'

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

      const compressedGlbDataUrl = await downloadAndCompress(glbUrl)
      const posterDataUrl = status.thumbnail_url
        ? await downloadAsDataUrl(status.thumbnail_url, 'image/png')
        : null

      console.log(`[generate] Compressed GLB: ${Math.round(compressedGlbDataUrl.length / 1024)}KB data URL`)

      return {
        glbUrl: compressedGlbDataUrl,
        usdzUrl: null,
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

async function downloadAndCompress(glbUrl: string): Promise<string> {
  const response = await fetch(glbUrl)
  if (!response.ok) throw new Error(`Failed to download GLB: ${response.status}`)

  const rawBuffer = Buffer.from(await response.arrayBuffer())
  console.log(`[generate] Downloaded GLB: ${Math.round(rawBuffer.length / 1024 / 1024)}MB`)

  const compressed = await compressGlb(rawBuffer)
  console.log(`[generate] Compressed to: ${Math.round(compressed.length / 1024)}KB`)

  return `data:model/gltf-binary;base64,${compressed.toString('base64')}`
}

async function downloadAsDataUrl(url: string, mimeType: string): Promise<string | null> {
  const response = await fetch(url)
  if (!response.ok) return null

  const buffer = Buffer.from(await response.arrayBuffer())
  return `data:${mimeType};base64,${buffer.toString('base64')}`
}
