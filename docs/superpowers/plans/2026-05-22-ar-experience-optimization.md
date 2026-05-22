# AR Experience Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix AR model sizing so dishes appear at their real-world dimensions on the table, with automatic surface placement and a QR fallback for desktop users.

**Architecture:** Normalize all GLB models to 1-meter width during the worker compression pipeline. Client-side scaling becomes trivial: `scaleCm / 100`. Add `ar-placement="floor"` for table detection. USDZ inherits normalized size from the GLB. Desktop visitors on the public dish page see a QR code instead of an AR button.

**Tech Stack:** glTF Transform (model normalization), Google model-viewer (AR rendering), Drizzle ORM (schema default), Nuxt/Vue (frontend), QRCode library (already installed)

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `worker/utils/compress-glb.ts` | Modify | Add bounding-box normalization step after existing transforms |
| `app/components/viewer/DishViewer.vue` | Modify | Remove measurement logic, add `ar-placement="floor"`, update default |
| `app/pages/d/[publicDishId].vue` | Modify | Update default scale, add QR fallback for desktop |
| `app/components/admin/PublishControls.vue` | Modify | Add scaleCm nudge before publishing |
| `server/api/dishes/index.post.ts` | Modify | Default scaleCm to 24 on dish creation |
| `server/database/schema.ts` | Modify | Add `.default(24)` to scaleCm column |
| `server/database/migrations/0005_default_scale_cm.sql` | Create | Migration for scaleCm default |
| `scripts/normalize-existing-models.ts` | Create | One-time migration script |

---

### Task 1: GLB Normalization in Worker Pipeline

**Files:**
- Modify: `worker/utils/compress-glb.ts`

- [ ] **Step 1: Add the `normalizeToUnitWidth` transform function**

Add this function after the existing `compressTexturesToWebP` function in `worker/utils/compress-glb.ts`:

```typescript
function normalizeToUnitWidth() {
  return async (doc: Document) => {
    const root = doc.getRoot()
    const scene = root.listScenes()[0]
    if (!scene) return

    // Compute bounding box across all meshes
    let minX = Infinity, maxX = -Infinity
    let minZ = Infinity, maxZ = -Infinity

    for (const node of scene.listChildren()) {
      traverseNodes(node, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], (worldMatrix, mesh) => {
        for (const primitive of mesh.listPrimitives()) {
          const position = primitive.getAttribute('POSITION')
          if (!position) continue

          const arr = position.getArray()
          if (!arr) continue

          for (let i = 0; i < arr.length; i += 3) {
            const x = worldMatrix[0] * arr[i] + worldMatrix[4] * arr[i + 1] + worldMatrix[8] * arr[i + 2] + worldMatrix[12]
            const z = worldMatrix[2] * arr[i] + worldMatrix[6] * arr[i + 1] + worldMatrix[10] * arr[i + 2] + worldMatrix[14]
            if (x < minX) minX = x
            if (x > maxX) maxX = x
            if (z < minZ) minZ = z
            if (z > maxZ) maxZ = z
          }
        }
      })
    }

    const widthX = maxX - minX
    const widthZ = maxZ - minZ
    const maxHorizontalDim = Math.max(widthX, widthZ)

    if (maxHorizontalDim <= 0 || !Number.isFinite(maxHorizontalDim)) {
      console.warn('[compress-glb] Could not measure model dimensions, skipping normalization')
      return
    }

    const scaleFactor = 1.0 / maxHorizontalDim

    // Apply uniform scale to all root-level nodes
    for (const node of scene.listChildren()) {
      const currentScale = node.getScale()
      node.setScale([
        currentScale[0] * scaleFactor,
        currentScale[1] * scaleFactor,
        currentScale[2] * scaleFactor,
      ])
    }

    console.log(`[compress-glb] Normalized model: ${maxHorizontalDim.toFixed(3)} -> 1.0m (scale factor: ${scaleFactor.toFixed(4)})`)
  }
}

import type { Node, Mesh } from '@gltf-transform/core'

function traverseNodes(
  node: Node,
  parentMatrix: number[],
  callback: (worldMatrix: number[], mesh: Mesh) => void,
) {
  const t = node.getTranslation()
  const r = node.getRotation()
  const s = node.getScale()

  // Build local TRS matrix
  const localMatrix = trsToMatrix(t, r, s)
  const worldMatrix = multiplyMatrices(parentMatrix, localMatrix)

  const mesh = node.getMesh()
  if (mesh) {
    callback(worldMatrix, mesh)
  }

  for (const child of node.listChildren()) {
    traverseNodes(child, worldMatrix, callback)
  }
}

function trsToMatrix(t: number[], r: number[], s: number[]): number[] {
  // Quaternion to rotation matrix, combined with translation and scale
  const [qx, qy, qz, qw] = r
  const [sx, sy, sz] = s
  const [tx, ty, tz] = t

  const x2 = qx + qx, y2 = qy + qy, z2 = qz + qz
  const xx = qx * x2, xy = qx * y2, xz = qx * z2
  const yy = qy * y2, yz = qy * z2, zz = qz * z2
  const wx = qw * x2, wy = qw * y2, wz = qw * z2

  return [
    (1 - (yy + zz)) * sx, (xy + wz) * sx, (xz - wy) * sx, 0,
    (xy - wz) * sy, (1 - (xx + zz)) * sy, (yz + wx) * sy, 0,
    (xz + wy) * sz, (yz - wx) * sz, (1 - (xx + yy)) * sz, 0,
    tx, ty, tz, 1,
  ]
}

function multiplyMatrices(a: number[], b: number[]): number[] {
  const out = new Array(16)
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      out[i * 4 + j] =
        a[i * 4 + 0] * b[0 * 4 + j] +
        a[i * 4 + 1] * b[1 * 4 + j] +
        a[i * 4 + 2] * b[2 * 4 + j] +
        a[i * 4 + 3] * b[3 * 4 + j]
    }
  }
  return out
}
```

