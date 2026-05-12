const MESHY_BASE_URL = 'https://api.meshy.ai'

function getApiKey(): string {
  const key = process.env.MESHY_API_KEY
  if (!key) throw new Error('MESHY_API_KEY environment variable is not set')
  return key
}

function headers(): Record<string, string> {
  return {
    'Authorization': `Bearer ${getApiKey()}`,
    'Content-Type': 'application/json',
  }
}

export interface MeshyTaskResult {
  taskId: string
}

export interface MeshyTaskStatus {
  id: string
  status: 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED' | 'CANCELED'
  progress: number
  preceding_tasks?: number
  model_urls?: {
    glb?: string
    usdz?: string
    fbx?: string
    obj?: string
  }
  thumbnail_url?: string
  task_error?: { message: string }
  finished_at?: number
}

const MESHY_PARAMS = {
  ai_model: 'meshy-6',
  topology: 'triangle',
  target_polycount: 30000,
  target_formats: ['glb', 'usdz'],
  enable_pbr: true,
  should_remesh: true,
  texture_prompt: 'photorealistic food photography, appetizing, natural colors, glossy where wet, crisp detail, studio lighting',
}

export async function createImageTo3DTask(imageUrls: string[]): Promise<MeshyTaskResult> {
  const endpoint = imageUrls.length > 1
    ? '/openapi/v1/multi-image-to-3d'
    : '/openapi/v1/image-to-3d'

  const body = imageUrls.length > 1
    ? { image_urls: imageUrls, ...MESHY_PARAMS }
    : { image_url: imageUrls[0], ...MESHY_PARAMS }

  const response = await fetch(`${MESHY_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Meshy API error ${response.status}: ${errorBody}`)
  }

  const data = await response.json() as { result: string }
  return { taskId: data.result }
}

export async function getTaskStatus(taskId: string, isMultiImage: boolean): Promise<MeshyTaskStatus> {
  const endpoint = isMultiImage
    ? `/openapi/v1/multi-image-to-3d/${taskId}`
    : `/openapi/v1/image-to-3d/${taskId}`

  const response = await fetch(`${MESHY_BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: headers(),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Meshy API error ${response.status}: ${errorBody}`)
  }

  return response.json() as Promise<MeshyTaskStatus>
}
