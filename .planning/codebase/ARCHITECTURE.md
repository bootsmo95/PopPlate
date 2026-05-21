# Architecture

**Analysis Date:** 2026-05-21

## Pattern Overview

**Overall:** Full-stack Nuxt 4 monolith with clear separation between frontend, backend API layer, and background job processing.

**Key Characteristics:**
- Full-stack TypeScript with strict mode enabled
- Universal rendering (SSR enabled) for platform pages
- Event-driven architecture with generation job queue
- Tier-based feature access control
- Multi-restaurant, multi-user SaaS model
- Async image-to-3D generation workflow via Meshy API

## Layers

**Frontend (Vue/Nuxt):**
- Purpose: User interface for both public restaurant menus and admin platform
- Location: `app/pages/`, `app/components/`, `app/composables/`
- Contains: Page routes, Vue components, client-side logic, authentication state
- Depends on: Backend API via `$fetch`, Nuxt utilities, Tailwind CSS
- Used by: Browser clients

**Backend API (Nitro/H3):**
- Purpose: REST endpoints for authentication, dish/restaurant CRUD, generation workflow, analytics
- Location: `server/api/`
- Contains: 35+ event handlers organized by resource (auth, dishes, restaurants, public)
- Depends on: Database, auth utilities, S3 storage, Meshy API
- Used by: Frontend via HTTP, public consumers

**Database Layer (Drizzle ORM):**
- Purpose: PostgreSQL persistence for all domain data
- Location: `server/database/`
- Contains: Schema definitions with relations, migration configs
- Depends on: PostgreSQL client
- Used by: All API endpoints for data access

**Background Jobs (Node.js Worker):**
- Purpose: Long-running 3D model generation, job reconciliation, timeouts
- Location: `worker/`
- Contains: Job processors and utilities
- Depends on: Database, Meshy API, S3 storage
- Used by: Triggered externally on a schedule or by webhook callbacks

**Utilities & Cross-Cutting:**
- Purpose: Auth, access control, ownership validation, tier limits, storage, generation logic
- Location: `server/utils/`
- Contains: 12+ utility modules

## Data Flow

**Dish Generation Workflow:**

1. User uploads 1-4 images via `POST /api/upload/image`
2. Images stored in S3, entries created in `dishSourceImages` table
3. User initiates generation via `POST /api/dishes/[id]/generate`
4. Handler validates ownership, checks tier limits, creates `generationJob` record with status `queued`
5. External hook/worker polls job status via Meshy API
6. When complete, worker updates `generationJob` with output model URLs (GLB, USDZ)
7. Worker reconciles dish status to `ready` or `published` based on latest job
8. Frontend queries `GET /api/dishes/[id]` to fetch current dish + latest job status

**Public Menu Access:**

1. Restaurant page accessed at `/r/[slug]` (public route, no auth required)
2. Client fetches `GET /api/public/restaurants/[slug]/menu` for published dishes
3. Dish detail modal fetches `GET /api/public/dishes/[publicDishId]` for full metadata
4. Analytics event posted to `POST /api/public/analytics` on view/interaction

**Authentication Flow:**

1. User navigates to `/platform/login` or `/platform/signup`
2. Redirects to `GET /api/auth/authentik/login` (Authentik OAuth)
3. Authentik returns user to `GET /api/auth/callback/authentik`
4. Callback validates, creates/updates user session
5. Global middleware (`auth.global.ts`) protects `/platform/*` routes
6. `useAuth()` composable provides session state across app

## Key Abstractions

**Dish:**
- Purpose: Core content entity representing a menu item
- Schema location: `server/database/schema.ts` (tables: `dishes`, `dishSourceImages`, `generationJobs`)
- Pattern: Drizzle ORM with explicit relations; status state machine (draft → processing → ready/failed → published)
- Tied to: Restaurant (owner), User (creator), GenerationJob (async work), QR codes (public sharing)

