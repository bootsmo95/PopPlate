/**
 * Mock generation handler for MVP.
 * In the future this will call a real 3D generation API.
 */
export interface GenerateResult {
  glbUrl: string
  posterUrl: string
}

export async function handleGenerate(
  jobId: string,
  dishId: string,
): Promise<GenerateResult> {
  console.log(`Processing generation job ${jobId} for dish ${dishId}`)

  // Simulate work
  await new Promise((resolve) => setTimeout(resolve, 3000))

  // Return mock output URLs
  return {
    glbUrl: `/mock/dish-${dishId}.glb`,
    posterUrl: `/mock/dish-${dishId}-poster.jpg`,
  }
}
