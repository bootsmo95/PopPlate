# Phase 2: Analytics Dashboard - Pattern Map

**Mapped:** 2026-05-21
**Files analyzed:** 7 new/modified files
**Analogs found:** 7 / 7

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `server/api/restaurants/[slug]/analytics.get.ts` | api-endpoint | request-response | `server/api/dishes/[id]/analytics.get.ts` | exact |
| `app/pages/platform/analytics.vue` | page | request-response | `app/pages/platform/index.vue` | exact |
| `app/components/platform/Sidebar.vue` | component | — | self (modify) | self |
| `app/pages/platform/index.vue` | page | request-response | self (modify) | self |
| `app/lib/analytics/events.ts` | utility | event-driven | self (modify) | self |
| `server/api/dishes/[id]/qr.get.ts` | api-endpoint | request-response | self (modify) | self |
| `server/utils/public-url.ts` | utility | transform | self (modify) | self |

---

## Pattern Assignments

### `server/api/restaurants/[slug]/analytics.get.ts` (api-endpoint, request-response)

**Analog:** `server/api/dishes/[id]/analytics.get.ts`

**Imports pattern** (lines 1-5):
```typescript
import { db } from '../../../database/index'
import { analyticsEvents } from '../../../database/schema'
import { eq, sql } from 'drizzle-orm'
import { requireAuth } from '../../../utils/auth'
import { requireOwnedDish } from '../../../utils/dish-ownership'
```

For the new restaurant-level endpoint, replace `requireOwnedDish` with
`requireAccessibleRestaurant` from `server/utils/restaurant-ownership.ts`:

```typescript
import { db } from '../../../../database/index'
import { analyticsEvents, dishes } from '../../../../database/schema'
import { and, eq, gte, sql } from 'drizzle-orm'
import { requireAuth } from '../../../../utils/auth'
import { requireAccessibleRestaurant } from '../../../../utils/restaurant-ownership'
```

**Auth + ownership pattern** (lines 7-14 of analog):
```typescript
export default defineEventHandler(async (event) => {
  const { user } = await requireAuth(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'id is required' })
  }
  await requireOwnedDish(id, user)
  // ... query follows
})
```

Adapt for restaurant slug:
```typescript
export default defineEventHandler(async (event) => {
  const { user } = await requireAuth(event)

  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, message: 'slug is required' })
  }
  const restaurant = await requireAccessibleRestaurant(slug, user)
  // ... query follows
})
```

**Drizzle aggregation pattern** (lines 16-23 of analog):
```typescript
const rows = await db
  .select({
    eventType: analyticsEvents.eventType,
    count: sql<number>`count(*)::int`,
  })
  .from(analyticsEvents)
  .where(eq(analyticsEvents.dishId, id))
  .groupBy(analyticsEvents.eventType)
```

New endpoint extends this with time-range filtering and per-dish grouping:
```typescript
// Time-range filter (computed from query param: '7d' | '30d' | 'all')
const since: Date | null = period === 'all' ? null : new Date(Date.now() - days * 86_400_000)

const whereClause = since
  ? and(eq(analyticsEvents.restaurantId, restaurant.id), gte(analyticsEvents.createdAt, since))
  : eq(analyticsEvents.restaurantId, restaurant.id)
```

**restaurant-ownership analog** (`server/utils/restaurant-ownership.ts`, lines 7-23):
```typescript
export async function requireAccessibleRestaurant(restaurantId: string, user: SessionUser) {
  const [restaurant] = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.id, restaurantId))
    .limit(1)

  if (!restaurant) {
    throw createError({ statusCode: 404, message: 'Restaurant not found' })
  }

  if (!hasUnlimitedAccess(user) && restaurant.ownerId !== user.id) {
    throw createError({ statusCode: 403, message: 'You do not own this restaurant' })
  }

  return restaurant
}
```

Note: `requireAccessibleRestaurant` currently takes a UUID `restaurantId`, not a slug.
The new endpoint receives a slug, so the lookup must use `eq(restaurants.slug, slug)` or
look up the restaurant by slug first, then call the utility — or inline the ownership check
adapted for slug lookup.

