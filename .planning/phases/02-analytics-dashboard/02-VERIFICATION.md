---
phase: 02-analytics-dashboard
verified: 2026-05-21T20:30:00Z
status: human_needed
score: 5/5 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Navigate to /platform/analytics and verify stat cards render real numbers when analytics data exists"
    expected: "Four stat cards show menu views, QR scans, interactions, and top dish name with delta percentages"
    why_human: "Cannot verify rendered output or visual layout without running the app"
  - test: "Click time period tabs (7 dage, 30 dage, Alt tid) and verify data updates"
    expected: "All stat cards, trend chart, and dish table refresh with data for the selected period"
    why_human: "Requires live server and database with analytics events to observe refetch behavior"
  - test: "Verify trend chart renders correctly with vue-chartjs"
    expected: "Line chart with clay stroke (#b87a4e) and warm fill, responsive, tooltips on hover"
    why_human: "Chart rendering is visual and depends on Chart.js canvas output"
  - test: "Verify dashboard stat cards at /platform show live analytics instead of placeholders"
    expected: "AR-visninger and QR-scans cards show numbers (or '--') with caption 'sidst 30 dage', not 'kommer snart'"
    why_human: "Need to confirm visual rendering of live data on dashboard page"
  - test: "Check mobile responsiveness at < 480px"
    expected: "Stat cards stack to single column, table remains scrollable/readable"
    why_human: "Responsive layout verification requires visual inspection at multiple breakpoints"
---

# Phase 2: Analytics Dashboard Verification Report

**Phase Goal:** Restaurant owners can see how their menus are performing and which dishes drive engagement
**Verified:** 2026-05-21T20:30:00Z
**Status:** human_needed
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Owner can view total menu page views over a selected time period | VERIFIED | analytics.get.ts lines 64-82: aggregates `page_open` events as `menuViews`; analytics.vue lines 118-124: renders StatCard with `analytics?.menuViews`; period param (7d/30d/all) controls time window |
| 2 | Owner can see view and interaction counts broken down per dish | VERIFIED | analytics.get.ts lines 129-141: `dishRanking` query joins analyticsEvents with dishes, computes per-dish `views` (page_open) and `interactions` (viewer_loaded + ar_launch_clicked + menu_ar_launch_clicked); analytics.vue lines 160-185: renders table with rank, dish name, thumbnail, views, interactions |
| 3 | Owner can identify the most and least popular dishes by engagement | VERIFIED | analytics.get.ts line 141: dishRanking ordered by page_open count DESC; analytics.vue line 170: numbered rank column `i + 1`; topDish derived from dishRanking[0] (line 147) |
| 4 | Owner can see how many times their QR code has been scanned | VERIFIED | qr.get.ts line 29: `utm_source=qr` appended to QR URLs; events.ts line 21: client reads utm_source from URL; analytics.post.ts line 74: stores utmSource; analytics.get.ts lines 72-74: counts menu_open events where isQr=true as `qrScans`; analytics.vue lines 125-131: renders QR-scans StatCard |
| 5 | Dashboard allows switching between time windows (7 days, 30 days, all time) | VERIFIED | analytics.vue line 41: `period = ref<'7d' | '30d' | 'all'>('30d')`; lines 104-114: three filter-pill buttons; line 53: `watch(period, ...)` triggers refresh; analytics.get.ts lines 32-33: parses period param into days |

**Score:** 5/5 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `server/api/restaurants/[slug]/analytics.get.ts` | Restaurant-level analytics aggregation endpoint | VERIFIED | 152 lines, real Drizzle queries, auth + ownership check, returns menuViews/qrScans/interactions/topDish/prev/daily/dishRanking |
| `server/database/migrations/0004_add_utm_source.sql` | Schema migration adding utm_source column | VERIFIED | Contains `ALTER TABLE "analytics_events" ADD COLUMN "utm_source" text` |
| `server/database/schema.ts` | Updated analyticsEvents table with utmSource column | VERIFIED | Line 126: `utmSource: text('utm_source')` in analyticsEvents definition |
| `app/pages/platform/analytics.vue` | Analytics dashboard page | VERIFIED | 199 lines, 4 stat cards, period tabs, trend chart, dish ranking table, error state, empty state |
| `app/components/platform/AnalyticsTrendChart.vue` | Trend line chart component using vue-chartjs | VERIFIED | 83 lines, imports Line from vue-chartjs, registers Chart.js modules, clay stroke #b87a4e, SSR-safe motion check |
| `app/components/platform/Sidebar.vue` | Updated sidebar with Analyse nav entry | VERIFIED | Lines 113-118: NuxtLink to /platform/analytics with Icon name="analytics" and text "Analyse", positioned after "Retter" |
| `app/pages/platform/index.vue` | Dashboard with live stat card values | VERIFIED | Lines 45-56: AnalyticsSummary interface + useLazyFetch for 30d analytics; lines 131-143: AR-visninger and QR-scans cards use summaryAnalytics data |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| app/lib/analytics/events.ts | server/api/public/analytics.post.ts | $fetch POST with utmSource field | WIRED | events.ts line 21: reads utm_source from URL; line 29: includes utmSource in payload; line 32: POSTs to /api/public/analytics; analytics.post.ts line 39: destructures utmSource; line 74: stores it |
| server/api/restaurants/[slug]/analytics.get.ts | server/database/schema.ts | Drizzle aggregation queries on analyticsEvents | WIRED | analytics.get.ts line 2: imports analyticsEvents, dishes, restaurants; lines 53-61: current period query; lines 90-98: prev period query; lines 118-126: daily query; lines 129-141: dish ranking query |
| server/api/dishes/[id]/qr.get.ts | public dish URL | utm_source=qr appended to publicUrl | WIRED | qr.get.ts line 29: returns `${baseUrl}?utm_source=qr` |
| app/pages/platform/analytics.vue | /api/restaurants/[slug]/analytics | useLazyFetch with period query param | WIRED | analytics.vue line 48: fetches `/api/restaurants/${firstSlug.value}/analytics?period=${period.value}` |
| app/components/platform/AnalyticsTrendChart.vue | app/pages/platform/analytics.vue | props: daily array | WIRED | AnalyticsTrendChart.vue line 16: `defineProps<{ daily: Array<...> }>`; analytics.vue line 151: `<AnalyticsTrendChart :daily="analytics.daily" />` |
| app/pages/platform/index.vue | /api/restaurants/[slug]/analytics | useLazyFetch for 30d summary | WIRED | index.vue line 52: fetches `/api/restaurants/${firstSlug.value}/analytics?period=30d`; lines 133,139: uses summaryAnalytics.interactions and summaryAnalytics.qrScans |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| analytics.vue | analytics (AnalyticsData) | useLazyFetch -> GET /api/restaurants/[slug]/analytics | Yes -- Drizzle DB queries with count(*), groupBy, innerJoin | FLOWING |
| analytics.vue (trend chart) | analytics.daily | Same API -> daily time series query | Yes -- to_char + count groupBy on analyticsEvents | FLOWING |
| analytics.vue (dish table) | analytics.dishRanking | Same API -> dish ranking query | Yes -- innerJoin dishes, filter where aggregations | FLOWING |
| index.vue | summaryAnalytics | useLazyFetch -> GET /api/restaurants/[slug]/analytics?period=30d | Yes -- same real DB queries | FLOWING |

