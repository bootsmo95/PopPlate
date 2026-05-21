---
phase: 01-generation-tracking-enforcement
fixed_at: 2026-05-21T20:30:00Z
review_path: .planning/phases/01-generation-tracking-enforcement/01-REVIEW.md
iteration: 1
findings_in_scope: 5
fixed: 5
skipped: 0
status: all_fixed
---

# Phase 1: Code Review Fix Report

**Fixed at:** 2026-05-21T20:30:00Z
**Source review:** .planning/phases/01-generation-tracking-enforcement/01-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 5 (1 Critical, 4 Warning)
- Fixed: 5
- Skipped: 0

## Fixed Issues

### CR-01: Race condition between monthly limit check and job insert (TOCTOU)

**Files modified:** `server/api/dishes/[id]/generate.post.ts`
**Commit:** 51f3653
**Applied fix:** Wrapped the limit checks, job insert, and dish status update in a `db.transaction()` call. All queries within the transaction use the `tx` handle instead of the module-level `db`. The monthly count query was inlined (previously delegated to `getMonthlyGenerationCount` which uses its own `db` reference) so it runs within the transaction context. Added `gte` to the drizzle-orm import. This also addresses WR-04 (see below).

### WR-01: Usage data not refreshed after generation

**Files modified:** `app/pages/platform/dishes/[id].vue`
**Commit:** c44bc14
**Applied fix:** Destructured `refresh: refreshUsage` from the `useLazyFetch` call for usage data, and added `refreshUsage()` to the `Promise.all` in `handleJobCreated`. The usage counter and `monthlyLimitReached` computed now update immediately after a generation is created.

### WR-02: Nested p-card creates card-within-card layout

**Files modified:** `app/pages/platform/settings.vue`
**Commit:** 11d2b66
**Applied fix:** Moved the usage display card div outside the profile form's p-card container. The profile p-card now closes after the form, and the usage card is a sibling element with `mt-5` spacing.

### WR-03: Empty catch blocks swallow errors silently

**Files modified:** `app/pages/platform/settings.vue`
**Commit:** 0f6522c
**Applied fix:** Added a `profileError` ref. `loadProfile` catch now logs to console. `saveProfile` catch now extracts the error message and sets `profileError`, which is displayed as a red text paragraph above the save button. The error is cleared on each new save attempt.

### WR-04: Duplicate hasUnlimitedAccess guards

**Files modified:** `server/api/dishes/[id]/generate.post.ts`
**Commit:** 51f3653
**Applied fix:** Combined into a single `if (!hasUnlimitedAccess(user))` block containing both the monthly limit check and the per-dish regeneration limit check. `getTierLimits` is now called once. Applied as part of the CR-01 transaction fix since both changes affect the same code region.

## Skipped Issues

None -- all findings were fixed.

---

_Fixed: 2026-05-21T20:30:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