- [ ] **Step 2: Wire normalization into the transform pipeline**

In `compressGlb`, add `normalizeToUnitWidth()` as the last transform, after `compressTexturesToWebP()`:

```typescript
export async function compressGlb(inputBuffer: Buffer): Promise<Buffer> {
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)

  const doc = await io.readBinary(new Uint8Array(inputBuffer))

  await doc.transform(
    dedup(),
    prune(),
    flatten(),
    join(),
    compressTexturesToWebP(),
    normalizeToUnitWidth(),
  )

  const outputArray = await io.writeBinary(doc)
  return Buffer.from(outputArray)
}
```

- [ ] **Step 3: Verify the import at the top of the file**

The `Node` and `Mesh` types need to be imported from `@gltf-transform/core`. Update the import on line 1:

```typescript
import { Document, NodeIO, type Node, type Mesh } from '@gltf-transform/core'
```

Move the inline `import type` from within the function body to this top-level import.

- [ ] **Step 4: Commit**

```bash
git add worker/utils/compress-glb.ts
git commit -m "feat: normalize GLB models to 1-meter width during compression"
```

---

### Task 2: Simplify DishViewer Client-Side Scaling

**Files:**
- Modify: `app/components/viewer/DishViewer.vue`

- [ ] **Step 1: Remove the `measuredScale` logic and add `ar-placement`**

In `DishViewer.vue`, make these changes:

1. Add `ar-placement="floor"` to the `<model-viewer>` element (after `ar-scale="fixed"` on line 10):

Replace:
```
      ar-scale="fixed"
```
With:
```
      ar-scale="fixed"
      ar-placement="floor"
```

2. Replace the `scaleAttr` computed and `measuredScale` ref (lines 97-101):

Replace:
```typescript
const measuredScale = ref<string | null>(null)
const scaleAttr = computed(() => {
  if (measuredScale.value) return measuredScale.value
  return `${props.scale} ${props.scale} ${props.scale}`
})
```
With:
```typescript
const scaleAttr = computed(() => `${props.scale} ${props.scale} ${props.scale}`)
```

3. Replace the `handleLoad` function (lines 124-153). Remove the measurement logic, keep only the essential parts:

Replace:
```typescript
async function handleLoad() {
  // Measure model's native bounding box and compute correct scale
  // so AR size matches the desired scaleCm from the database
  const viewer = viewerRef.value
  if (viewer?.getDimensions && props.scale > 0) {
    try {
      const dims = viewer.getDimensions()
      const maxDim = Math.max(dims.x, dims.y, dims.z)
      if (maxDim > 0) {
        // getDimensions returns size at current scale, so native = maxDim / currentScale
        const currentScale = props.scale
        const nativeMaxDim = maxDim / currentScale
        // props.scale is desired size in meters (scaleCm / 100)
        const s = props.scale / nativeMaxDim
        measuredScale.value = `${s} ${s} ${s}`
      }
    }
    catch {
      // Fall back to static scale (already set via computed)
    }
  }

  await nextTick()
  modelLoaded.value = true
  emit('viewer-loaded')

  if (props.autoAr || pendingArActivation.value) {
    await activateAr()
  }
}
```
With:
```typescript
async function handleLoad() {
  await nextTick()
  modelLoaded.value = true
  emit('viewer-loaded')

  if (props.autoAr || pendingArActivation.value) {
    await activateAr()
  }
}
```