**Return shape to produce** (design to return from the new endpoint):
```typescript
return {
  // top-level counts for the selected period
  menuViews: number,         // eventType = 'page_open'
  qrScans: number,           // eventType = 'menu_open' where source = 'qr'
  interactions: number,      // 'viewer_loaded' + 'ar_launch_clicked' + 'menu_ar_launch_clicked'
  topDish: string | null,    // name of dish with most page_open events

  // for delta cards: same counts for the prior equivalent period
  prev: { menuViews, qrScans, interactions },

  // daily time-series for trend chart
  daily: Array<{ date: string; count: number }>,

  // dish popularity table
  dishRanking: Array<{
    dishId: string
    name: string
    posterUrl: string | null
    views: number          // page_open
    interactions: number   // viewer_loaded + ar_launch_clicked
  }>,
}
```

---

### `app/pages/platform/analytics.vue` (page, request-response)

**Analog:** `app/pages/platform/index.vue`

**Page meta + head pattern** (lines 11-12 of analog):
```typescript
definePageMeta({ layout: "platform" });
useHead({ title: "Analytics · popplate" });
```

**Auth + SSR header pattern** (lines 30-31 of analog):
```typescript
const ssrHeaders = useAuthHeaders();
const { user } = useAuth();
```

**useLazyFetch pattern** (lines 33-36 of analog):
```typescript
const { data: apiDishes, status: dishesStatus } = useLazyFetch<ApiDish[]>("/api/dishes", { headers: ssrHeaders });
const { data: restaurants, status: restaurantsStatus } = useLazyFetch<ApiRestaurant[]>("/api/restaurants", {
  headers: ssrHeaders,
});
const loading = computed(() => dishesStatus.value === "pending" || restaurantsStatus.value === "pending");
```

The analytics page will use `useLazyFetch` with a reactive `period` ref and `watch` to
re-fetch when the period tab changes:
```typescript
const period = ref<'7d' | '30d' | 'all'>('30d')
const { data: analytics, status: analyticsStatus, refresh } = useLazyFetch(
  () => `/api/restaurants/${slug}/analytics?period=${period.value}`,
  { headers: ssrHeaders }
)
watch(period, () => refresh())
```

**StatCard usage pattern** (lines 115-119 of analog):
```vue
<div class="grid grid-cols-4 gap-4 mb-8 max-[1100px]:grid-cols-2 max-[480px]:grid-cols-1">
  <StatCard label="Retter i alt" :value="dishCount" caption="alle retter" />
  <StatCard label="Restauranter" :value="restaurantCount" caption="oprettet" />
  <StatCard label="AR-visninger" value="--" sub="/30d" caption="kommer snart" />
  <StatCard label="QR-scans" value="--" sub="/30d" caption="kommer snart" />
</div>
```

New analytics page stat cards use delta props from `app/components/platform/StatCard.vue`
(lines 8-9 of StatCard):
```vue
<StatCard
  label="Menuvisninger"
  :value="analytics?.menuViews ?? '—'"
  :sub="`/${period}`"
  :delta="deltaLabel(analytics?.menuViews, analytics?.prev?.menuViews)"
  :delta-direction="deltaDir(analytics?.menuViews, analytics?.prev?.menuViews)"
/>
```

**PageSkeleton loading guard pattern** (line 94 of analog):
```vue
<PageSkeleton v-if="loading" variant="dashboard" />
<div v-else>
  <!-- content -->
</div>
```

**TopBar + PageHead pattern** (lines 92-112 of analog):
```vue
<TopBar />
<PageHead :eyebrow="eyebrow">
  <template #title>
    <h1 class="page-title">Analytics</h1>
  </template>
</PageHead>
```

**Sidebar active key:** Use `'analytics'` — the key is already declared in
`app/types/popplate.ts` line 69 (`SidebarKey` union).

---

### `app/components/platform/Sidebar.vue` (component, modify)

**Self-analog** — add one `<NuxtLink>` entry inside the "Oversigt" `<nav>` block.

