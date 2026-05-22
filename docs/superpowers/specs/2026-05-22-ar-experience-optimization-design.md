# AR Experience Optimization

## Problem

3D models from Meshy have arbitrary native sizes. The current scaling logic in `DishViewer.vue` has a circular math bug — `getDimensions()` returns size at current scale, and the normalization formula cancels itself out. Result: models appear ~10x too large in AR, spawn at origin instead of on a surface, and the `scaleCm` input field has no reliable effect.

iOS Quick Look uses the USDZ file directly with baked-in size, so client-side scaling doesn't reach it at all.

## Solution: Server-Side Model Normalization

Normalize every GLB to exactly 1 meter width during the worker compression pipeline. Client-side scaling becomes `scaleCm / 100`. USDZ inherits the normalized size from the GLB.

## Scope

All AR-specific UX changes (auto-activation, placement, QR fallback) apply only to the public dish page (`/d/[publicDishId]`). The admin dish edit page keeps its current 3D preview behavior. The scale fix itself (normalized models + correct math) naturally applies everywhere the viewer is used.

---

## 1. Worker Pipeline: GLB Normalization

**File:** `worker/utils/compress-glb.ts`

After the existing transforms (dedup, prune, flatten, join, texture compress), add a normalization step:

1. Measure the model's axis-aligned bounding box and take the maximum horizontal dimension (`max(X, Z)`) — Meshy models may not be consistently oriented
2. Calculate uniform scale factor: `1.0 / maxHorizontalDim`
3. Apply the scale to the root node via glTF Transform

The USDZ is generated from the normalized GLB, so it inherits the correct size automatically.

**Result:** Every model in storage is exactly 1 meter wide, regardless of Meshy output. File size is unchanged — normalization only modifies transform values, not mesh/texture data.

## 2. Client-Side Scale (DishViewer.vue)

**File:** `app/components/viewer/DishViewer.vue`

Remove the `handleLoad` measurement/normalization logic (lines 124-143) and the `measuredScale` ref. The scale attribute becomes:

```
scale = scaleCm / 100
```

A 24cm plate = `scale="0.24 0.24 0.24"`.

**Default fallback:** If `scaleCm` is null, default to `0.24` (24cm) instead of the current `0.05` (5cm).

**Files also affected:**
- `app/pages/d/[publicDishId].vue` — update `viewerScale` computed default from `0.05` to `0.24`
- `app/pages/platform/dishes/[id].vue` — same default update

## 3. AR Placement

**File:** `app/components/viewer/DishViewer.vue`

Add `ar-placement="floor"` to the `<model-viewer>` element. Combined with the existing `ar-scale="fixed"`, this tells all AR modes (WebXR, Scene Viewer, Quick Look) to place the model on the first detected horizontal surface (the table).

The existing auto-activation flow on mobile (`/d/[publicDishId]`) stays the same — the model loads, AR launches automatically. The difference is the model now appears at the correct real-world size, sitting on the table.

## 4. Desktop/No-AR Fallback (Public Dish Page Only)

**File:** `app/pages/d/[publicDishId].vue`

When on desktop (AR unavailable):
- Keep the 3D viewer on the left + info panel on the right (current layout)
- Replace the "View in AR" button in the AR CTA card with the dish's QR code and text: "Scan med din telefon for at se retten pa dit bord"
- Use the existing QR code data from the public dish endpoint (or generate client-side from the current URL)

When on mobile but AR fails (`arFallbackVisible` path):
- Show the 3D viewer with a message that AR isn't supported on their device (current behavior, unchanged)

## 5. Default scaleCm & Publishing Gate

**Database default:** New dishes get `scaleCm = 24` instead of null.

**Publishing nudge:** When publishing and `scaleCm` is still the default 24 (i.e., the owner hasn't explicitly changed it), show a confirmation: "Tallerken-storrelsen er sat til 24 cm -- passer det til denne ret?" with options to continue or adjust. If the owner has manually set any value, no prompt.

**Validation:** Keep existing 1-200cm range. Block publishing if `scaleCm` is null (safety net).

## 6. Migration of Existing Models

One-time script to normalize all existing dishes:

1. Query all dishes with a `previewModelGlbUrl`
2. For each dish: download GLB from storage, run normalization (measure width, scale to 1m), re-upload GLB
3. Regenerate USDZ from the normalized GLB
4. Log before/after dimensions per dish
5. Skip on error, continue to next dish

The script can be re-run safely — normalizing an already-normalized model (1m wide) is a no-op.

**Timing:** Run after deploying updated worker code. Can ship alongside client changes since the 24cm default means existing dishes display at a reasonable size even before migration.

---

## Files Changed

| File | Change |
|---|---|
| `worker/utils/compress-glb.ts` | Add normalization step after existing transforms |
| `app/components/viewer/DishViewer.vue` | Remove measurement logic, add `ar-placement="floor"`, update default scale |
| `app/pages/d/[publicDishId].vue` | Update default scale, add QR fallback for desktop |
| `app/pages/platform/dishes/[id].vue` | Update default scale |
| `server/database/schema.ts` | Default `scaleCm` to 24 |
| New: `scripts/normalize-existing-models.ts` | One-time migration script |
