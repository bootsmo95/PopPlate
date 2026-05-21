---
phase: 01-generation-tracking-enforcement
reviewed: 2026-05-21T20:00:00Z
depth: standard
files_reviewed: 7
files_reviewed_list:
  - server/utils/tiers.ts
  - server/utils/generation-usage.ts
  - server/api/dishes/[id]/generate.post.ts
  - server/api/user/usage.get.ts
  - app/pages/platform/settings.vue
  - app/pages/platform/dishes/[id].vue
  - app/components/admin/GenerationStatus.vue
findings:
  critical: 1
  warning: 4
  info: 3
  total: 8
status: issues_found
---

# Phase 1: Code Review Report

**Reviewed:** 2026-05-21T20:00:00Z
**Depth:** standard
**Files Reviewed:** 7
**Status:** issues_found

## Summary

Phase 1 adds generation tracking (billing-cycle-aware monthly count), server-side enforcement in the generate endpoint, a usage API, and frontend display of usage with disabled buttons at the limit. The implementation is structurally sound -- imports are clean, the billing cycle date math handles edge cases correctly, and the API contract between backend and frontend is consistent.

The main concern is a TOCTOU race condition in the generate endpoint where the limit check and job insert are not atomic. There are also several warnings around missing transaction boundaries, stale usage data after generation, and a nested card layout bug. The rest are minor quality items.

## Critical Issues

### CR-01: Race condition between monthly limit check and job insert (TOCTOU)

**File:** `server/api/dishes/[id]/generate.post.ts:50-64`
**Issue:** The monthly generation count is checked at line 56, but the new job is inserted at line 91. These are separate queries with no transaction or row-level lock. Two concurrent POST requests from the same user can both pass the `monthlyCount >= limits.maxGenerationsPerMonth` check before either inserts a job, allowing the user to exceed their monthly limit. This is exploitable by opening two browser tabs and clicking generate simultaneously, or by scripting parallel requests.
**Fix:** Wrap the limit check and job insert in a single serializable transaction, or use a database-level advisory lock keyed on userId. At minimum, wrap lines 50-109 in a Drizzle transaction:
```typescript
const newJob = await db.transaction(async (tx) => {
  // Check monthly generation limit
  if (!hasUnlimitedAccess(user)) {
    const limits = getTierLimits(user.accountTier)
    const dbUser = await getDbUser(user.id)
    const anchorDate = dbUser?.createdAt ?? new Date()
    const cycleStart = getBillingCycleStart(anchorDate)

    // Use tx instead of db for the count query
    const [countResult] = await tx
      .select({ count: count() })
      .from(generationJobs)
      .where(and(
        eq(generationJobs.requestedByUserId, user.id),
        gte(generationJobs.createdAt, cycleStart),
      ))
    const monthlyCount = countResult?.count ?? 0

    if (monthlyCount >= limits.maxGenerationsPerMonth) {
      throw createError({
        statusCode: 403,
        message: 'Du har naaet din maanedlige graense for 3D-generationer...',
      })
    }
  }

  // ... per-dish check using tx ...

  const [newJob] = await tx
    .insert(generationJobs)
    .values({ ... })
    .returning()

  await tx
    .update(dishes)
    .set({ status: 'processing', updatedAt: new Date() })
    .where(eq(dishes.id, id))

  return newJob
})
```
This also addresses the related issue that the job insert and dish status update (lines 91-107) are not transactional -- if the dish update fails, an orphaned queued job exists with no dish status change.

## Warnings

### WR-01: Usage data not refreshed after generation

**File:** `app/pages/platform/dishes/[id].vue:420-422`
**Issue:** `handleJobCreated` refreshes jobs and dish data but does not refresh `usageData`. After a successful generation, the usage counter (and the `monthlyLimitReached` computed) remains stale until the page is reloaded. If the user was at limit-1 and just generated, they could attempt another generation (client-side button stays enabled) and only get caught by the server-side 403.
**Fix:** Add a refresh call for usage data. Destructure the refresh from useLazyFetch and call it:
```typescript
const { data: usageData, refresh: refreshUsage } = useLazyFetch<UsageData>('/api/user/usage', { headers: ssrHeaders })

async function handleJobCreated(_job: GenerationJob) {
  await Promise.all([refreshJobs(), refresh(), refreshUsage()])
}
```

### WR-02: Nested p-card creates card-within-card layout

