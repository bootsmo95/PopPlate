import { db } from '../../server/database/index.js'
import { generationJobs, dishSourceImages } from '../../server/database/schema.js'
import { eq, asc } from 'drizzle-orm'
import { createImageTo3DTask, getTaskStatus } from '../../server/utils/meshy.js'

export interface GenerateResult {
  glbUrl: string
  usdzUrl: string | null
  posterUrl: string | null
}

const POLL_INTERVAL_MS = 5000
const MAX_POLL_ATTEMPTS = 360 // 30 minutes max

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

  // Meshy multi-image accepts up to 4 images
  const imageUrls = images.slice(0, 4).map(img => img.imageUrl)
  const isMultiImage = imageUrls.length > 1

  console.log(`[generate] Submitting ${imageUrls.length} image(s) to Meshy for dish ${dishId}`)

  const { taskId } = await createImageTo3DTask(imageUrls)

  // Store external task ID
  await db
    .update(generationJobs)
    .set({ externalTaskId: taskId, updatedAt: new Date() })
    .where(eq(generationJobs.id, jobId))

  console.log(`[generate] Meshy task created: ${taskId}`)

  // Poll until complete
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS))

    const status = await getTaskStatus(taskId, isMultiImage)

    // Update progress in DB
    if (status.progress > 0) {
      await db
        .update(generationJobs)
        .set({ progress: status.progress, updatedAt: new Date() })
        .where(eq(generationJobs.id, jobId))
    }

    if (status.status === 'SUCCEEDED') {
      console.log(`[generate] Meshy task ${taskId} succeeded`)
      return {
        glbUrl: status.model_urls?.glb ?? '',
        usdzUrl: status.model_urls?.usdz ?? null,
        posterUrl: status.thumbnail_url ?? null,
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