4. Remove the `getDimensions` from the `ModelViewerElement` type (line 92):

Replace:
```typescript
type ModelViewerElement = HTMLElement & {
  canActivateAR?: boolean
  activateAR?: () => Promise<void>
  getDimensions?: () => { x: number; y: number; z: number }
}
```
With:
```typescript
type ModelViewerElement = HTMLElement & {
  canActivateAR?: boolean
  activateAR?: () => Promise<void>
}
```

5. Remove the `measuredScale` reset from the `glbUrl` watcher (lines 114-122):

Replace:
```typescript
watch(
  () => props.glbUrl,
  () => {
    hasError.value = false
    modelLoaded.value = false
    pendingArActivation.value = false
    measuredScale.value = null
  },
)
```
With:
```typescript
watch(
  () => props.glbUrl,
  () => {
    hasError.value = false
    modelLoaded.value = false
    pendingArActivation.value = false
  },
)
```

- [ ] **Step 2: Update the default scale prop**

Change the default `scale` prop value from `0.05` to `0.24` (24cm):

Replace:
```typescript
    scale: 0.05,
```
With:
```typescript
    scale: 0.24,
```

- [ ] **Step 3: Commit**

```bash
git add app/components/viewer/DishViewer.vue
git commit -m "fix: simplify AR scaling to scaleCm/100, add floor placement"
```

---

### Task 3: Update Default Scale in Pages

**Files:**
- Modify: `app/pages/d/[publicDishId].vue`
- Modify: `app/pages/platform/dishes/[id].vue`

- [ ] **Step 1: Update default in public dish page**

In `app/pages/d/[publicDishId].vue`, change the `viewerScale` computed (line 294-297):

Replace:
```typescript
const viewerScale = computed(() => {
  const scaleCm = dish.value?.scaleCm
  return scaleCm && scaleCm > 0 ? scaleCm / 100 : 0.05
})
```
With:
```typescript
const viewerScale = computed(() => {
  const scaleCm = dish.value?.scaleCm
  return scaleCm && scaleCm > 0 ? scaleCm / 100 : 0.24
})
```

- [ ] **Step 2: Update default in admin dish page**

In `app/pages/platform/dishes/[id].vue`, change the `viewerScale` computed (lines 304-307):

Replace:
```typescript
const viewerScale = computed(() => {
  const scaleCm = dish.value?.scaleCm
  return scaleCm && scaleCm > 0 ? scaleCm / 100 : 0.05
})
```
With:
```typescript
const viewerScale = computed(() => {
  const scaleCm = dish.value?.scaleCm
  return scaleCm && scaleCm > 0 ? scaleCm / 100 : 0.24
})
```

- [ ] **Step 3: Commit**

```bash
git add app/pages/d/[publicDishId].vue app/pages/platform/dishes/[id].vue
git commit -m "fix: update default AR scale from 5cm to 24cm"
```

---

### Task 4: Desktop QR Fallback on Public Dish Page

**Files:**
- Modify: `app/pages/d/[publicDishId].vue`

- [ ] **Step 1: Add QR code generation import and state**

In the `<script setup>` section of `app/pages/d/[publicDishId].vue`, add the QR import after the existing analytics import (line 243):

```typescript
import { trackPageOpen, trackViewerLoaded, trackArLaunchClicked } from '~/lib/analytics/events'
import QRCode from 'qrcode'
```

Add a ref for the generated QR data URL after the `arLoaderText` computed (after line 283):

```typescript
const qrDataUrl = ref<string | null>(null)

onMounted(async () => {
  // existing onMounted logic stays — this is a NEW onMounted hook
  if (typeof window !== 'undefined') {
    const dishUrl = `${window.location.origin}/d/${publicDishId}`
    qrDataUrl.value = await QRCode.toDataURL(dishUrl, { width: 400, margin: 2 })
  }
})
```

- [ ] **Step 2: Replace the desktop AR CTA card with QR fallback**

In the template, replace the AR CTA section (lines 216-236) with a version that shows QR on desktop and the AR button on mobile:

