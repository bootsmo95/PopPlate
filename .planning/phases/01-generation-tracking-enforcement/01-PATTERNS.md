# Phase 1: Generation Tracking & Enforcement - Pattern Map

**Mapped:** 2026-05-21
**Files analyzed:** 5
**Analogs found:** 5 / 5

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `server/utils/tiers.ts` (modify) | utility | transform | self | exact — extend in-place |
| `server/utils/generation-usage.ts` (new) | utility | CRUD / request-response | `server/utils/access.ts` + `generate.post.ts` (lines 49–63) | role-match |
| `server/api/dishes/[id]/generate.post.ts` (modify) | controller | request-response | self | exact — extend in-place |
| `server/api/user/usage.get.ts` (new) | controller | request-response | `server/api/user/profile.get.ts` | exact |
| `app/pages/platform/settings.vue` (modify) | page/component | request-response | self | exact — extend in-place |
| `app/components/admin/GenerationStatus.vue` (modify) | component | request-response | self | exact — extend in-place |

---

## Pattern Assignments

### `server/utils/tiers.ts` (modify — add `maxGenerationsPerMonth`)

**Analog:** self (entire file is 22 lines — read in full above)

**Existing interface pattern** (lines 3–7):
```typescript
export interface TierLimits {
  maxRestaurants: number
  maxDishesTotal: number
  maxRegenerationsPerDish: number
}
```

**Existing limits record pattern** (lines 9–13):
```typescript
const TIER_LIMITS: Record<AccountTier, TierLimits> = {
  free:  { maxRestaurants: 1, maxDishesTotal: 5,  maxRegenerationsPerDish: 1 },
  basic: { maxRestaurants: 2, maxDishesTotal: 35, maxRegenerationsPerDish: 3 },
  pro:   { maxRestaurants: 5, maxDishesTotal: 60, maxRegenerationsPerDish: 5 },
}
```

**Action:** Add `maxGenerationsPerMonth: number` to `TierLimits`, and add values `free: 15, basic: 50, pro: 150` to each entry in `TIER_LIMITS`. No other file changes needed.

---

### `server/utils/generation-usage.ts` (new utility — billing-cycle count + cycle-start)

**Primary analog:** `server/api/dishes/[id]/generate.post.ts` lines 49–63 (the existing per-dish count pattern using Drizzle)

**Secondary analog:** `server/utils/access.ts` (simple exported function, single responsibility)

**Imports pattern** — copy from `generate.post.ts` lines 1–8:
```typescript
import { db } from '../database/index'
import { generationJobs, users } from '../database/schema'
import { eq, gte, count, and } from 'drizzle-orm'
```

**Core pattern — existing per-dish count to copy** (`generate.post.ts` lines 52–56):
```typescript
const [{ count: completedCount }] = await db
  .select({ count: count() })
  .from(generationJobs)
  .where(and(eq(generationJobs.dishId, id), eq(generationJobs.status, 'ready')))
```

**New utility must produce two exported functions:**

1. `getBillingCycleStart(anchorDate: Date): Date` — pure computation, no DB access.
   - Takes the user's subscription or `createdAt` date as anchor.
   - Finds the most recent past occurrence of the anchor's day-of-month.
   - Returns a `Date` at midnight UTC on that day.

2. `getMonthlyGenerationCount(userId: string, cycleStart: Date): Promise<number>` — DB query.
   - `COUNT(*) FROM generation_jobs WHERE requested_by_user_id = userId AND created_at >= cycleStart`
   - Returns a plain `number`.

**Error handling pattern** — no errors thrown; callers handle limit enforcement.

---

### `server/api/dishes/[id]/generate.post.ts` (modify — add monthly limit check)

**Analog:** self (entire file — read above, 93 lines)

**Auth pattern** (lines 10–11) — unchanged:
```typescript
export default defineEventHandler(async (event) => {
  const { user } = await requireAuth(event)
```

