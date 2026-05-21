# Codebase Structure

**Analysis Date:** 2026-05-21

## Directory Layout

```
/c/repos/PopPlate/
├── app/                    # Nuxt frontend app
│   ├── assets/             # Static CSS, images
│   ├── components/         # Vue components (organized by domain)
│   ├── composables/        # Vue 3 composables
│   ├── layouts/            # Page layouts (platform, public)
│   ├── middleware/         # Route middleware
│   ├── pages/              # File-based routing (Nuxt)
│   ├── plugins/            # Nuxt plugins
│   ├── types/              # TypeScript types (design system types)
│   └── app.vue             # Root component
├── server/                 # Backend (Nitro/H3)
│   ├── api/                # REST endpoint handlers
│   ├── database/           # Drizzle ORM schema & migrations
│   ├── middleware/         # Server-side middleware
│   ├── routes/             # Custom routes (if any)
│   └── utils/              # Shared utilities
├── worker/                 # Background job processor
├── types/                  # Shared types (root-level)
├── public/                 # Static assets
├── docs/                   # Documentation
├── nuxt.config.ts          # Nuxt configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── drizzle.config.ts       # Drizzle ORM configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies
```

## Directory Purposes

**`app/`:**
- Purpose: Nuxt 4 frontend application
- Contains: Pages, components, composables, layouts
- Key files: `app.vue` (root), `nuxt.config.ts`

**`app/pages/`:**
- Purpose: File-based routing; each `.vue` file becomes a route
- Contains: Public routes (`index.vue`, `r/[slug].vue`, `d/[publicDishId].vue`, `pricing.vue`) and protected platform routes (`/platform/*`)
- Naming: Nuxt convention — `[param].vue` creates dynamic routes, nested folders become path segments

**`app/components/`:**
- Purpose: Reusable Vue components
- Organization:
  - `admin/` - 5 components for dish generation UI (ImageUploader, GenerationStatus, PublishControls, etc.)
  - `platform/` - 11 dashboard/admin UI components (TopBar, Sidebar, DishTable, StatCard, QrCode, etc.)
  - `restaurant/` - 4 public menu UI components (RestaurantHeader, DishCard, DishModal, CategoryNav)
  - `shared/` - 4 universal components (Icon, LogoMark, DockNav)
  - `viewer/` - 2 3D viewing components (DishViewer for model-viewer, ArButton)

**`app/composables/`:**
- Purpose: Vue 3 composables (reusable logic)
- Files: `useAuth.ts` (session/auth state), `useAuthFetch.ts` (fetch with auth headers)
- Usage: Imported in pages/components via `useAuth()` or `useAuthFetch()`

**`app/layouts/`:**
- Purpose: Wrapper layouts for pages
- Files:
  - `platform.vue` - Admin dashboard layout (sidebar, top bar, grid)
  - `public.vue` - Public site layout
- Usage: Declared via `definePageMeta({ layout: 'platform' })`

**`app/middleware/`:**
- Purpose: Route guards and navigation hooks
- Files: `auth.global.ts` - Protects `/platform/*` routes, redirects to login if unauthenticated
- Execution: Runs on every navigation for this project

**`app/types/`:**
- Purpose: Frontend-specific TypeScript types
- Files: `popplate.ts` - Design system types (`Dish`, `Restaurant`, `User`, `MenuSection`, `DishStatus`, `SidebarKey`)
- Note: Domain types for UI shape; not shared with backend (backend uses database schema directly)

**`server/api/`:**
- Purpose: REST API endpoints (Nitro file-based routing)
- Organization: Mirrors REST structure — `/auth/`, `/dishes/`, `/restaurants/`, `/public/`, `/upload/`, `/user/`
- Naming: `[method].[verb].ts` pattern (e.g., `dishes/[id].post.ts`, `auth/login.get.ts`)
- Count: 35 endpoints total
- Pattern: Each handler is a `defineEventHandler` with request validation, auth checks, DB operations

**`server/api/auth/`:**
- Purpose: Authentication & session endpoints
- Endpoints:
  - `login.post.ts`, `logout.post.ts` - Direct auth (if enabled)
  - `session.get.ts` - Current session state
  - `authentik/login.get.ts`, `authentik/signup.get.ts` - OAuth redirects to Authentik
  - `callback/authentik.get.ts` - OAuth callback handler

