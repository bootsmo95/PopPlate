---
phase: 01-generation-tracking-enforcement
plan: 01
subsystem: api
tags: [drizzle, nuxt, generation-limits, billing-cycle, tier-enforcement]

# Dependency graph
requires: []
provides:
  - "maxGenerationsPerMonth field on TierLimits (15/50/150 for free/basic/pro)"
  - "getBillingCycleStart() utility for monthly billing cycle date math"
  - "getMonthlyGenerationCount() Drizzle query for counting jobs in current cycle"
  - "Monthly generation limit enforcement in generate.post.ts (403 on limit hit)"
  - "GET /api/user/usage endpoint returning usage data for frontend"
affects: [01-02-generation-tracking-enforcement]

# Tech tracking
tech-stack:
  added: []
  patterns: ["billing cycle anchored to user signup date", "monthly limit check before per-dish limit check"]

key-files:
  created:
    - server/utils/generation-usage.ts
    - server/api/user/usage.get.ts
  modified:
    - server/utils/tiers.ts
    - server/api/dishes/[id]/generate.post.ts

key-decisions:
  - "Count ALL generation jobs regardless of status (not just ready) since the generation was consumed regardless of outcome"
  - "Billing cycle anchored to user createdAt date, clamping anchor day to last day of month for edge cases"
  - "Admin users bypass monthly limit via existing hasUnlimitedAccess check"
  - "Usage API returns limit: null for unlimited users so frontend can distinguish no-cap from numeric cap"

patterns-established:
  - "Monthly limit check pattern: getBillingCycleStart(anchor) -> getMonthlyGenerationCount(userId, cycleStart) -> compare against getTierLimits().maxGenerationsPerMonth"
  - "Usage API pattern: authenticated endpoint returning { used, limit, tierName, cycleStart, unlimited }"

requirements-completed: [USAG-01, USAG-02, USAG-03]

# Metrics
duration: 4min
completed: 2026-05-21
---

# Phase 1 Plan 1: Server-Side Generation Tracking Summary

**Monthly generation limits (15/50/150) with billing-cycle-aware counting and enforcement in generate endpoint, plus GET /api/user/usage for frontend consumption**

## Performance

- **Duration:** 4 min
- **Started:** 2026-05-21T18:52:22Z
- **Completed:** 2026-05-21T18:57:14Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Extended TierLimits with maxGenerationsPerMonth (free:15, basic:50, pro:150)
- Built billing cycle start calculation anchored to user signup date with month-end clamping
- Added monthly limit enforcement in generate.post.ts returning 403 with Danish message
- Created GET /api/user/usage returning used count, limit, tier name, cycle start, and unlimited flag

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend TierLimits and create generation-usage utility** - `8eb332e` (feat)
2. **Task 2: Enforce monthly limit in generate endpoint and create usage API** - `4a8adc7` (feat)

## Files Created/Modified
- `server/utils/tiers.ts` - Added maxGenerationsPerMonth to TierLimits interface and all tier entries
- `server/utils/generation-usage.ts` - New utility with getBillingCycleStart() and getMonthlyGenerationCount()
- `server/api/dishes/[id]/generate.post.ts` - Added monthly limit check block before per-dish check
- `server/api/user/usage.get.ts` - New authenticated endpoint returning generation usage data

## Decisions Made
- Count all generation jobs (not just status='ready') since the generation resource was consumed regardless of outcome
- Billing cycle anchored to user's createdAt date with clamping for months with fewer days than the anchor day
- Usage API returns `limit: null` for admin/unlimited users to let frontend distinguish unlimited from a numeric cap
- Danish error message uses ASCII-safe characters (naaet/maanedlige/graense) matching existing codebase patterns

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- TypeScript not directly installed as a project dependency; used `nuxi typecheck` instead of `tsc --noEmit`
- Pre-existing type errors in unrelated files (restaurants/index.post.ts, storage route, authentik.ts) -- not introduced by this plan, out of scope

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Backend generation tracking and enforcement is complete
- GET /api/user/usage is ready for frontend consumption in Plan 02
- Monthly limit check is active in the generate endpoint

## Self-Check: PASSED

All 4 files verified present. Both task commits (8eb332e, 4a8adc7) verified in git log.

---
*Phase: 01-generation-tracking-enforcement*
*Completed: 2026-05-21*
