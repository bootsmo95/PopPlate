---
phase: 02-analytics-dashboard
reviewed: 2026-05-21T12:00:00Z
depth: standard
files_reviewed: 11
files_reviewed_list:
  - server/database/migrations/0004_add_utm_source.sql
  - server/api/restaurants/[slug]/analytics.get.ts
  - server/database/schema.ts
  - server/api/public/analytics.post.ts
  - app/lib/analytics/events.ts
  - server/api/dishes/[id]/qr.get.ts
  - app/components/platform/AnalyticsTrendChart.vue
  - app/pages/platform/analytics.vue
  - app/components/platform/Sidebar.vue
  - app/pages/platform/index.vue
  - package.json
findings:
  critical: 0
  warning: 3
  info: 2
  total: 5
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-05-21T12:00:00Z
**Depth:** standard
**Files Reviewed:** 11
**Status:** issues_found

## Summary

The analytics feature is well-structured overall. The public ingestion endpoint has solid input validation, rate limiting, and correctly derives `restaurantId` server-side from the dish lookup rather than trusting client input. Auth and ownership checks on the dashboard endpoint are correct. The main issues are: (1) a falsy-zero bug in the delta comparison helpers that suppresses real percentage changes, (2) a type mismatch where a SQL expression that can return NULL is typed as `boolean`, and (3) `sessionStorage` access without an SSR guard on an exported function.

## Warnings

### WR-01: Falsy-zero bug in deltaLabel and deltaDir suppresses real changes

**File:** `app/pages/platform/analytics.vue:63-76`
**Issue:** Both `deltaLabel` and `deltaDir` use `!current` and `!prev` as guards. When `current` is `0` (a valid count -- e.g., zero views this period), the expression `!current` is `true`, so the function returns "ingen aendring" / "neutral" even when the previous period had views. A drop from 50 to 0 should show "-100%" and direction "down", but instead shows "ingen aendring".
**Fix:**
```typescript
function deltaLabel(current?: number, prev?: number): string {
  if (current == null || prev == null || prev === 0) return 'ingen aendring'
  const pct = Math.round(((current - prev) / prev) * 100)
  if (pct === 0) return 'ingen aendring'
  return `${Math.abs(pct)}% vs. forrige periode`
}

function deltaDir(current?: number, prev?: number): 'up' | 'down' | 'neutral' {
  if (current == null || prev == null || prev === 0) return 'neutral'
  const diff = current - prev
  if (diff > 0) return 'up'
  if (diff < 0) return 'down'
  return 'neutral'
}
```

### WR-02: isQr typed as boolean but SQL expression can return NULL

**File:** `server/api/restaurants/[slug]/analytics.get.ts:56`
**Issue:** The SQL expression `(utm_source = 'qr')` returns NULL when `utm_source` is NULL (SQL three-valued logic). Drizzle maps this to JavaScript `null`, but the type annotation says `sql<boolean>`. The grouping produces three groups: `true`, `false`, and `null`. The code on line 72 (`row.isQr`) accidentally works because `null` is falsy in JS, but the type is dishonest about nullability. If someone later does a strict `=== false` check, they will miss the NULL group.
**Fix:**
```typescript
// Option A: Use COALESCE to guarantee boolean in SQL
isQr: sql<boolean>`coalesce(${analyticsEvents.utmSource} = 'qr', false)`,

// Option B: Type honestly and check accordingly
isQr: sql<boolean | null>`(${analyticsEvents.utmSource} = 'qr')`,
```
Option A is preferred -- it collapses the three groups to two and keeps the type honest.

### WR-03: sessionStorage accessed without SSR guard in exported function

**File:** `app/lib/analytics/events.ts:10`
**Issue:** `getSessionId()` is exported and directly accesses `sessionStorage` on line 10. If any code path calls `getSessionId()` during SSR (server-side rendering), it will throw a `ReferenceError` because `sessionStorage` does not exist in Node. The `trackEvent` function has the same issue with `window.location` on line 21. Currently all callers are client-side event handlers, but the exported API does not enforce this.
**Fix:**
```typescript
export function getSessionId(): string {
  if (!import.meta.client) return 'ssr'
  const existing = sessionStorage.getItem(SESSION_KEY)
  if (existing) return existing
  return generateSessionId()
}
```
Alternatively, add a guard at the top of `trackEvent`:
```typescript
export function trackEvent(...): void {
  if (!import.meta.client) return
  // ... rest of function
}
```

## Info

### IN-01: Client sends restaurantId in analytics payload but server ignores it

**File:** `app/lib/analytics/events.ts:25`
**Issue:** `trackEvent` includes `restaurantId` in the POST body (line 25), but the server endpoint (`analytics.post.ts`) correctly derives `restaurantId` from the dish lookup (line 69) and never reads it from the body. The extra field in the payload is dead data that adds bytes to every analytics request for no reason.
**Fix:** Remove `restaurantId` from the payload in `trackEvent`, and remove it from the function signature if no other callers need it:
```typescript
export function trackEvent(
  eventType: '...',
  dishId: string,
): void {
  // Remove restaurantId from payload
}
```

### IN-02: Commented-out code blocks in index.vue

**File:** `app/pages/platform/index.vue:171-181, 194`
**Issue:** Two commented-out `QuickActionCard` components and a commented-out `ActivityList` component. These are placeholders for future features but add noise to the template.
**Fix:** Remove if not planned for imminent implementation, or add a brief comment explaining the timeline (e.g., `<!-- TODO(v3): restore when activity API ships -->`).

---

_Reviewed: 2026-05-21T12:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