**`server/api/dishes/`:**
- Purpose: Authenticated dish CRUD and generation workflow
- Endpoints:
  - `index.get.ts` - List user's dishes (with tier-based filtering)
  - `index.post.ts` - Create dish (checks tier limits)
  - `[id].get.ts`, `[id].put.ts`, `[id].delete.ts` - Single dish CRUD
  - `[id]/generate.post.ts` - Trigger 3D generation (validates images, checks in-flight jobs, tier limits)
  - `[id]/publish.post.ts`, `[id]/unpublish.post.ts` - Toggle dish public status
  - `[id]/qr.get.ts` - Generate QR code for dish public link
  - `[id]/analytics.get.ts` - Dish view/scan metrics
  - `[id]/images.get.ts`, `[id]/images/[imageId].delete.ts` - Manage source images
  - `[id]/jobs.get.ts` - Generation job history
  - `[id]/model/[ext].get.ts`, `[id]/model/[ext].head.ts` - Download 3D model file (GLB, USDZ)

**`server/api/restaurants/`:**
- Purpose: Authenticated restaurant CRUD
- Endpoints:
  - `index.get.ts`, `index.post.ts` - List/create restaurants
  - `[slug].get.ts`, `[slug].patch.ts`, `[slug].delete.ts` - Single restaurant CRUD
  - `[slug]/dishes.get.ts` - List dishes in restaurant

**`server/api/public/`:**
- Purpose: Unauthenticated public endpoints (no auth required)
- Endpoints:
  - `restaurants/[slug]/menu.get.ts` - Get published dishes for restaurant
  - `dishes/[publicDishId].get.ts` - Get single dish details via public ID
  - `analytics.post.ts` - Track dish views/interactions

**`server/api/upload/`:**
- Purpose: File upload handling
- Endpoints: `image.post.ts` - Upload dish source images to S3

**`server/api/user/`:**
- Purpose: Authenticated user profile endpoints
- Endpoints: `profile.get.ts`, `profile.patch.ts` - Fetch/update current user

**`server/database/`:**
- Purpose: Drizzle ORM schema and database access
- Files:
  - `schema.ts` - Table definitions and relations (8 tables: restaurants, users, dishes, dishSourceImages, generationJobs, qrCodes, analyticsEvents)
  - `index.ts` - Singleton `db` instance exported via Proxy (prevents multiple connections in dev)
  - `migrations/` - Auto-generated migration files
- Pattern: Singleton pattern to avoid connection leaks during Nuxt HMR

**`server/utils/`:**
- Purpose: Shared server utilities
- Files:
  - `auth.ts` - Session/auth helpers (`requireAuth`, `getSessionUser`, `checkPassword`, `getDbUser`)
  - `access.ts` - Permission checks (`hasUnlimitedAccess`)
  - `authentik.ts` - Authentik OAuth integration (token exchange, user provisioning)
  - `auth.ts` - Core session utilities
  - `dish-ownership.ts` - Validate dish ownership
  - `restaurant-ownership.ts` - Validate restaurant ownership
  - `tiers.ts` - Tier-based limits and feature flags
  - `storage.ts` - S3 client and operations (upload, download, presigned URLs, URL validation)
  - `storage-keys.ts` - S3 key naming conventions
  - `meshy.ts` - Meshy API client for image-to-3D
  - `generation-timeout.ts` - Job recovery and reconciliation logic
  - `public-url.ts` - URL construction utilities
  - `model-proxy.ts` - Proxy 3D model downloads from S3
  - `inline-assets.ts` - CSS/asset inlining utilities

**`worker/`:**
- Purpose: Background job processing (optional/future)
- Likely contains: Job handlers, polling logic, reconciliation

**`public/`:**
- Purpose: Static assets (images, fonts, manifests)

**`docs/`:**
- Purpose: Project documentation
- Contains: 3D food generation guides, Authentik theme docs

**`types/`:**
- Purpose: Root-level shared types (if any cross-app types)

## Key File Locations

**Entry Points:**
- `app/app.vue` - Nuxt root component
- `nuxt.config.ts` - Nuxt configuration (SSR enabled, Tailwind + Auth modules, Vue config for model-viewer)
- `server/middleware/` - Server-side middleware (if any)

