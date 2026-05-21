# Coding Conventions

**Analysis Date:** 2026-05-21

## Naming Patterns

**Files:**
- Vue components: PascalCase (e.g., `ImageUploader.vue`, `StatusBadge.vue`)
- API routes: Kebab-case with HTTP method suffix (e.g., `[id].put.ts`, `login.post.ts`, `analytics.get.ts`)
- Composables: camelCase with `use` prefix (e.g., `useAuth.ts`, `useAuthFetch.ts`)
- Utilities: camelCase with descriptive names (e.g., `dish-ownership.ts`, `storage-keys.ts`)
- Page routes: Follow file structure convention (e.g., `/app/pages/d/[publicDishId].vue`, `/app/pages/platform/dishes/[id].vue`)

**Functions:**
- Composables: Export named functions with `use` prefix (e.g., `useAuth()`, `useAuthHeaders()`)
- Event handlers: Prefix with `handle` (e.g., `handleSave()`, `handleDelete()`, `handleImageUploaded()`)
- Async operations: No special prefix, use async/await (e.g., `trackEvent()`, `processQueue()`)
- Utility functions: Descriptive verbs (e.g., `getSignedUrl()`, `uploadFile()`, `validateFile()`)

**Variables:**
- Constants: UPPER_SNAKE_CASE (e.g., `MIN_IMAGES`, `MAX_FILE_SIZE`, `SESSION_KEY`)
- Booleans: Prefix with `is` or `has` (e.g., `isDragging`, `isProcessing`, `isReady`, `hasUnlimitedAccess`)
- Reactive state (ref/computed): camelCase (e.g., `uploadQueue`, `deletingIds`, `validationError`)
- Interface/type instances: camelCase (e.g., `item`, `user`, `dish`)

**Types:**
- Interfaces: PascalCase (e.g., `AuthUser`, `QueueItem`, `SourceImage`, `SessionUser`)
- Union types: PascalCase (e.g., `DishStatus`)
- Exported types: PascalCase (e.g., `Dish`, `Restaurant`, `MenuSection`, `User`)

## Code Style

**Formatting:**
- No explicit formatter configured (check runtime)
- Consistent indentation: 2 spaces (observed throughout Vue templates and TypeScript)
- Line length: No explicit limit enforced
- TypeScript strict mode: Enabled in `nuxt.config.ts` with `typescript: { strict: true }`

**Linting:**
- No ESLint or Prettier config found in root
- Type safety reliance: TypeScript strict mode is primary guarantee
- No lint script in package.json

## Import Organization

**Order:**
1. Standard library imports (`import type`)
2. Third-party framework imports (`from 'drizzle-orm'`, `from 'h3'`, `from '@aws-sdk/...'`)
3. Internal utilities (`from '../../database/...'`, `from '../../utils/...'`)
4. Vue composables and helpers (implicit auto-import in Nuxt)

**Path Aliases:**
- Nuxt auto-import: Composables, components, and middleware are auto-imported
- Relative paths used throughout (e.g., `../../database/index`, `../../utils/auth`)
- No `@` alias configured in tsconfig (standard Nuxt setup)

**Examples:**
- API route: `import { db } from '../../database/index'` + `import { dishes } from '../../database/schema'` + `import { eq } from 'drizzle-orm'`
- Component: Nuxt auto-imports `ref`, `computed`, `onUnmounted`, `defineProps`, `defineEmits`, `$fetch`, `nextTick`

## Error Handling

**Patterns:**
- **Server (H3)**: Throw `createError({ statusCode: ..., message: '...' })` from API routes
  - Example: `/c/repos/PopPlate/server/api/dishes/[id].put.ts` validates input and throws 400 on invalid scale
  - Example: `/c/repos/PopPlate/server/api/auth/login.post.ts` throws 410 for disabled password login
- **Client (Vue)**: Try/catch with `err: unknown` type assertion to safely extract message
  - Pattern: `const e = err as { data?: { message?: string }; message?: string }; e?.data?.message ?? e?.message ?? 'default'`
  - Used in `/c/repos/PopPlate/app/components/admin/ImageUploader.vue` for upload and delete operations
- **Async operations**: Wrap in try/catch/finally, ensure cleanup in finally (e.g., `clearInterval()`, `revoke ObjectURL()`)
- **Fire-and-forget**: Analytics tracking swallows errors intentionally with `.catch(() => {})` comment explaining "analytics must never affect UX"

## Logging

**Framework:** `console` (only one `console.warn()` found in `/c/repos/PopPlate/server/api/dishes/[id]/publish.post.ts` for QR upload fallback)

**Patterns:**
- Minimal logging in codebase
- `console.warn()` used only for non-critical fallback scenarios (QR upload failure)
- No structured logging framework (like pino, winston)
- Client-side analytics via `/api/public/analytics` endpoint instead of console logs

## Comments

**When to Comment:**
- Explain business logic constraints (e.g., "Analytics must never affect UX")
- Clarify non-obvious validation ranges (e.g., "Dish size must be between 0 and 200 cm")
- Document fallback behavior in error scenarios

**JSDoc/TSDoc:**
- Minimal usage observed
- Function signatures with type annotations preferred over JSDoc
- Example: `/c/repos/PopPlate/server/utils/storage.ts` uses brief JSDoc comments for exported functions like `getSignedUrl()` documenting parameters and return type

## Function Design

**Size:** No explicit limit enforced; observed range 10-100 lines

**Parameters:**
- Use destructuring for objects: `const { user } = await requireAuth(event)`
- Type interfaces for complex inputs: `body: await readBody<{ name?: string; ... }>(event)`
- Named function parameters over object spreading

**Return Values:**
- Explicit return type annotations (e.g., `async function getSessionUser(): Promise<SessionUser | null>`)
- Nullable returns use `?? null` or optional chaining pattern
- API routes return typed objects or throw errors (no null/undefined for HTTP endpoints)

## Module Design

**Exports:**
- Named exports preferred (e.g., `export function useAuth()`, `export interface Dish`)
- Composables export single function (e.g., `useAuth.ts` exports only `useAuth()`)
- Utilities export multiple functions (e.g., `storage.ts` exports `uploadFile()`, `getSignedUrl()`, `deleteFile()`)
- API routes use default export: `export default defineEventHandler(async (event) => { ... })`

**Barrel Files:**
- Not observed in app/lib or app/composables
- Direct imports preferred (e.g., `import { trackEvent } from '~/lib/analytics/events'`)

---

*Convention analysis: 2026-05-21*
