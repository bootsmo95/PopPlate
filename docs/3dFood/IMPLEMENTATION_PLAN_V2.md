# IMPLEMENTATION_PLAN_V2

## Objective
Build the PopPlate MVP: image upload → generation → preview → publish → QR → guest AR/3D experience. One pilot restaurant, 3-5 dishes.

## Stack
- Nuxt 4 (Vue 3 + TypeScript + Tailwind CSS v4)
- PostgreSQL + Drizzle ORM
- S3-compatible storage (MinIO on Coolify)
- PlayCanvas for 3D viewing
- Coolify for deployment

## Task Execution Order
Tasks respect the dependency graph from AGENT_SWARM_BOARD.md. Spec tasks (A1-A5) are already completed via project docs.

---

## Task 1: Scaffold Nuxt 4 App (B1)

**Goal:** Create the foundational Nuxt app that everything builds on.

**Steps:**
1. Initialize Nuxt project in repo root using `npx nuxi@latest init . --force` (repo has existing files)
2. Install dependencies: `@nuxtjs/tailwindcss`
3. Configure `nuxt.config.ts`:
   - Enable TypeScript strict mode
   - Add Tailwind CSS module
   - Set `compatibilityDate` for Nuxt 4
   - SSR enabled (default)
4. Create directory structure:
   - `app/pages/` — Nuxt routes
   - `app/components/3d/` — viewer UI
   - `app/components/admin/` — dashboard UI
   - `server/api/` — backend routes
   - `server/utils/` — auth/storage helpers
   - `lib/analytics/` — event helpers
   - `types/` — shared TS types
5. Create placeholder pages:
   - `app/pages/index.vue` — landing/redirect
   - `app/pages/admin/index.vue` — admin dashboard
   - `app/pages/d/[publicDishId].vue` — public dish page
6. Create `types/index.ts` with core type definitions from DATA_MODEL.md:
   - Restaurant, User, Dish, DishSourceImage, GenerationJob, QrCode, AnalyticsEvent
   - Status enums: DishStatus, JobStatus
7. Verify app builds with `npm run build`
8. Commit

**Acceptance:**
- `npm run dev` starts without errors
- All three routes resolve
- TypeScript compiles cleanly

---

## Task 2: Auth Foundation (B4)

**Goal:** Simple app-local auth for MVP admin login.

