# Phase 1: Generation Tracking & Enforcement - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-21
**Phase:** 01-generation-tracking-enforcement
**Areas discussed:** Counting strategy, Tier limits, Usage visibility, Limit-hit experience

---

## Counting Strategy

### Q1: Count scope

| Option | Description | Selected |
|--------|-------------|----------|
| Per user | Each user has their own 31-day generation budget | ✓ |
| Per restaurant | Restaurant gets a shared pool among members | |
| You decide | Claude picks | |

**User's choice:** Per user (Recommended)
**Notes:** Simpler, maps to account tier on the user.

### Q2: Data source

| Option | Description | Selected |
|--------|-------------|----------|
| Query generationJobs | COUNT(*) with time filter, no new table | ✓ |
| Separate usage table | Pre-aggregated counts, adds sync complexity | |
| You decide | Claude picks based on scale | |

**User's choice:** Query generationJobs (Recommended)
**Notes:** Data already exists in generationJobs table.

---

## Tier Limits

### Q3: Monthly generation limits

| Option | Description | Selected |
|--------|-------------|----------|
| Conservative | Free: 5, Basic: 25, Pro: 100 | |
| Generous | Free: 10, Basic: 50, Pro: unlimited | |
| Custom | User specifies | ✓ |

**User's choice:** Free: 15/month, Basic: 50/month, Pro: 150/month. Make a file where limits are easily adjustable.

### Q4: Per-dish limits

| Option | Description | Selected |
|--------|-------------|----------|
| Keep both | Monthly + per-dish limits coexist | ✓ |
| Replace with monthly only | Remove per-dish limits | |

**User's choice:** Keep both (Recommended)

---

## Usage Visibility

### Q5: Where to show usage

| Option | Description | Selected |
|--------|-------------|----------|
| Generate button area | Show count near the generate button | |
| Dashboard + generate button | Widget on dashboard AND near button | |
| Settings/account page | Show on a dedicated account/plan page | ✓ |

**User's choice:** Settings/account page

---

## Limit-Hit Experience

### Q6: What happens at limit

| Option | Description | Selected |
|--------|-------------|----------|
| Block + upgrade CTA | Disable button, show upgrade prompt | |
| Block + reset countdown | Show when next slot opens | |
| Both | Upgrade CTA + countdown | |

**User's choice:** Disable generate button. Show limit message in Danish. Monthly billing cycle reset based on subscription date (or signup date if no subscription).
**Notes:** Changed from rolling 31-day window to monthly billing cycle anchored to subscription/signup date.

---

## Claude's Discretion

- Exact Danish wording for the limit message
- Database index decisions for query performance
- Billing cycle start date computation utility design

## Deferred Ideas

None