### Behavioral Spot-Checks

Step 7b: SKIPPED (requires running server with database connection to test API endpoints)

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| ANLT-01 | 02-01, 02-02 | Restaurant owner can view total menu page views over time | SATISFIED | API returns menuViews (page_open count); analytics.vue renders it in StatCard with period filtering |
| ANLT-02 | 02-01, 02-02 | Restaurant owner can view per-dish view and interaction counts | SATISFIED | API returns dishRanking with per-dish views and interactions; analytics.vue renders ranked table |
| ANLT-03 | 02-01, 02-02 | Restaurant owner can see dish popularity ranking | SATISFIED | dishRanking ordered by page_open DESC; rendered as numbered table with rank, name, thumbnail |
| ANLT-04 | 02-01, 02-02 | Analytics dashboard shows trends over configurable time periods | SATISFIED | Period tabs (7d/30d/all); daily time series rendered as Line chart; delta comparisons on stat cards |
| ANLT-05 | 02-01, 02-02 | QR code scan events are tracked and displayed | SATISFIED | QR URLs get utm_source=qr; client detects and sends utmSource; server stores it; API aggregates qrScans; dashboard displays QR-scans stat card |

No orphaned requirements found -- all 5 ANLT requirements are mapped to plans and satisfied.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| (none) | - | - | - | No TODO, FIXME, placeholder, stub, or hardcoded empty patterns found in any phase 2 files |

The "kommer snart" placeholder text that previously existed in index.vue (dashboard stat cards) has been fully removed -- grep returns 0 matches.

### Human Verification Required

### 1. Analytics Page Visual Rendering

**Test:** Navigate to /platform/analytics with analytics data in the database. Verify four stat cards, trend chart, and dish ranking table all render correctly.
**Expected:** Stat cards show numbers with delta percentages. Line chart shows daily trend with clay stroke. Table shows ranked dishes with thumbnails.
**Why human:** Visual rendering, chart output, and layout verification require running the app.

### 2. Time Period Switching

**Test:** Click each time period tab (7 dage, 30 dage, Alt tid) on the analytics page.
**Expected:** All sections refetch and update. Data changes reflect the selected period.
**Why human:** Requires live server with database to observe refetch behavior and data changes.

### 3. Dashboard Live Stat Cards

**Test:** Visit /platform and check the AR-visninger and QR-scans stat cards.
**Expected:** Cards show live numbers (or "--" if no data) with caption "sidst 30 dage", not "kommer snart".
**Why human:** Need to verify rendered output in browser.

### 4. Empty State and Error State

**Test:** Visit /platform/analytics with no analytics events in the database, and also test with a network error.
**Expected:** Empty state shows "Ingen data endnu" message. Error state shows "Kunne ikke hente analystal."
**Why human:** Requires specific database states and network conditions.

### 5. Mobile Responsiveness

**Test:** Resize browser to < 480px on the analytics page.
**Expected:** Stat cards stack to single column. Table and chart remain usable.
**Why human:** Visual layout verification at specific breakpoints.

### Gaps Summary

No code-level gaps found. All five ROADMAP success criteria are backed by substantive, wired, data-flowing artifacts. The UTM tracking chain is complete end-to-end (QR URL -> client detection -> server storage -> API aggregation -> dashboard display). All five ANLT requirements are satisfied.

The remaining items are visual/behavioral checks that require running the application with a populated database.

---

_Verified: 2026-05-21T20:30:00Z_
_Verifier: Claude (gsd-verifier)_