Replace:
```html
        <!-- AR CTA (desktop) -->
        <div
          v-if="dish.hasModel"
          class="mt-10 p-8 rounded relative overflow-hidden text-ink-inv"
          style="background: #2b1f15;"
        >
          <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(circle at 80% 50%, rgba(184, 122, 78, 0.4), transparent 55%);" />
          <h4 class="relative font-display font-normal text-2xl tracking-[-0.015em] mb-2" style="color: #f3ede2;">
            Se den på <span class="italic text-clay-soft">jeres bord</span>.
          </h4>
          <p class="relative text-sm leading-[1.5] mb-6 max-w-[380px]" style="color: rgba(243, 237, 226, 0.7);">
            Scan QR-koden med kameraet -- modellen placerer sig direkte foran dig i AR.
          </p>
          <button
            type="button"
            class="relative inline-flex items-center gap-3.5 px-7 py-4.5 rounded-full font-medium text-[15px] transition hover:-translate-y-px"
            style="background: #d4a880; color: #2b1f15;"
            @click="onArClicked"
          >
            <span>View in AR</span>
          </button>
        </div>
```
With:
```html
        <!-- AR CTA -->
        <div
          v-if="dish.hasModel"
          class="mt-10 p-8 rounded relative overflow-hidden text-ink-inv"
          style="background: #2b1f15;"
        >
          <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(circle at 80% 50%, rgba(184, 122, 78, 0.4), transparent 55%);" />
          <h4 class="relative font-display font-normal text-2xl tracking-[-0.015em] mb-2" style="color: #f3ede2;">
            Se den på <span class="italic text-clay-soft">jeres bord</span>.
          </h4>

          <!-- Mobile: AR button -->
          <template v-if="isMobile">
            <p class="relative text-sm leading-[1.5] mb-6 max-w-[380px]" style="color: rgba(243, 237, 226, 0.7);">
              Tryk for at åbne AR og se retten på dit bord.
            </p>
            <button
              type="button"
              class="relative inline-flex items-center gap-3.5 px-7 py-4.5 rounded-full font-medium text-[15px] transition hover:-translate-y-px"
              style="background: #d4a880; color: #2b1f15;"
              @click="onArClicked"
            >
              <span>View in AR</span>
            </button>
          </template>

          <!-- Desktop: QR code -->
          <template v-else>
            <p class="relative text-sm leading-[1.5] mb-6 max-w-[380px]" style="color: rgba(243, 237, 226, 0.7);">
              Scan med din telefon for at se retten på dit bord.
            </p>
            <div v-if="qrDataUrl" class="relative">
              <img :src="qrDataUrl" alt="QR code" class="w-[160px] h-[160px] rounded-lg" />
            </div>
          </template>
        </div>
```

- [ ] **Step 3: Commit**

```bash
git add app/pages/d/[publicDishId].vue
git commit -m "feat: show QR code for desktop visitors on public dish page"
```

---

### Task 5: Default scaleCm on Dish Creation

**Files:**
- Modify: `server/database/schema.ts:59`
- Modify: `server/api/dishes/index.post.ts:56-66`
- Create: `server/database/migrations/0005_default_scale_cm.sql`

- [ ] **Step 1: Update schema default**

In `server/database/schema.ts`, change line 59:

Replace:
```typescript
  scaleCm: real('scale_cm'),
```
With:
```typescript
  scaleCm: real('scale_cm').default(24),
```

- [ ] **Step 2: Add the database migration**

Create `server/database/migrations/0005_default_scale_cm.sql`:

```sql
ALTER TABLE "dishes" ALTER COLUMN "scale_cm" SET DEFAULT 24;
UPDATE "dishes" SET "scale_cm" = 24 WHERE "scale_cm" IS NULL;
```

- [ ] **Step 3: Explicitly set scaleCm on dish creation**

In `server/api/dishes/index.post.ts`, add `scaleCm: 24` to the insert values (line 56-66):

Replace:
```typescript
  const [created] = await db
    .insert(dishes)
    .values({
      restaurantId: body.restaurantId,
      publicDishId,
      name: body.name,
      shortDescription: body.shortDescription ?? null,
      priceText: body.priceText ?? null,
      allergens: body.allergens ?? null,
      ingredients: body.ingredients ?? null,
      status: 'draft',
      createdByUserId: user.id,
    })
    .returning()
```
With:
```typescript
  const [created] = await db
    .insert(dishes)
    .values({
      restaurantId: body.restaurantId,
      publicDishId,
      name: body.name,
      shortDescription: body.shortDescription ?? null,
      priceText: body.priceText ?? null,
      allergens: body.allergens ?? null,
      ingredients: body.ingredients ?? null,
      scaleCm: 24,
      status: 'draft',
      createdByUserId: user.id,
    })
    .returning()
```

