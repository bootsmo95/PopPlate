# Phase 2: Analytics Dashboard - Context

**Gathered:** 2026-05-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Give restaurant owners visibility into how their menus are performing — page views, dish interactions, QR scan counts, and dish popularity rankings — through a dedicated analytics page with configurable time periods.

</domain>

<decisions>
## Implementation Decisions

### Dashboard Location
- **D-01:** Create a dedicated analytics page at `/platform/analytics` with a new sidebar entry. The main dashboard stays focused on quick actions and recent dishes.
- **D-02:** Also fill in the existing placeholder stat cards on the main dashboard ("AR-visninger", "QR-scans") with live summary numbers. These serve as a quick glance; the analytics page has full detail.

### Top-Level Stats
- **D-03:** Four stat cards at the top of the analytics page: total menu page views, QR scans, total dish interactions (viewer loads + AR clicks), and most popular dish name.

### Time Period Controls
- **D-04:** Segmented tabs at the top of the analytics page: **7d / 30d / All time**. Applies globally to all stats and charts on the page.
- **D-05:** Stat cards show **delta/trend** compared to the previous equivalent period (e.g., this 7d vs prior 7d). The existing `StatCard` component already supports `delta` and `deltaDirection` props.
- **D-06:** Include a **simple trend line chart** showing daily event counts over the selected time period.

### Dish Popularity
- **D-07:** Display dish popularity as a **ranked table** sorted by most viewed. Columns: rank, dish name (with thumbnail), views, interactions.
- **D-08:** Ranking is by **total views** (`page_open` events). Interactions (viewer loads + AR clicks) are shown as an additional column for engagement depth.

### QR Scan Tracking
- **D-09:** Track QR scans using the existing `menu_open` event type — no new event type needed.
- **D-10:** Distinguish QR scans from direct visits via a **UTM parameter** on QR code URLs: `/r/[slug]?utm_source=qr`. The client-side analytics code checks for this param and tags the event accordingly.
- **D-11:** QR scan counts are a **per-restaurant** metric only (QR codes link to the restaurant menu page, not individual dishes).

### Claude's Discretion
- Chart library selection for the trend line
- Exact Danish labels and copy for the analytics page
- API endpoint design for aggregated analytics queries
- Whether to add database indexes on `analyticsEvents` for query performance

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Analytics Infrastructure
- `server/api/public/analytics.post.ts` — Public endpoint that receives analytics events from client. Rate-limited. Validates event types and dish IDs.
- `server/api/dishes/[id]/analytics.get.ts` — Existing per-dish analytics endpoint (returns counts grouped by eventType). May need extending or a new restaurant-level endpoint.
- `app/lib/analytics/events.ts` — Client-side fire-and-forget event tracking. Tracks `page_open`, `viewer_loaded`, `ar_launch_clicked`, `menu_open`, `menu_dish_selected`, `menu_ar_launch_clicked`.

### Database Schema
- `server/database/schema.ts` — `analyticsEvents` table with `restaurantId`, `dishId`, `eventType`, `sessionId`, `userAgent`, `referrer`, `createdAt`. All data needed for aggregation is here.

### UI Components
- `app/components/platform/StatCard.vue` — Existing stat card with `delta`, `deltaDirection`, `caption`, and `sub` props. Reuse for analytics page stat cards.
- `app/pages/platform/index.vue` — Main dashboard with placeholder stat cards (lines 118-119) that need live data.
- `app/components/platform/DishTable.vue` — Existing dish table component that may inform the popularity table pattern.

### Sidebar Navigation
- `app/components/platform/Sidebar.vue` — Add analytics entry here.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `StatCard.vue`: Ready to use with delta/trend support — no modifications needed
- `analyticsEvents` table: Already stores all needed event data with `restaurantId` for restaurant-level aggregation
- `trackEvent()` in `events.ts`: Fire-and-forget pattern already established — extend with UTM detection
- `DishTable.vue`: Existing table pattern for dish listings — popularity table can follow similar structure

### Established Patterns
- Public endpoints at `/api/public/*` for unauthenticated tracking
- Authenticated endpoints use `requireAuth()` + ownership checks via `requireOwnedDish()` / restaurant ownership
- Drizzle ORM with `sql` template literals for aggregation queries (already used in `analytics.get.ts`)
- Danish language for all user-facing text
- `useLazyFetch` for client-side data loading

### Integration Points
- New API endpoint(s) needed for restaurant-level analytics aggregation (time-filtered, with period comparison)
- New page at `app/pages/platform/analytics.vue`
- Sidebar entry in `app/components/platform/Sidebar.vue`
- Update QR code generation to append `?utm_source=qr` to URLs
- Update main dashboard to fetch and display live stat card values

</code_context>

<specifics>
## Specific Ideas

- Dashboard placeholder cards already say "kommer snart" — replace with real data
- Danish language throughout (consistent with Phase 1)
- UTM parameter approach for QR tracking is lightweight and doesn't require server-side redirect infrastructure

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-analytics-dashboard*
*Context gathered: 2026-05-21*
