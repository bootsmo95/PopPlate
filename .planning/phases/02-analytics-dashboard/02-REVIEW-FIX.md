---
phase: 02-analytics-dashboard
fixed_at: 2026-05-21T12:15:00Z
review_path: .planning/phases/02-analytics-dashboard/02-REVIEW.md
iteration: 1
findings_in_scope: 3
fixed: 3
skipped: 0
status: all_fixed
---

# Phase 02: Code Review Fix Report

**Fixed at:** 2026-05-21T12:15:00Z
**Source review:** .planning/phases/02-analytics-dashboard/02-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 3
- Fixed: 3
- Skipped: 0

## Fixed Issues

### WR-01: Falsy-zero bug in deltaLabel and deltaDir suppresses real changes

**Files modified:** `app/pages/platform/analytics.vue`
**Commit:** 2a3bb19
**Applied fix:** Replaced `!current` and `!prev` falsy guards with `current == null` and `prev == null` null checks. This ensures that a value of `0` (a valid count) is no longer treated as missing data, so a drop from 50 to 0 correctly shows "-100%" instead of "ingen aendring".

### WR-02: isQr typed as boolean but SQL expression can return NULL

**Files modified:** `server/api/restaurants/[slug]/analytics.get.ts`
**Commit:** d104ac6
**Applied fix:** Wrapped the `(utm_source = 'qr')` SQL expression in `coalesce(..., false)` in both the current-period and previous-period queries (select and groupBy clauses). This collapses the three-valued NULL/true/false grouping into two groups (true/false) and keeps the `sql<boolean>` type annotation honest.

### WR-03: sessionStorage accessed without SSR guard in exported function

**Files modified:** `app/lib/analytics/events.ts`
**Commit:** f079e03
**Applied fix:** Added `if (!import.meta.client) return 'ssr'` guard at the top of `getSessionId()` and `if (!import.meta.client) return` guard at the top of `trackEvent()`. This prevents `ReferenceError` on `sessionStorage`, `window`, `navigator`, and `document` if either function is ever called during server-side rendering.

---

_Fixed: 2026-05-21T12:15:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