- [ ] **Step 4: Commit**

```bash
git add server/database/schema.ts server/database/migrations/0005_default_scale_cm.sql server/api/dishes/index.post.ts
git commit -m "feat: default scaleCm to 24cm for new dishes and backfill nulls"
```

---

### Task 6: Publishing Nudge for Default scaleCm

**Files:**
- Modify: `app/components/admin/PublishControls.vue`

- [ ] **Step 1: Add scaleCm to the component props**

In `PublishControls.vue`, add `scaleCm` to the `DishForPublish` interface (lines 102-109):

Replace:
```typescript
interface DishForPublish {
  id: string
  publicDishId: string
  name: string
  status: string
  posterUrl: string | null
  previewModelGlbUrl: string | null
}
```
With:
```typescript
interface DishForPublish {
  id: string
  publicDishId: string
  name: string
  status: string
  posterUrl: string | null
  previewModelGlbUrl: string | null
  scaleCm: number | null
}
```

- [ ] **Step 2: Add the scaleCm confirmation to the publish handler**

In `PublishControls.vue`, update the `handlePublish` function (lines 201-213):

Replace:
```typescript
async function handlePublish() {
  publishing.value = true
  actionError.value = ''
  try {
    await $fetch(`/api/dishes/${props.dish.id}/publish`, { method: 'POST' })
    emit('published')
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    actionError.value = e?.data?.message ?? e?.message ?? 'Failed to publish dish.'
  } finally {
    publishing.value = false
  }
}
```
With:
```typescript
async function handlePublish() {
  const scale = props.dish.scaleCm
  if (scale === null || scale === 24) {
    const confirmed = confirm('Tallerken-størrelsen er sat til 24 cm \u2014 passer det til denne ret?')
    if (!confirmed) return
  }

  publishing.value = true
  actionError.value = ''
  try {
    await $fetch(`/api/dishes/${props.dish.id}/publish`, { method: 'POST' })
    emit('published')
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    actionError.value = e?.data?.message ?? e?.message ?? 'Failed to publish dish.'
  } finally {
    publishing.value = false
  }
}
```

- [ ] **Step 3: Pass scaleCm from the parent dish edit page**

In `app/pages/platform/dishes/[id].vue`, the `AdminPublishControls` component already receives `:dish="dish"` and the `DishDetail` interface already includes `scaleCm: number | null` (line 285). No change needed — the prop is already passed through.

Verify by checking that the `DishDetail` interface in `app/pages/platform/dishes/[id].vue` includes `scaleCm`:
```typescript
interface DishDetail {
  // ...
  scaleCm: number | null
  // ...
}
```

This already exists on line 285. No code change needed for the parent.

- [ ] **Step 4: Commit**

```bash
git add app/components/admin/PublishControls.vue
git commit -m "feat: nudge restaurant owner to confirm scaleCm before publishing"
```

---

### Task 7: Migration Script for Existing Models

**Files:**
- Create: `scripts/normalize-existing-models.ts`

- [ ] **Step 1: Create the migration script**

Create `scripts/normalize-existing-models.ts`:

```typescript
/**
 * One-time migration: re-compress all existing GLB models with normalization.
 *
 * Usage: npx tsx scripts/normalize-existing-models.ts
 *
 * This script:
 * 1. Queries all dishes with a previewModelGlbUrl
 * 2. Downloads each GLB from storage
 * 3. Runs the updated compressGlb (which now includes normalization)
 * 4. Re-uploads the normalized GLB
 * 5. Logs before/after dimensions
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
```

- [ ] **Step 2: Verify it can be run**

Run a dry check (this won't actually process models without the database connection, but verifies the script compiles):

```bash
npx tsx --version
```

Expected: Prints the tsx version (already installed as a project dependency).

- [ ] **Step 3: Commit**

```bash
git add scripts/normalize-existing-models.ts
git commit -m "feat: add migration script to normalize existing GLB models"
```

---

## Deployment Order

1. Deploy **Task 1** (worker normalization) — all new models from this point on are normalized
2. Deploy **Tasks 2-3** (client-side scale fix) — new models display correctly, old models display at 24cm default (reasonable)
3. Deploy **Task 5** (schema default) — run the migration SQL
4. Deploy **Task 4** (desktop QR fallback) and **Task 6** (publish nudge) — UX improvements
5. Run **Task 7** (migration script) — normalize existing models so they display at exact size
