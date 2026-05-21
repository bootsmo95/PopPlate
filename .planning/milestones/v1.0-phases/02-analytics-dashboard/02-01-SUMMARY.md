---
phase: 02-analytics-dashboard
plan: "01"
subsystem: analytics
tags: [analytics, utm-tracking, api, schema, migration]
dependency_graph:
  requires: []
  provides:
    - "GET /api/restaurants/[slug]/analytics — aggregated analytics endpoint"
    - "utm_source column in analytics_events table"
    - "UTM tracking in QR URLs and client event payloads"
  affects:
    - server/database/schema.ts
    - server/api/public/analytics.post.ts
    - app/lib/analytics/events.ts
    - server/api/dishes/[id]/qr.get.ts
tech_stack:
  added: []
  patterns:
    - "Drizzle sql`` tagged templates for PostgreSQL-specific aggregations (filter where, to_char)"
    - "UTM parameter threading: QR URL -> browser -> client payload -> server storage -> API aggregation"
key_files:
  created:
    - server/database/migrations/0004_add_utm_source.sql
    - server/api/restaurants/[slug]/analytics.get.ts
  modified:
    - server/database/schema.ts
    - server/api/public/analytics.post.ts
    - app/lib/analytics/events.ts
    - server/api/dishes/[id]/qr.get.ts
decisions:
  - "QR scan counting uses menu_open events filtered by utmSource='qr' (not a separate event type)"
  - "prevWhere is null for 'all' period; prev counts default to 0 rather than running a second full-table scan"
  - "Migration run deferred to deployment (db connection not available in dev/CI environment)"
metrics:
  duration: "2m 8s"
  completed_date: "2026-05-21"
  tasks_completed: 2
  tasks_total: 2
---

# Phase 2 Plan 01: Analytics Backend Infrastructure Summary

**One-liner:** UTM source tracking end-to-end (QR URL param -> client event payload -> DB column) plus restaurant-level analytics aggregation API with time-period filtering, daily series, and dish ranking.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Schema migration and UTM tracking wiring | 0d49e66 | schema.ts, 0004_add_utm_source.sql, analytics.post.ts, events.ts, qr.get.ts |
| 2 | Restaurant analytics aggregation API endpoint | 5ee2ee0 | server/api/restaurants/[slug]/analytics.get.ts |

## What Was Built

**Task 1 — UTM tracking infrastructure:**
- Created migration `0004_add_utm_source.sql` adding `utm_source text` column to `analytics_events`
- Added `utmSource: text('utm_source')` to Drizzle schema definition
- Updated `analytics.post.ts` to accept `utmSource` from request body and store it (truncated to 50 chars)
- Updated `events.ts` `trackEvent()` to read `?utm_source` from `window.location.search` and include it in the POST payload
- Updated `qr.get.ts` to append `?utm_source=qr` to QR code public URLs

**Task 2 — Restaurant analytics API:**
- Created `GET /api/restaurants/[slug]/analytics` at `server/api/restaurants/[slug]/analytics.get.ts`
- Auth via `requireAuth` + ownership check (`hasUnlimitedAccess(user) || restaurant.ownerId === user.id`)
- Slug-based restaurant lookup using parameterized `eq(restaurants.slug, slug)` (no SQL injection)
- Query param `?period=7d|30d|all` controls time window (default 30d)
- Current period aggregate counts: `menuViews` (page_open), `qrScans` (menu_open + utmSource='qr'), `interactions` (viewer_loaded + ar_launch_clicked + menu_ar_launch_clicked)
- Previous period comparison using same window shifted back in time; defaults to zeros for `all` period
- Daily time series via PostgreSQL `to_char(createdAt, 'YYYY-MM-DD')` grouping
- Dish popularity ranking via inner join with dishes table, ordered by page_open count descending
- Return shape: `{ menuViews, qrScans, interactions, topDish, prev, daily, dishRanking }`

## Deviations from Plan

None - plan executed exactly as written. The `db:migrate` step was attempted but skipped due to no database connection in the execution environment (expected for local dev/CI). The migration file exists and will run on deployment.

## Known Stubs

None. No placeholder data or hardcoded values in any file created or modified.

## Threat Surface Scan

All security surfaces were covered per the plan's threat model:
- T-02-01 (utmSource spoofing): accepted, truncated to 50 chars
- T-02-02 (info disclosure): mitigated by requireAuth + ownership check
- T-02-03 (tampering): existing rate limiter (30/min per IP) protects analytics.post.ts
- T-02-04 (slug injection): parameterized Drizzle eq() query only

No new threat surfaces introduced beyond what was planned.

## Self-Check: PASSED

Files created:
- server/database/migrations/0004_add_utm_source.sql — FOUND
- server/api/restaurants/[slug]/analytics.get.ts — FOUND

Commits:
- 0d49e66 — FOUND (feat(02-01): add utmSource tracking)
- 5ee2ee0 — FOUND (feat(02-01): add restaurant analytics aggregation endpoint)
