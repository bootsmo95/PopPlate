# Phase 1: Generation Tracking & Enforcement - Context

**Gathered:** 2026-05-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Track 3D model generations per user on a monthly billing cycle and enforce tier-based limits. When a user hits their limit, disable the generate button and show a Danish-language message. Show usage stats on the settings/account page.

</domain>

<decisions>
## Implementation Decisions

### Counting Strategy
- **D-01:** Count generations **per user** (not per restaurant). Each user has their own monthly budget tied to their account tier.
- **D-02:** Query the existing `generationJobs` table directly — `COUNT(*) WHERE requestedByUserId = X AND createdAt >= cycleStart`. No new table needed.
- **D-03:** **Monthly billing cycle reset**, not rolling 31-day window. The cycle resets on the user's subscription start date each month. If no subscription, use the user's signup date (`createdAt` on `users` table) as the anchor.

### Tier Limits
- **D-04:** Monthly generation limits: **free: 15, basic: 50, pro: 150**. Add `maxGenerationsPerMonth` to the `TierLimits` interface in `server/utils/tiers.ts`.
- **D-05:** **Keep existing per-dish limits** (`maxRegenerationsPerDish`) alongside the new monthly limits. Both are enforced — monthly caps total usage, per-dish prevents waste on a single dish.

### Usage Visibility
- **D-06:** Show generation usage on the **settings/account page** only. Display format: "X / Y generations used this month" with tier name.

### Limit-Hit Experience
- **D-07:** When monthly limit is reached: **disable the generate button** and show a message in Danish explaining they've hit their limit.
- **D-08:** No upgrade CTA or countdown for now — just the limit message.

### Claude's Discretion
- Exact Danish wording for the limit message
- Whether to add an index on `generationJobs(requestedByUserId, createdAt)` for query performance
- How to compute the billing cycle start date (utility function design)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Tier System
- `server/utils/tiers.ts` — Current tier definitions (free/basic/pro) with `TierLimits` interface. Monthly limits will be added here.

### Generation Workflow
- `server/api/dishes/[id]/generate.post.ts` — Existing generation endpoint with per-dish limit checking. Monthly limit check will be added here.
- `server/database/schema.ts` — Schema for `generationJobs` table (has `requestedByUserId`, `createdAt`) and `users` table (has `createdAt` for signup date).

### Access Control
- `server/utils/access.ts` — `hasUnlimitedAccess()` function used to skip limits for admin users.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `generationJobs` table: Already tracks every generation with `requestedByUserId` and `createdAt` — no new table needed
- `getTierLimits()` in `server/utils/tiers.ts`: Returns tier config, extend with `maxGenerationsPerMonth`
- `hasUnlimitedAccess()` in `server/utils/access.ts`: Bypasses limits for admin — reuse for monthly limit too
- `generate.post.ts`: Existing limit checking pattern (per-dish) can be extended with monthly check

### Established Patterns
- Limit checks happen in API endpoint handlers before creating the job
- Errors thrown via `createError({ statusCode: 403, message: '...' })`
- Client-side error display via `err.data?.message ?? err.message` pattern

### Integration Points
- `server/utils/tiers.ts` — Add `maxGenerationsPerMonth` to `TierLimits` interface and `TIER_LIMITS` record
- `server/api/dishes/[id]/generate.post.ts` — Add monthly limit check before the existing per-dish check
- New API endpoint needed: `GET /api/user/usage` (or similar) to return current month's generation count for settings page
- Settings/account page (frontend) — Add usage display component

</code_context>

<specifics>
## Specific Ideas

- User wants the limit message in **Danish** (the app targets Danish restaurants)
- Billing cycle anchored to subscription date or signup date — not a fixed calendar month or rolling window
- Limits should be easily adjustable in `tiers.ts` (all in one place)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-generation-tracking-enforcement*
*Context gathered: 2026-05-21*