**Restaurant:**
- Purpose: Container for dishes, owned by a user
- Schema location: `server/database/schema.ts`
- Pattern: Ownership via `ownerId` FK
- Business rule: One user can own multiple restaurants

**GenerationJob:**
- Purpose: Track async 3D model generation requests
- Schema location: `server/database/schema.ts`
- Pattern: Job queue with status tracking, external task ID (Meshy), progress, error details
- Workflow: queued → processing → ready/failed (no terminal state transition needed due to reconciliation)

**SessionUser:**
- Purpose: In-flight user identity for request context
- Location: `server/utils/auth.ts`
- Properties: `id`, `email`, `displayName`, `role`, `accountTier`
- Sourced from: Nuxt Auth Utils session

**TierLimits:**
- Purpose: Enforce feature access based on account tier
- Location: `server/utils/tiers.ts`
- Applied in: Dish creation, generation regeneration endpoints
- Tiers: `free`, `pro`, `studio`, `unlimited`

## Entry Points

**Web Frontend (SSR):**
- Location: `app/app.vue` (Nuxt root component)
- Triggers: Browser request to `/` or `/platform/*`
- Responsibilities: Layout selection, hydration from server state, composable initialization

**API Routes:**
- Location: `server/api/` (file-based routing via Nitro)
- Triggers: HTTP requests matching file paths
- Responsibilities: Request validation, auth checks, DB operations, response

**Background Worker:**
- Location: `worker/index.ts` (if present)
- Triggers: External scheduler or webhook
- Responsibilities: Job status polling, reconciliation, timeout recovery

**Global Middleware (Auth):**
- Location: `app/middleware/auth.global.ts`
- Triggers: Every route navigation
- Responsibilities: Enforce `/platform/*` auth protection, redirect unauthenticated users

## Error Handling

**Strategy:** H3/Nitro event handler error throwing with HTTP status codes.

**Patterns:**

- **400 Bad Request:** Missing required fields or invalid input (`if (!body?.name) throw createError(...)`)
- **401 Unauthorized:** Session missing or invalid (`requireAuth()` throws on missing session)
- **403 Forbidden:** Access denied due to tier limits or ownership check (`requireOwnedDish()` throws on mismatch)
- **409 Conflict:** State violation, e.g., duplicate generation job in flight
- **422 Unprocessable Entity:** Business logic violation, e.g., dish needs 2+ images before generation
- **410 Gone:** Feature disabled, e.g., `POST /api/auth/signup` (Authentik-only)

**Recovery:** No automatic retries in event handlers. Client must check response status and retry if appropriate.

## Cross-Cutting Concerns

**Logging:** `console.*` statements in event handlers and utilities; no structured logging framework detected.

**Validation:**
- Type validation via TypeScript strict mode
- Field presence checks at handler level (`if (!id) throw createError(...)`)
- Business rule checks via utility functions (`requireOwnedDish`, `hasUnlimitedAccess`)
- Image count validation before generation (`dishSourceImages count() < 2`)

**Authentication:**
- Nuxt Auth Utils session-based (cookie-backed)
- Authentik as OAuth provider
- `requireAuth()` guard function used in all protected endpoints

**Authorization:**
- Access checks delegate to utility functions:
  - `requireOwnedDish(dishId, user)` - Verify user's restaurant owns dish
  - `requireAccessibleRestaurant(restaurantId, user)` - Verify user can access restaurant
  - `requireOwnedRestaurant(restaurantId, user)` - Explicit ownership check
  - `hasUnlimitedAccess(user)` - Tier-based feature flag
  - `getTierLimits(tier)` - Retrieve tier-specific quotas

**State Management:**
- Frontend: Nuxt composables (`useAuth()`, native fetching)
- Backend: Drizzle ORM entities
- Job Queue: `generationJobs` table with external ID reference (`externalTaskId`)

---

*Architecture analysis: 2026-05-21*