**Nav item pattern** (lines 100-112 of Sidebar.vue):
```vue
<NuxtLink
  to="/platform/dishes" class="nav-item" :class="active === 'dishes' && 'active'"
  :aria-current="active === 'dishes' ? 'page' : undefined" @click="close"
>
  <Icon name="dish" /> Retter
  <span v-if="dishCount" class="count">{{ dishCount }}</span>
</NuxtLink>
```

New analytics entry (insert after the "Retter" link):
```vue
<NuxtLink
  to="/platform/analytics" class="nav-item" :class="active === 'analytics' && 'active'"
  :aria-current="active === 'analytics' ? 'page' : undefined" @click="close"
>
  <Icon name="chart" /> Analyse
</NuxtLink>
```

Note: An appropriate icon name (`chart`, `analytics`, or similar) should be confirmed
against the available icons in `app/components/shared/Icon.vue`.

---

### `app/pages/platform/index.vue` (page, modify — fill placeholder stat cards)

**Self-analog** — targeted modification of lines 118-119 only.

**Current placeholder pattern** (lines 118-119):
```vue
<StatCard label="AR-visninger" value="--" sub="/30d" caption="kommer snart" />
<StatCard label="QR-scans" value="--" sub="/30d" caption="kommer snart" />
```

**Fetch pattern to add** (mirroring lines 33-36 for new analytics fetch):
```typescript
const { data: summaryAnalytics } = useLazyFetch<{ menuViews: number; qrScans: number }>(
  () => `/api/restaurants/${firstSlug.value}/analytics?period=30d`,
  { headers: ssrHeaders, immediate: false }
)
// start fetching once slug is known
watch(firstSlug, (slug) => { if (slug) summaryAnalytics.refresh() }, { immediate: true })
```

**Updated stat cards:**
```vue
<StatCard
  label="AR-visninger"
  :value="summaryAnalytics?.menuViews ?? '--'"
  sub="/30d"
  caption="siste 30 dage"
/>
<StatCard
  label="QR-scans"
  :value="summaryAnalytics?.qrScans ?? '--'"
  sub="/30d"
  caption="siste 30 dage"
/>
```

---

### `app/lib/analytics/events.ts` (utility, modify — UTM detection)

**Self-analog** — extend `trackEvent` to detect `?utm_source=qr` and forward it.

**Current fire-and-forget pattern** (lines 15-36):
```typescript
export function trackEvent(
  eventType: 'page_open' | 'viewer_loaded' | 'ar_launch_clicked' | 'menu_open' | 'menu_dish_selected' | 'menu_ar_launch_clicked',
  dishId: string,
  restaurantId: string,
): void {
  const payload = {
    eventType,
    dishId,
    restaurantId,
    sessionId: getSessionId(),
    userAgent: navigator.userAgent,
    referrer: document.referrer,
  }

  $fetch('/api/public/analytics', {
    method: 'POST',
    body: payload,
  }).catch(() => {
    // Intentionally swallowed — analytics must never affect UX
  })
}
```

Add UTM source detection before building payload:
```typescript
const utmSource = new URLSearchParams(window.location.search).get('utm_source') ?? undefined

const payload = {
  eventType,
  dishId,
  restaurantId,
  sessionId: getSessionId(),
  userAgent: navigator.userAgent,
  referrer: document.referrer,
  utmSource,   // new field — 'qr' when present
}
```

The server-side `analytics.post.ts` must also accept and store `utmSource` (or a dedicated
`source` column must be added, or store it in `referrer` / a new `metadata` field — see
"No Analog Found" note below).

---

### `server/api/dishes/[id]/qr.get.ts` (api-endpoint, modify — append UTM param to QR URLs)

**Self-analog** — the return value `publicUrl` must have `?utm_source=qr` appended.

**Current return pattern** (lines 26-29):
```typescript
return {
  ...qrCode,
  publicUrl: canonicalizePublicDishUrl(qrCode.publicUrl, dish.publicDishId),
}
```

Modified return:
```typescript
const baseUrl = canonicalizePublicDishUrl(qrCode.publicUrl, dish.publicDishId)
return {
  ...qrCode,
  publicUrl: `${baseUrl}?utm_source=qr`,
}
```

---

## Shared Patterns

