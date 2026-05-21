---
phase: 03-ui-polish
plan: 02
subsystem: ui
tags: [vue3, nuxt4, composables, toast, actionbutton, loading-states, error-handling]

# Dependency graph
requires:
  - phase: 03-01
    provides: useToast composable, ActionButton component, ToastContainer in platform layout
provides:
  - dishes/[id].vue wired with ActionButton + useToast for save/archive/delete/generate actions
  - dishes/new.vue wired with ActionButton + useToast for create action
  - restaurants.vue wired with ActionButton + useToast for create/delete actions
  - settings.vue profileSaved/setTimeout pattern replaced with toast.success
affects: [03-03, future-ui-phases]

# Tech tracking
tech-stack:
  added: []
  patterns: [useToast + ActionButton pattern applied to all platform CRUD pages]

key-files:
  created: []
  modified:
    - app/pages/platform/dishes/[id].vue
    - app/pages/platform/dishes/new.vue
    - app/pages/platform/restaurants.vue
    - app/pages/platform/settings.vue

key-decisions:
  - "Restaurant delete is immediate (no restore endpoint) — used toast.success not toast.undo to avoid promising undo without a mechanism"
  - "dishes/[id].vue generate button lives inside AdminGenerationStatus component — wired toast.success via handleJobCreated event handler"
  - "Inline field validation messages (e.g. 'Indtast venligst et restaurantnavn') preserved as errorMessage — only async catch errors migrated to toast"

patterns-established:
  - "All async action catch blocks: const e = err as { data?: { message?: string }; message?: string }; toast.error(e?.data?.message ?? 'Noget gik galt — prøv igen')"
  - "ActionButton replaces every action button with :loading bound to the operation-specific ref"
  - "No inline success/error <p> or <span> elements remain — all async feedback via toast"

requirements-completed: [UIPOL-01, UIPOL-02]

# Metrics
duration: 8min
completed: 2026-05-22
---

# Phase 3 Plan 02: UI Polish — CRUD Pages Summary

**ActionButton + useToast wired into all four platform CRUD pages, replacing ad-hoc inline success/error text and loading ternaries with consistent spinner buttons and Danish toast notifications**

## Performance

- **Duration:** 8 min
- **Started:** 2026-05-22T00:00:00Z
- **Completed:** 2026-05-22T00:08:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- All save/delete/create/generate buttons on dish, restaurant, and settings pages now use ActionButton with spinner
- Every async action outcome (success or failure) shows a toast notification with Danish text
- Settings page profileSaved ref and setTimeout pattern completely removed — replaced by toast.success('Profil gemt')
- Delete actions across all pages use toast (server-side immediate delete; undo not promised without restore endpoint)
- 3D generation feedback wired via handleJobCreated event: toast.success('3D-model genereres nu')

## Task Commits

1. **Task 1: Wire ActionButton + toast into dishes/[id].vue and dishes/new.vue** - `2646d44` (feat)
2. **Task 2: Wire ActionButton + toast into restaurants.vue and settings.vue** - `e5efa14` (feat)

**Plan metadata:** _(pending docs commit)_

## Files Created/Modified

- `app/pages/platform/dishes/[id].vue` — ActionButton for save/archive/delete, toast for all async outcomes, removed saveSuccess/saveError/archiveError refs
- `app/pages/platform/dishes/new.vue` — ActionButton for create, toast.error in catch block
- `app/pages/platform/restaurants.vue` — ActionButton for create, toast.success on create/delete, toast.error in catch
- `app/pages/platform/settings.vue` — ActionButton for save, removed profileSaved + setTimeout, toast.success('Profil gemt')

## Decisions Made

- **Restaurant delete uses toast.success not toast.undo**: The delete call is sent to server immediately. Promising undo without a restore endpoint would be misleading — used `toast.success('Restaurant slettet')` instead.
- **Dish generate toast wired via event handler**: The actual generate button lives inside `AdminGenerationStatus` component. Rather than modifying that component in this plan, the `handleJobCreated` event handler in the page was updated to call `toast.success('3D-model genereres nu')`.
- **Inline field validation preserved**: Short messages like "Indtast venligst et restaurantnavn" remain as `errorMessage.value` assignments for synchronous validation before any async call. Only async catch errors migrated to toast.

## Deviations from Plan

None — plan executed exactly as written. The toast.undo decision for restaurant delete was addressed explicitly in the plan ("use your judgment based on what the current handler does") and documented above.

## Issues Encountered

Pre-existing TypeScript errors exist in the codebase (unrelated files: `~/types` module not found, server Drizzle `.count` property issues, etc.). These were present before this plan and are out of scope per deviation rules. No new type errors were introduced.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- All four CRUD pages now use consistent ActionButton + toast pattern
- UIPOL-01 (loading states) and UIPOL-02 (error messages) requirements fulfilled
- Ready for Phase 3 Plan 03 (if it exists) or phase completion

---
*Phase: 03-ui-polish*
*Completed: 2026-05-22*