**Existing per-dish limit check pattern** (lines 49–63) — the monthly check must be inserted BEFORE this block:
```typescript
// Check regeneration tier limit
if (!hasUnlimitedAccess(user)) {
  const limits = getTierLimits(user.accountTier)
  const [{ count: completedCount }] = await db
    .select({ count: count() })
    .from(generationJobs)
    .where(and(eq(generationJobs.dishId, id), eq(generationJobs.status, 'ready')))

  if (completedCount >= limits.maxRegenerationsPerDish) {
    throw createError({
      statusCode: 403,
      message: `Your ${user.accountTier} plan allows up to ${limits.maxRegenerationsPerDish} generation(s) per dish. Upgrade to regenerate more.`,
    })
  }
}
```

**Error throw pattern** (lines 29–32 and 59–62) — copy this shape for the new monthly error:
```typescript
throw createError({
  statusCode: 403,
  message: '...',
})
```

**Action:** Import `getBillingCycleStart` and `getMonthlyGenerationCount` from `../../../utils/generation-usage`. Import `getDbUser` from `../../../utils/auth` to fetch `user.createdAt`. Insert the monthly check block immediately before the per-dish check (around line 49), inside the `!hasUnlimitedAccess(user)` guard.

---

### `server/api/user/usage.get.ts` (new GET endpoint)

**Analog:** `server/api/user/profile.get.ts` (entire file — 19 lines, read above)

**Imports pattern** (lines 1–1):
```typescript
import { requireAuth, getDbUser } from '../../utils/auth'
```

**Auth + 404 pattern** (lines 3–9):
```typescript
export default defineEventHandler(async (event) => {
  const { user } = await requireAuth(event)
  const dbUser = await getDbUser(user.id)

  if (!dbUser) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }
```

**Return shape pattern** (lines 11–18) — `profile.get.ts` returns a plain object; `usage.get.ts` must return:
```typescript
return {
  used: number,          // current month count
  limit: number,         // maxGenerationsPerMonth for their tier
  cycleStart: string,    // ISO date string of cycle start
}
```

**Action:** After fetching `dbUser`, call `getBillingCycleStart(dbUser.createdAt)` (or subscription date when available) and `getMonthlyGenerationCount(user.id, cycleStart)`. Call `getTierLimits(user.accountTier)` for the limit. Return the three fields above.

---

### `app/pages/platform/settings.vue` (modify — add generation usage display)

**Analog:** self (entire file — 337 lines, read above)

**Data fetch pattern** (lines 13–16) — `useLazyFetch` with `ssrHeaders`:
```typescript
const { data: restaurants } = useLazyFetch<Array<{ id: string }>>("/api/restaurants", { headers: ssrHeaders });
const { data: apiDishes } = useLazyFetch<Array<{ id: string }>>("/api/dishes", { headers: ssrHeaders });
```

**Computed display count pattern** (line 16):
```typescript
const apiDishCount = computed(() => apiDishes.value?.length ?? 0);
```

**Usage stat display block pattern** (lines 130–150, inside the "tier" tab) — copy this grid cell structure for the generation count:
```html
<div>
  <div class="mono-label !text-[rgba(243,237,226,0.5)] mb-2">Retter brugt</div>
  <div class="font-body text-[32px] font-light" style="color: #f3ede2">
    {{ apiDishCount }}<span class="text-sm ml-1" style="color: rgba(243, 237, 226, 0.5)">/30</span>
  </div>
</div>
```

**Account tab aside card pattern** (lines 276–299) — the dark `p-card` in the account tab aside is the right place to add a generation usage summary when showing the "Konto" tab.

**Action:** Add `useLazyFetch('/api/user/usage', ...)` at the top of `<script setup>`. Add a generation usage display (format: "X / Y generationer brugt denne måned") inside the "account" tab section, following the existing stat card HTML structure. D-06 specifies settings/account page only — no other pages need changing.

---

### `app/components/admin/GenerationStatus.vue` (modify — disable button + Danish message at limit)

**Analog:** self (entire file — 211 lines, read above)

**Button disabled pattern** (lines 8–13):
```html
<button
  :disabled="loading"
  class="top-btn top-btn--primary !py-3 !px-5 !text-sm disabled:opacity-50"
  @click="startGeneration"
>
  {{ loading ? 'Starter...' : 'Start generation' }}
</button>
```