### Authentication (all new server endpoints)
**Source:** `server/utils/auth.ts`, lines 26-32
**Apply to:** `server/api/restaurants/[slug]/analytics.get.ts`
```typescript
export async function requireAuth(event: H3Event): Promise<{ user: SessionUser }> {
  const result = await requireUserSession(event, {
    statusCode: 401,
    message: 'Unauthorized',
  })
  return { user: result.user as SessionUser }
}
```

### Restaurant Ownership Check
**Source:** `server/utils/restaurant-ownership.ts`, lines 7-23
**Apply to:** `server/api/restaurants/[slug]/analytics.get.ts`
```typescript
export async function requireAccessibleRestaurant(restaurantId: string, user: SessionUser) {
  const [restaurant] = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.id, restaurantId))
    .limit(1)

  if (!restaurant) {
    throw createError({ statusCode: 404, message: 'Restaurant not found' })
  }

  if (!hasUnlimitedAccess(user) && restaurant.ownerId !== user.id) {
    throw createError({ statusCode: 403, message: 'You do not own this restaurant' })
  }

  return restaurant
}
```

### Drizzle SQL Aggregation
**Source:** `server/api/dishes/[id]/analytics.get.ts`, lines 16-23
**Apply to:** new restaurant analytics endpoint
```typescript
const rows = await db
  .select({
    eventType: analyticsEvents.eventType,
    count: sql<number>`count(*)::int`,
  })
  .from(analyticsEvents)
  .where(eq(analyticsEvents.dishId, id))
  .groupBy(analyticsEvents.eventType)
```

Use `and()`, `gte()`, `lt()` from `drizzle-orm` for time-window filtering. Use `groupBy`
with multiple columns (e.g., `analyticsEvents.dishId`, `sql\`date_trunc('day', ...)\``) for
daily bucketing and per-dish ranking.

### useLazyFetch with SSR headers
**Source:** `app/pages/platform/index.vue`, lines 30-38
**Apply to:** `app/pages/platform/analytics.vue`
```typescript
const ssrHeaders = useAuthHeaders();
const { data, status } = useLazyFetch<T>("/api/...", { headers: ssrHeaders });
const loading = computed(() => status.value === "pending");
```

### Platform page structure
**Source:** `app/pages/platform/index.vue`, lines 11-12 + 90-96
**Apply to:** `app/pages/platform/analytics.vue`
```typescript
definePageMeta({ layout: "platform" });
useHead({ title: "Analyse · popplate" });
```
```vue
<div data-screen-label="Analyse">
  <TopBar />
  <PageSkeleton v-if="loading" variant="dashboard" />
  <div v-else>
    <!-- content -->
  </div>
</div>
```

### Sidebar nav-item pattern
**Source:** `app/components/platform/Sidebar.vue`, lines 100-112
**Apply to:** new analytics nav entry in Sidebar.vue
```vue
<NuxtLink
  to="/platform/X" class="nav-item" :class="active === 'X' && 'active'"
  :aria-current="active === 'X' ? 'page' : undefined" @click="close"
>
  <Icon name="X" /> Label
</NuxtLink>
```

### Danish locale number formatting
**Source:** `app/pages/platform/index.vue`, lines 57, 81-86
**Apply to:** `app/pages/platform/analytics.vue`
```typescript
// Numbers
views.toLocaleString('da-DK')

// Dates
new Date().toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
```

---

## No Analog Found

| File / Decision | Role | Data Flow | Reason |
|---|---|---|---|
| UTM `source` persistence in `analyticsEvents` | schema/migration | — | The `analyticsEvents` table has no `source` column. Storing UTM source requires either a new column (migration needed) or encoding it in an existing field. No migration analog exists yet — planner must decide on schema change vs. referrer encoding. |
| Trend line chart component | component | event-driven | No chart library is currently used in the codebase. RESEARCH.md or planner discretion should select a lightweight library (e.g., Chart.js via vue-chartjs, or unovis). No analog to copy from. |

---

## Metadata

**Analog search scope:** `server/api/`, `app/pages/platform/`, `app/components/platform/`,
`app/lib/analytics/`, `server/utils/`, `app/types/`
**Files scanned:** 22
**Pattern extraction date:** 2026-05-21
