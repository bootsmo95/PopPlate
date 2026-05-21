---
phase: 03-ui-polish
fixed_at: 2026-05-22T00:00:00Z
review_path: .planning/phases/03-ui-polish/03-REVIEW.md
iteration: 1
findings_in_scope: 4
fixed: 4
skipped: 0
status: all_fixed
---

# Phase 03: Code Review Fix Report

**Fixed at:** 2026-05-22
**Source review:** .planning/phases/03-ui-polish/03-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 4
- Fixed: 4
- Skipped: 0

## Fixed Issues

### WR-01: setTimeout in useToast is never cancelled if the toast is dismissed early

**Files modified:** `app/composables/useToast.ts`
**Commit:** 9759d74
**Applied fix:** Added a `timerMap` (Map<string, ReturnType<typeof setTimeout>>) to track auto-dismiss timers. `addToast` stores the timer handle in the map, and `dismiss` clears and removes the timer before filtering the toast from state. This prevents stale timeout callbacks from firing after a toast is manually dismissed.

### WR-02: Non-null assertion on a computed that can return `undefined`

**Files modified:** `app/pages/platform/dishes/[id].vue`
**Commit:** 17699b1
**Applied fix:** Removed the trailing `!` non-null assertion from the `modelGlbUrl` computed. The return type is now `string | undefined`, which honestly reflects that `resolveModelUrl` can return `undefined`. The viewer component is already guarded by `v-if="dish.previewModelGlbUrl"` so undefined is never passed to it.

### WR-03: Error inside the polling interval is silently swallowed

**Files modified:** `app/pages/platform/dishes/[id].vue`
**Commit:** 851b267
**Applied fix:** Wrapped the `Promise.all` fetch calls and subsequent state updates inside a `try/catch` block within the `setInterval` callback. On any error (network failure, expired session, server error), `stopPolling()` is called to clear the interval and prevent silent repeated failures.

### WR-04: `saveProfile` does not reset loading state on exception

**Files modified:** `app/pages/platform/settings.vue`
**Commit:** cc71333
**Applied fix:** Moved `profileSaving.value = false` from after the try/catch block into a `finally` block, ensuring the loading flag is always reset regardless of how the function exits.

---

_Fixed: 2026-05-22_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