**Error / warning message pattern** (lines 79–82):
```html
<div class="rounded-md border border-[#a85a48]/20 bg-[#a85a48]/5 px-4 py-3">
  <p class="text-sm font-medium text-[#8a4838] mb-0.5">Generation fejlede</p>
  <p v-if="latestJob.errorMessage" class="text-sm text-[#a85a48]">{{ latestJob.errorMessage }}</p>
</div>
```

**Inline error from API pattern** (`startGeneration` function, lines 188–191):
```typescript
const e = err as { data?: { message?: string }; message?: string }
error.value = e?.data?.message ?? e?.message ?? 'Kunne ikke starte generation.'
```

**Props pattern** (lines 113–119):
```typescript
const props = defineProps<{
  dishId: string
  dishStatus: string
  hasModel?: boolean
  imageCount: number
  latestJob: GenerationJob | null
}>()
```

**Action:** Add a `monthlyLimitReached` prop (boolean) OR derive it from a new `usageData` prop. When `monthlyLimitReached` is true: disable the generate/regenerate buttons (`:disabled="loading || monthlyLimitReached"`) and show a Danish-language warning above/below the button. Danish wording (Claude's discretion per D-08): "Du har nået din månedlige grænse for 3D-generationer. Grænsen nulstilles ved din næste faktureringsdato." Use the same warning box HTML structure as lines 79–82 but with a neutral/informational color instead of error red (e.g. `border-[#8b6914]/20 bg-[#8b6914]/5 text-[#6b4f10]`). The parent page (`dishes/[id].vue`) must pass the usage data down; it fetches `/api/user/usage` and computes `monthlyLimitReached = used >= limit`.

---

## Shared Patterns

### Authentication
**Source:** `server/utils/auth.ts` (lines 26–31)
**Apply to:** All new/modified server API endpoints
```typescript
export default defineEventHandler(async (event) => {
  const { user } = await requireAuth(event)
  // throws 401 automatically if unauthenticated
```

### Admin bypass
**Source:** `server/utils/access.ts` (lines 3–5)
**Apply to:** `generate.post.ts` monthly check, `usage.get.ts`
```typescript
export function hasUnlimitedAccess(user: SessionUser): boolean {
  return user.role === 'admin'
}
```
Pattern: wrap every limit check in `if (!hasUnlimitedAccess(user)) { ... }`.

### Error throw
**Source:** `server/api/dishes/[id]/generate.post.ts` (lines 29–32, 59–62)
**Apply to:** All server-side limit enforcement
```typescript
throw createError({
  statusCode: 403,
  message: '...',
})
```

### Client-side error display
**Source:** `app/components/admin/GenerationStatus.vue` (lines 188–191)
**Apply to:** Any new Vue component that calls an API
```typescript
const e = err as { data?: { message?: string }; message?: string }
error.value = e?.data?.message ?? e?.message ?? 'Fallback message.'
```

### Drizzle DB count query
**Source:** `server/api/dishes/[id]/generate.post.ts` (lines 52–56)
**Apply to:** `server/utils/generation-usage.ts`
```typescript
const [{ count: completedCount }] = await db
  .select({ count: count() })
  .from(generationJobs)
  .where(and(eq(generationJobs.dishId, id), eq(generationJobs.status, 'ready')))
```
For the monthly count, swap the `where` clause: `and(eq(generationJobs.requestedByUserId, userId), gte(generationJobs.createdAt, cycleStart))`.

### useLazyFetch with SSR headers
**Source:** `app/pages/platform/settings.vue` (lines 13–14)
**Apply to:** All new `useLazyFetch` calls in settings.vue
```typescript
const ssrHeaders = useAuthHeaders();
const { data: foo } = useLazyFetch<FooType>("/api/foo", { headers: ssrHeaders });
```

---

## No Analog Found

None — all files have close existing analogs in the codebase.

---

## Metadata

**Analog search scope:** `server/api/`, `server/utils/`, `app/pages/platform/`, `app/components/admin/`, `server/database/`
**Files scanned:** 12
**Pattern extraction date:** 2026-05-21
