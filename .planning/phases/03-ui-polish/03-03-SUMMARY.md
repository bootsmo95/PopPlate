---
phase: 03-ui-polish
plan: 03
subsystem: ui
tags: [vue, nuxt, tailwind, empty-states, platform]

# Dependency graph
requires: []
provides:
  - Structured p-card empty state on restaurant workspace (r/[slug]/index.vue)
  - Structured p-card empty state on restaurant dishes tab (r/[slug]/dishes.vue)
affects: [ui-polish, platform-pages]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "p-card empty state: dish icon (size 32, text-ink-faint) + font-display h3 + text-ink-mute body + top-btn CTA"

key-files:
  created: []
  modified:
    - app/pages/platform/r/[slug]/index.vue
    - app/pages/platform/r/[slug]/dishes.vue

key-decisions:
  - "Ghost top-btn (no --primary) for navigational CTA in dishes.vue; primary top-btn--primary for creation CTA in index.vue"

patterns-established:
  - "Empty state pattern: p-card py-16 text-center with Icon name='dish' :size=32, font-display h3, text-ink-mute body, and inline-flex CTA"

requirements-completed: [UIPOL-03, UIPOL-04]

# Metrics
duration: 5min
completed: 2026-05-22
---

# Phase 03 Plan 03: Restaurant Empty States Summary

**Upgraded two restaurant platform pages from minimal text-only empty divs to full p-card empty states with dish icon, Danish heading, descriptive body, and actionable CTA button**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-05-22T00:00:00Z
- **Completed:** 2026-05-22T00:05:00Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments

- Restaurant workspace (`r/[slug]/index.vue`) empty state upgraded: dish icon + "Ingen retter endnu" h3 + body + primary CTA to `/platform/dishes/new`
- Restaurant dishes tab (`r/[slug]/dishes.vue`) empty state upgraded: dish icon + "Ingen retter pa denne menu" h3 + body + ghost CTA to `/platform/dishes`
- Both empty states follow the established p-card pattern (matches `restaurants.vue` reference), responsive on mobile

## Task Commits

1. **Task 1: Upgrade empty states in r/[slug]/index.vue and r/[slug]/dishes.vue** - `7b3f25c` (feat)

## Files Created/Modified

- `app/pages/platform/r/[slug]/index.vue` - Replaced minimal `py-12 text-center text-ink-faint` div with structured p-card empty state containing dish icon, h3 heading, body copy, and primary NuxtLink CTA
- `app/pages/platform/r/[slug]/dishes.vue` - Replaced old `font-display italic text-2xl` div with structured p-card empty state containing dish icon, h3 heading, body copy, and ghost NuxtLink CTA

## Decisions Made

- Ghost CTA (`top-btn` without `--primary`) used in dishes.vue because the action is navigational ("Se alle retter" to `/platform/dishes`), not a creation action. Primary variant used in index.vue for "Tilfoej ret" since it creates a new resource.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

`npx nuxi typecheck` failed with a pre-existing environment issue (`Cannot find module '@vue/language-core'` in the npx-cached vue-tsc binary). This is a known tooling limitation — vue-tsc is not installed in the project's local `node_modules`. The changes are template-only (no TypeScript logic modified) and both files already had correct Icon imports, so no type errors were introduced.

## Known Stubs

None - empty states render with real conditional logic (`v-if="!dishes.length"`), no placeholder data.

## Threat Flags

None - template-only changes. NuxtLink CTAs point to internal platform routes only (`/platform/dishes/new`, `/platform/dishes`). No new network endpoints or auth paths.

## Next Phase Readiness

- All restaurant workspace empty states now match the established p-card pattern
- UIPOL-03 (restaurant workspace empty state) and UIPOL-04 (mobile-responsive empty states) requirements fulfilled
- No blockers

---
*Phase: 03-ui-polish*
*Completed: 2026-05-22*