**Configuration:**
- `nuxt.config.ts` - App config (SSR, modules, runtimeConfig, CSS)
- `tailwind.config.ts` - Design tokens (warm clay color palette, typography)
- `drizzle.config.ts` - DB connection and schema location
- `tsconfig.json` - TypeScript reference configs (delegated to .nuxt/*.json)

**Core Logic:**
- `server/database/schema.ts` - Data model and relationships
- `server/utils/auth.ts` - Authentication logic
- `server/utils/storage.ts` - S3 integration
- `server/utils/meshy.ts` - 3D generation API client
- `server/utils/generation-timeout.ts` - Job reconciliation and timeout recovery

**Testing:**
- No dedicated test directory; no test files found in codebase

## Naming Conventions

**Files:**
- API handlers: `[resource]/[action].[method].ts` (e.g., `dishes/[id].get.ts`)
- Components: PascalCase `.vue` files (e.g., `DishCard.vue`, `StatusBadge.vue`)
- Composables: `use[Feature].ts` (e.g., `useAuth.ts`, `useAuthFetch.ts`)
- Utilities: lowercase with hyphens (e.g., `dish-ownership.ts`, `generation-timeout.ts`)
- Pages: Kebab-case for static routes, `[param]` for dynamic (e.g., `[slug].vue`, `public-menu.vue`)

**Directories:**
- Features grouped by domain (e.g., `components/admin/`, `components/restaurant/`, `server/api/dishes/`)
- Middleware placed in `app/middleware/` or `server/middleware/`

**Functions & Variables:**
- camelCase for functions and variables (e.g., `requireAuth`, `createImageTo3DTask`, `dishSourceImages`)
- PascalCase for types and interfaces (e.g., `SessionUser`, `MeshyTaskStatus`, `Dish`)
- UPPER_CASE for constants where appropriate (e.g., `MESHY_API_KEY`, `MESHY_BASE_URL`)

## Where to Add New Code

**New API Endpoint:**
- Create file: `server/api/[resource]/[action].[method].ts`
- Pattern: Wrap with `defineEventHandler`, call `requireAuth()` if protected, use `readBody()` for request data
- Example: `server/api/dishes/[id]/archive.post.ts`
- Tests: No test directory; suggest adding to `tests/` if testing added

**New Component:**
- Create file: `app/components/[category]/[ComponentName].vue`
- Example: `app/components/admin/SettingsPanel.vue`
- Import in page/parent component via auto-import

**New Composable:**
- Create file: `app/composables/use[Feature].ts`
- Example: `app/composables/useDishForm.ts`
- Export function(s) that provide state/methods

**New Page:**
- Create file: `app/pages/[path]/[name].vue`
- Use `definePageMeta({ layout: 'platform' })` for authenticated pages
- Global middleware enforces auth for `/platform/*`

**New Database Entity:**
- Add table definition to `server/database/schema.ts`
- Add relations export (e.g., `export const examplesRelations = relations(examples, ...)`)
- Run `npm run db:generate` to create migration
- Run `npm run db:migrate` to apply

**Utilities:**
- New logic files: `server/utils/[feature].ts`
- Pattern: Export pure functions or async functions
- Import and use in event handlers

**Styling:**
- Global styles: `app/assets/css/main.css`
- Component styles: Inline `<style scoped>` in `.vue` files
- Tailwind customization: `tailwind.config.ts` (colors, fonts already defined)

## Special Directories

**`.nuxt/`:**
- Purpose: Generated Nuxt build artifacts (TypeScript, manifest, etc.)
- Generated: Yes
- Committed: No (in .gitignore)

**`.env`:**
- Purpose: Environment variables (see `.env.example`)
- Generated: No
- Committed: No (in .gitignore)
- Required vars: `DATABASE_URL`, `MESHY_API_KEY`, S3 credentials, Authentik config

**`node_modules/`:**
- Purpose: Installed dependencies
- Generated: Yes (via npm install)
- Committed: No

**`server/database/migrations/`:**
- Purpose: Database migration files (auto-generated by Drizzle Kit)
- Generated: Yes (via `npm run db:generate`)
- Committed: Yes (required for deployments)

---

*Structure analysis: 2026-05-21*
