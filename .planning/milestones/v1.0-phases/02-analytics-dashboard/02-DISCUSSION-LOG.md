# Phase 2: Analytics Dashboard - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-21
**Phase:** 02-analytics-dashboard
**Areas discussed:** Dashboard layout, Time period controls, Dish popularity view, QR scan tracking

---

## Dashboard Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated analytics page | New /platform/analytics page in the sidebar | ✓ |
| Replace dashboard placeholders | Fill in existing stat cards, everything on one page | |
| Per-restaurant tab | Analytics as a tab within each restaurant's detail page | |

**User's choice:** Dedicated analytics page
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Show live summary stats | Fill placeholder cards with real numbers on main dashboard | ✓ |
| Keep as placeholders | Leave dashboard cards as-is | |

**User's choice:** Show live summary stats
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Menu views + QR scans + dish interactions + top dish | Four stat cards with these metrics | ✓ |
| Menu views + QR scans + unique sessions + conversion rate | Funnel-focused metrics | |
| You decide | Claude picks | |

**User's choice:** Menu views + QR scans + dish interactions + top dish
**Notes:** None

---

## Time Period Controls

| Option | Description | Selected |
|--------|-------------|----------|
| Segmented tabs: 7d / 30d / All time | Simple pill-style tabs, global scope | ✓ |
| Dropdown selector | More options but more clicks | |
| Date range picker | Calendar-based custom range | |

**User's choice:** Segmented tabs: 7d / 30d / All time
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, show deltas | Compare current period to previous equivalent | ✓ |
| No, just totals | Show number only | |

**User's choice:** Yes, show deltas
**Notes:** StatCard already supports delta + direction props

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, a simple trend line | Line chart showing daily counts | ✓ |
| No charts for now | Numbers only | |
| You decide | Claude picks | |

**User's choice:** Yes, a simple trend line
**Notes:** None

---

## Dish Popularity View

| Option | Description | Selected |
|--------|-------------|----------|
| Ranked table | Table sorted by most viewed/interacted | ✓ |
| Bar chart | Horizontal bar chart | |
| Card grid | Cards with stats overlay | |

**User's choice:** Ranked table
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Total views (page_open) | Rank by page opens | ✓ |
| Interactions (viewer_loaded + AR clicks) | Rank by engagement | |
| Combined score | Weighted combo | |

**User's choice:** Total views (page_open)
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, show both views and interactions | Both columns visible | ✓ |
| Views only | Minimal columns | |

**User's choice:** Yes, show both views and interactions
**Notes:** None

---

## QR Scan Tracking

| Option | Description | Selected |
|--------|-------------|----------|
| Track as 'menu_open' event | Reuse existing event type | ✓ |
| New 'qr_scan' event type | Dedicated event via redirect URL | |
| You decide | Claude picks | |

**User's choice:** Track as 'menu_open' event
**Notes:** No new event type needed

| Option | Description | Selected |
|--------|-------------|----------|
| UTM parameter on QR URL | /r/[slug]?utm_source=qr | ✓ |
| Referrer-based detection | Check empty referrer | |
| You decide | Claude picks | |

**User's choice:** UTM parameter on QR URL
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Per-restaurant only | QR codes link to restaurant page | ✓ |
| Per-restaurant + per-dish | Also track dish selection after scan | |

**User's choice:** Per-restaurant only
**Notes:** QR codes link to /r/[slug], not individual dishes

---

## Claude's Discretion

- Chart library selection for the trend line
- Exact Danish labels and copy
- API endpoint design for aggregated analytics
- Database indexes on analyticsEvents

## Deferred Ideas

None — discussion stayed within phase scope