**File:** `app/pages/platform/settings.vue:283`
**Issue:** The usage display `div` with class `p-card` is placed inside the profile form's `p-card` container (which starts at line 218). This creates a card nested inside a card, which likely results in double borders/padding and does not match the visual intent described in the plan (which says to add it "AFTER the profile form p-card").
**Fix:** Move the usage card div (lines 283-294) outside the closing `</div>` of the profile form card (line 295), so both cards are siblings:
```html
          </form>
        </div><!-- end profile p-card -->

        <div v-if="usageData && !usageData.unlimited" class="p-card mt-5">
          <!-- usage content -->
        </div>
```

### WR-03: Empty catch blocks swallow errors silently

**File:** `app/pages/platform/settings.vue:42,55`
**Issue:** Both `loadProfile()` (line 42) and `saveProfile()` (line 55) have empty catch blocks. The `saveProfile` case is particularly concerning -- if the PATCH fails, the user gets no feedback and `profileSaving` is set back to false as if nothing happened.
**Fix:** At minimum, log the error or set an error state for the save function:
```typescript
async function saveProfile() {
  profileSaving.value = true
  profileSaved.value = false
  try {
    await $fetch("/api/user/profile", {
      method: "PATCH",
      body: { displayName: profileDisplayName.value },
    })
    profileSaved.value = true
    setTimeout(() => (profileSaved.value = false), 3000)
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    // Surface error to user -- add a profileError ref
    profileError.value = e?.data?.message ?? e?.message ?? 'Kunne ikke gemme profil.'
  }
  profileSaving.value = false
}
```
Note: these empty catch blocks are pre-existing, not introduced by Phase 1, but they were in a file modified by this phase.

### WR-04: Duplicate hasUnlimitedAccess guard and getTierLimits call

**File:** `server/api/dishes/[id]/generate.post.ts:51,67`
**Issue:** Both the monthly limit check (line 51) and the per-dish limit check (line 67) independently call `hasUnlimitedAccess(user)` and `getTierLimits(user.accountTier)`. While not a bug, this means the tier limits object is retrieved twice from the same static map, and the pattern of two sequential `if (!hasUnlimitedAccess(user))` blocks is easy to accidentally break during future edits (e.g., someone wraps one but not the other in a new condition).
**Fix:** Combine into a single guard block:
```typescript
if (!hasUnlimitedAccess(user)) {
  const limits = getTierLimits(user.accountTier)

  // Monthly limit check
  const dbUser = await getDbUser(user.id)
  const anchorDate = dbUser?.createdAt ?? new Date()
  const cycleStart = getBillingCycleStart(anchorDate)
  const monthlyCount = await getMonthlyGenerationCount(user.id, cycleStart)
  if (monthlyCount >= limits.maxGenerationsPerMonth) {
    throw createError({ statusCode: 403, message: '...' })
  }

  // Per-dish regeneration limit check
  const [{ count: completedCount }] = await db
    .select({ count: count() })
    .from(generationJobs)
    .where(and(eq(generationJobs.dishId, id), eq(generationJobs.status, 'ready')))
  if (completedCount >= limits.maxRegenerationsPerDish) {
    throw createError({ statusCode: 403, message: '...' })
  }
}
```

## Info

### IN-01: Large blocks of commented-out code in settings.vue

**File:** `app/pages/platform/settings.vue:115-171,173-192,196-209`
**Issue:** Roughly 80 lines of commented-out HTML (tier card, invoice history, payment section). This is pre-existing and not introduced by Phase 1, but it adds noise to a file that was modified in this phase.
**Fix:** Remove commented-out blocks. If they are future features, track them in planning artifacts rather than in source code. They can be recovered from git history if needed.

### IN-02: Duplicate UsageData interface definition

**File:** `app/pages/platform/settings.vue:19-25` and `app/pages/platform/dishes/[id].vue:323-329`
**Issue:** The `UsageData` interface is defined identically in both files. If the API response shape changes, both must be updated.
**Fix:** Extract to a shared types file (e.g., `~/types/usage.ts`) and import in both pages. Alternatively, if the project uses Nuxt's auto-generated API types, rely on those instead.

### IN-03: Hardcoded invoice data in settings.vue

**File:** `app/pages/platform/settings.vue:74-79`
**Issue:** `INVOICES` array contains hardcoded strings with specific dates and amounts. This appears to be placeholder/mock data. While it is inside a commented-out section (so it has no runtime effect), it is still a live TypeScript declaration that will be bundled.
**Fix:** Remove along with the commented-out template block (see IN-01), or guard behind a feature flag if needed for development.

---

_Reviewed: 2026-05-21T20:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