**Steps:**
1. Install `nuxt-auth-utils` (Nuxt's built-in auth utilities)
2. Create `server/utils/auth.ts` with:
   - Session-based auth using secure cookies
   - Login/logout helpers
   - `requireAuth` middleware for protected routes
3. Create `server/api/auth/login.post.ts`:
   - Accept email + password
   - Validate against stored credentials
   - Set session cookie
4. Create `server/api/auth/logout.post.ts`:
   - Clear session
5. Create `server/api/auth/session.get.ts`:
   - Return current user info or 401
6. Create `app/middleware/auth.ts` (client-side route guard):
   - Redirect unauthenticated users to login
7. Add `AUTH_SECRET` to `.env.example`
8. Commit

**Acceptance:**
- Login endpoint sets session cookie
- Protected routes return 401 without valid session
- Logout clears session

---

## Task 3: DB Schema & Migrations (B3)

**Goal:** Create the durable data layer with Drizzle ORM.

**Steps:**
1. Install `drizzle-orm`, `drizzle-kit`, `postgres` (pg driver)
2. Create `server/database/schema.ts` with all tables from DATA_MODEL.md:
   - `restaurants` (id, name, slug, status, createdAt, updatedAt)
   - `users` (id, restaurantId FK, email, displayName, role, isPayingUser, passwordHash, createdAt, updatedAt)
   - `dishes` (id, restaurantId FK, publicDishId, name, shortDescription, priceText, allergens, ingredients, status enum, posterUrl, previewModelGlbUrl, previewModelUsdzUrl, scaleCm, createdByUserId FK, createdAt, updatedAt, publishedAt)
   - `dishSourceImages` (id, dishId FK, storageKey, imageUrl, sortOrder, createdAt)
   - `generationJobs` (id, dishId FK, jobType, status enum, attemptNumber, requestedByUserId FK, inputVersion, outputPreviewModelGlbUrl, outputPreviewModelUsdzUrl, outputPosterUrl, errorCode, errorMessage, startedAt, completedAt, createdAt, updatedAt)
   - `qrCodes` (id, dishId FK, publicUrl, imageUrl, createdAt)
   - `analyticsEvents` (id, restaurantId FK, dishId FK, eventType, sessionId, userAgent, referrer, createdAt)
3. Create `server/database/index.ts` — Drizzle client setup using `DATABASE_URL`
4. Create `drizzle.config.ts` for migrations
5. Add `DATABASE_URL` to `.env.example`
6. Generate initial migration with `npx drizzle-kit generate`
7. Commit

**Acceptance:**
- Schema matches DATA_MODEL.md exactly
- Migration SQL generates without errors
- Drizzle client connects (tested via a simple API route or build check)

---

## Task 4: Storage Integration (D2)

**Goal:** S3-compatible file upload/download for source images and generated assets.

**Steps:**
1. Install `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`
2. Create `server/utils/storage.ts` with helpers:
   - `uploadFile(key, buffer, contentType)` — upload to S3
   - `getSignedUrl(key)` — generate presigned download URL
   - `deleteFile(key)` — delete from S3
   - `getPublicUrl(key)` — construct public URL
3. Key structure follows ARCHITECTURE.md:
   - `restaurants/{restaurantId}/dishes/{dishId}/source/{filename}`
   - `restaurants/{restaurantId}/dishes/{dishId}/generated/{filename}`
   - `restaurants/{restaurantId}/dishes/{dishId}/qr/{filename}`
4. Add S3 env vars to `.env.example`: S3_ENDPOINT, S3_REGION, S3_BUCKET, S3_ACCESS_KEY, S3_SECRET_KEY, S3_FORCE_PATH_STYLE
5. Create `server/api/upload/image.post.ts`:
   - Accept multipart file upload
   - Validate file type (.jpg, .jpeg, .png, .webp) and size (max 10MB) per ASSET_SPEC.md
   - Upload to S3 with correct key
   - Return stored URL
6. Commit

**Acceptance:**
- Upload endpoint validates file type and size
- Files are stored with correct key structure
- Presigned URLs are generated correctly

---

## Task 5: Admin Login & Shell Layout (C1)

**Goal:** Admin UI shell with login page and authenticated layout.

**Steps:**
1. Create `app/layouts/admin.vue`:
   - Sidebar navigation (Dishes, Settings placeholder)
   - Top bar with restaurant name + logout
   - Main content area
   - Responsive (mobile hamburger menu)
   - Use Tailwind for styling
2. Create `app/pages/admin/login.vue`:
   - Email + password form
   - Error state display
   - Redirect to /admin/dishes on success
3. Wire auth middleware to all `/admin/*` routes except login
4. Create `app/composables/useAuth.ts`:
   - `login(email, password)`
   - `logout()`
   - `user` ref
   - `isAuthenticated` computed
5. Commit

**Acceptance:**
- Unauthenticated users see login page
- After login, admin shell renders with sidebar
- Logout returns to login page

---

## Task 6: Dish CRUD (C2)

**Goal:** Admin can create, edit, list, and view dishes.

**Steps:**
1. Create `server/api/dishes/index.get.ts` — list dishes for current restaurant
2. Create `server/api/dishes/index.post.ts` — create new dish (draft status)
3. Create `server/api/dishes/[id].get.ts` — get single dish with source images and latest job
4. Create `server/api/dishes/[id].put.ts` — update dish metadata
5. Create `server/api/dishes/[id].delete.ts` — soft delete / archive dish
6. Create `app/pages/admin/dishes/index.vue`:
   - Table/card list of dishes
   - Status badge (draft/processing/failed/ready/published/archived)
   - Link to create new
   - Link to view/edit each
7. Create `app/pages/admin/dishes/new.vue`:
   - Form: name, shortDescription, priceText, allergens, ingredients
   - Save as draft
   - Redirect to dish detail page
8. Create `app/pages/admin/dishes/[id].vue`:
   - Dish detail/edit view
   - Show current status
   - Edit metadata fields
   - Section for source images (wired in Task 7)
   - Section for generation status (wired in Task 9)
   - Section for publish/QR (wired in Task 10)
9. Commit

**Acceptance:**
- Admin can create a dish from the UI
- Dish list shows all dishes with status
- Dish detail page displays metadata and allows editing

---

## Task 7: Multi-Image Upload Flow (C3)

**Goal:** Admin can upload 5-15 source images per dish.

**Steps:**
1. Create `app/components/admin/ImageUploader.vue`:
   - Drag-and-drop zone + file picker
   - Multi-file select
   - Preview thumbnails before upload
   - Progress indicator per file
   - Validate: 5-15 images, accepted formats (.jpg, .jpeg, .png, .webp), max 10MB each
   - Reorder capability (drag sort)
   - Delete individual images
2. Create `server/api/dishes/[id]/images.post.ts`:
   - Accept multiple file uploads
   - Store each via storage util
   - Create DishSourceImage records
   - Return image list
3. Create `server/api/dishes/[id]/images.get.ts`:
   - Return all source images for dish, ordered by sortOrder
4. Create `server/api/dishes/[id]/images/[imageId].delete.ts`:
   - Delete source image record and S3 file
5. Wire ImageUploader into dish detail page (`app/pages/admin/dishes/[id].vue`)
6. Commit

**Acceptance:**
- Can upload multiple images with drag-and-drop
- File validation enforced (type, size, count)
- Images display as thumbnails after upload
- Can delete individual images

---

## Task 8: Worker Service Skeleton (D1)

**Goal:** Background worker that picks up generation jobs and updates status.

**Steps:**
1. Create `worker/` directory at repo root
2. Create `worker/index.ts`:
   - Poll `generationJobs` table for `queued` jobs
   - Mark job as `processing`
   - Execute job handler (placeholder/mock for MVP)
   - On success: mark `ready`, update dish with output URLs
   - On failure: mark `failed`, store error
3. Create `worker/handlers/generate.ts`:
   - MVP mock: wait 5 seconds, copy a sample GLB + poster to generated/ path
   - Log job progress
4. Create `worker/package.json` with TypeScript + shared deps
5. Create `server/api/dishes/[id]/generate.post.ts`:
   - Create new GenerationJob record with status `queued`
   - Increment attemptNumber from latest job
   - Validate dish has minimum 5 source images
   - Return job record
6. Commit

**Acceptance:**
- Generate endpoint creates a queued job
- Worker picks up job and transitions through statuses
- On completion, dish record is updated with asset URLs

---

## Task 9: Generation Status & Retry UI (C4)

**Goal:** Admin sees real-time generation status and can retry.

**Steps:**
1. Create `app/components/admin/GenerationStatus.vue`:
   - Show current job status (queued/processing/failed/ready)
   - Progress indicator for processing state
   - Error message display for failed state
   - "Retry Generation" button (visible when failed or ready)
   - "Start Generation" button (visible when no job exists and enough images uploaded)
2. Create `server/api/dishes/[id]/jobs.get.ts`:
   - Return generation job history for dish
   - Include latest job status
3. Wire GenerationStatus into dish detail page
4. Add polling or SSE for status updates while processing
5. Commit

**Acceptance:**
- Status displays correctly for each job state
- Retry creates a new job
- UI updates when job completes

---

## Task 10: Publish/Unpublish & QR UI (C5)

**Goal:** Admin can publish dishes and get QR codes.

**Steps:**
1. Create `server/api/dishes/[id]/publish.post.ts`:
   - Validate publish gate (ASSET_SPEC.md): status must be `ready`, preview asset exists, poster exists, dish has name
   - Set dish status to `published`, set publishedAt
   - Generate QR code pointing to `/d/{publicDishId}`
   - Store QR image in S3
   - Create QrCode record
2. Create `server/api/dishes/[id]/unpublish.post.ts`:
   - Set dish status back to `ready`
3. Install `qrcode` package for QR generation
4. Create `app/components/admin/PublishControls.vue`:
   - "Publish" button (when status is `ready`)
   - "Unpublish" button (when status is `published`)
   - Show public URL with copy button
   - Show QR code image with download button
   - Publish gate validation messages
5. Wire PublishControls into dish detail page
6. Commit

**Acceptance:**
- Publish validates all gates before allowing
- QR code is generated and downloadable
- Public URL is copyable
- Unpublish reverts status

---

## Task 11: Public Dish Page (E1)

**Goal:** Guest-facing page at `/d/[publicDishId]` that loads without auth.

**Steps:**
1. Create `server/api/public/dishes/[publicDishId].get.ts`:
   - Fetch dish by publicDishId
   - Only return published dishes
   - Return: name, shortDescription, priceText, allergens, posterUrl, previewModelGlbUrl, previewModelUsdzUrl
   - No auth required
2. Build `app/pages/d/[publicDishId].vue`:
   - Mobile-first layout
   - Dish name, description, price, allergens
   - Poster image as hero
   - 3D viewer section (wired in Task 12)
   - AR button section (wired in Task 13)
   - Clean, premium feel with Tailwind
   - Loading state
   - 404 state for unpublished/missing dishes
3. Create `app/layouts/public.vue`:
   - Minimal layout (no admin chrome)
   - PopPlate branding footer
4. Commit

**Acceptance:**
- Page loads without authentication
- Dish info displays correctly
- 404 shown for non-existent or unpublished dishes
- Mobile-first responsive design

---

## Task 12: 3D Viewer Integration (E2)

**Goal:** Embed a 3D GLB model viewer on the public dish page.

**Steps:**
1. Install `@google/model-viewer` (simpler than PlayCanvas for MVP, web component)
2. Create `app/components/3d/DishViewer.vue`:
   - Wrap `<model-viewer>` web component
   - Props: glbUrl, posterUrl, alt text
   - Auto-rotate enabled
   - Camera controls (touch rotate/zoom)
   - Poster image shown while loading
   - Loading progress indicator
   - Responsive sizing (full width on mobile)
   - Error state if model fails to load
3. Wire DishViewer into public dish page
4. Wire DishViewer into admin preview section (dish detail page)
5. Commit

**Note:** Using `<model-viewer>` instead of PlayCanvas for MVP simplicity. It handles GLB loading, touch controls, and AR natively. PlayCanvas can be evaluated for future iterations.

**Acceptance:**
- GLB model loads and renders on mobile
- Touch controls work (rotate, zoom)
- Poster shows during loading
- Graceful error handling

---

## Task 13: AR Entry Logic (E3)

**Goal:** AR button that works on supported devices with clean fallback.

**Steps:**
1. Extend `app/components/3d/DishViewer.vue`:
   - `<model-viewer>` has built-in AR support via `ar` attribute
   - Enable AR with `ar ar-modes="webxr scene-viewer quick-look"`
   - iOS: Quick Look with USDZ (if available) or GLB fallback
   - Android: Scene Viewer
   - Unsupported: hide AR button, 3D viewer remains fully functional
2. Create `app/components/3d/ArButton.vue`:
   - Custom styled AR CTA button
   - "View in AR" / "Place on table" text
   - Only visible when AR is supported (detect via model-viewer)
   - Slot into model-viewer's AR button slot
3. Add device detection utility `lib/device.ts`:
   - `isArSupported()` — check if device/browser supports any AR mode
   - `getArMode()` — return best AR mode for current device
4. Commit

**Acceptance:**
- AR button appears on supported devices
- AR launches correctly on iOS (Quick Look) and Android (Scene Viewer)
- AR button hidden on unsupported devices
- 3D viewer works perfectly without AR

---

## Task 14: Analytics Event Capture (E4)

**Goal:** Track page_open, viewer_loaded, ar_launch_clicked per ANALYTICS_SPEC.md.

**Steps:**
1. Create `lib/analytics/events.ts`:
   - `trackPageOpen(dishId, restaurantId)` — fire on page load
   - `trackViewerLoaded(dishId, restaurantId)` — fire when 3D viewer renders
   - `trackArLaunchClicked(dishId, restaurantId)` — fire on AR button click
   - Generate lightweight sessionId (stored in sessionStorage)
   - Collect userAgent and referrer
2. Create `server/api/public/analytics.post.ts`:
   - Accept event payload
   - Validate eventType is one of: page_open, viewer_loaded, ar_launch_clicked
   - Insert into analyticsEvents table
   - No auth required
   - Rate-limit consideration (basic IP-based throttle)
3. Wire analytics calls into public dish page:
   - page_open on mount
   - viewer_loaded on model-viewer load event
   - ar_launch_clicked on AR button click
4. Create `app/pages/admin/dishes/[id].vue` analytics section:
   - Show per-dish counts: page opens, viewer loads, AR launches
5. Create `server/api/dishes/[id]/analytics.get.ts`:
   - Return aggregated counts per event type for dish
6. Commit

**Acceptance:**
- Events are recorded on each user action
- Analytics counts visible in admin dish detail
- No personal data collected (anonymous sessionId only)

---

## Task 15: Wire Admin Preview to Generated Output (F1)

**Goal:** Admin can preview the 3D model before publishing.

**Steps:**
1. Add preview section to `app/pages/admin/dishes/[id].vue`:
   - Show DishViewer component with latest generated GLB
   - Show poster image
   - "Accept & Publish" button (triggers publish flow)
   - "Retry Generation" button (triggers new job)
   - Side-by-side: source images vs generated preview
2. Ensure dish detail page shows complete lifecycle:
   - Source images (from Task 7)
   - Generation status (from Task 9)
   - Preview viewer (this task)
   - Publish controls (from Task 10)
3. Commit

**Acceptance:**
- Admin sees 3D preview of generated asset
- Admin can accept or retry from preview
- Full dish lifecycle visible on one page

---

## Seed Data

After all tasks, create a seed script:
1. Create `server/database/seed.ts`:
   - Create one restaurant ("Demo Restaurant")
   - Create one admin user (email: admin@popplate.dk, password: admin123)
   - Create 3 sample dishes with placeholder data
2. Add `npm run db:seed` script

---

## Final Verification

After all tasks complete:
- Full admin flow: login → create dish → upload images → generate → preview → publish → QR
- Full guest flow: scan QR → dish page → 3D viewer → AR (on supported device)
- Analytics recording and display
- Build succeeds (`npm run build`)
- No TypeScript errors
