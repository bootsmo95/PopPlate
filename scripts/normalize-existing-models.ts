/**
 * One-time migration: re-compress all existing GLB models with normalization.
 *
 * Usage: npx tsx scripts/normalize-existing-models.ts
 *
 * Safe to re-run: normalizing an already-normalized model is a no-op.
 */

import { db } from '../server/database/index.js'
import { dishes } from '../server/database/schema.js'
import { isNotNull } from 'drizzle-orm'
import { compressGlb } from '../worker/utils/compress-glb.js'
import { uploadFile } from '../server/utils/storage.js'
import { generatedAssetKey } from '../server/utils/storage-keys.js'

async function main() {
  const allDishes = await db
    .select({
      id: dishes.id,
      restaurantId: dishes.restaurantId,
      publicDishId: dishes.publicDishId,
      previewModelGlbUrl: dishes.previewModelGlbUrl,
    })
    .from(dishes)
    .where(isNotNull(dishes.previewModelGlbUrl))

  console.log(`Found ${allDishes.length} dishes with GLB models`)

  let success = 0
  let skipped = 0
  let failed = 0

  for (const dish of allDishes) {
    const label = `[${dish.publicDishId}] ${dish.id}`
    try {
      console.log(`\n${label}: Downloading GLB...`)
      const glbUrl = dish.previewModelGlbUrl!

      const response = await fetch(glbUrl)
      if (!response.ok) {
        console.warn(`${label}: Failed to download (${response.status}), skipping`)
        skipped++
        continue
      }

      const rawBuffer = Buffer.from(await response.arrayBuffer())
      console.log(`${label}: Downloaded ${Math.round(rawBuffer.length / 1024)}KB`)

      const normalized = await compressGlb(rawBuffer)
      console.log(`${label}: Normalized to ${Math.round(normalized.length / 1024)}KB`)

      const glbKey = generatedAssetKey(dish.restaurantId, dish.id, `${dish.publicDishId}.glb`)
      await uploadFile(glbKey, normalized, 'model/gltf-binary')
      console.log(`${label}: Uploaded`)

      success++
    } catch (err) {
      console.error(`${label}: FAILED`, err)
      failed++
    }
  }

  console.log(`\nDone: ${success} normalized, ${skipped} skipped, ${failed} failed out of ${allDishes.length} total`)
  process.exit(failed > 0 ? 1 : 0)
}

main()
