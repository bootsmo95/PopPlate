# Roadmap: PopPlate

## Overview

Three phases completing PopPlate's v1 feature set on top of the existing codebase. Phase 1 locks down cost control by tracking and enforcing generation limits. Phase 2 surfaces usage data to restaurant owners as actionable analytics. Phase 3 polishes the experience across all platforms so the product is ready to sell.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Generation Tracking & Enforcement** - Track model generations per user and enforce tier limits
- [x] **Phase 2: Analytics Dashboard** - Give restaurant owners visibility into menu performance and QR engagement
- [ ] **Phase 3: UI Polish** - Loading states, error handling, empty states, and mobile responsiveness across the platform

## Phase Details

### Phase 1: Generation Tracking & Enforcement
**Goal**: Users stay within their tier limits and can see how many generations they have used
**Depends on**: Nothing (first phase)
**Requirements**: USAG-01, USAG-02, USAG-03, USAG-04
**Success Criteria** (what must be TRUE):
  1. Every 3D model generation is recorded in the database with the user ID and timestamp
  2. A user on any tier can see their generation count for the current rolling 31-day window
  3. A user who has reached their tier limit cannot trigger a new generation — the action is blocked at the API level
  4. The user sees a clear, actionable message when their generation limit is reached (not a raw error)
**Plans:** 2 plans
Plans:
- [x] 01-01-PLAN.md — Backend: tier limits, billing cycle utility, monthly enforcement in generate endpoint, usage API
- [x] 01-02-PLAN.md — Frontend: usage display on settings page, disable generate button with Danish warning at limit

### Phase 2: Analytics Dashboard
**Goal**: Restaurant owners can see how their menus are performing and which dishes drive engagement
**Depends on**: Phase 1
**Requirements**: ANLT-01, ANLT-02, ANLT-03, ANLT-04, ANLT-05
**Success Criteria** (what must be TRUE):
  1. Owner can view total menu page views over a selected time period
  2. Owner can see view and interaction counts broken down per dish
  3. Owner can identify the most and least popular dishes by engagement
  4. Owner can see how many times their QR code has been scanned
  5. Dashboard allows switching between time windows (e.g., 7 days, 30 days, all time)
**Plans:** 2 plans
Plans:
- [x] 02-01-PLAN.md — Backend: UTM source schema migration, analytics event tracking wiring, restaurant analytics aggregation API
- [x] 02-02-PLAN.md — Frontend: analytics page with stat cards, trend chart, dish popularity table, sidebar entry, dashboard live stats
**UI hint**: yes

### Phase 3: UI Polish
**Goal**: Every interaction on the platform feels complete — no spinners that never resolve, no blank screens, no broken layouts on mobile
**Depends on**: Phase 2
**Requirements**: UIPOL-01, UIPOL-02, UIPOL-03, UIPOL-04
**Success Criteria** (what must be TRUE):
  1. All async operations (generation, saves, loads) show a loading indicator while in progress
  2. API and network errors display a human-readable message instead of a raw error or silent failure
  3. Pages with no data yet show an empty state that tells the user what to do next
  4. All platform pages are usable on a mobile phone without horizontal scrolling or overlapping elements
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Generation Tracking & Enforcement | 2/2 | Complete | 2026-05-21 |
| 2. Analytics Dashboard | 2/2 | Complete | 2026-05-21 |
| 3. UI Polish | 0/TBD | Not started | - |
