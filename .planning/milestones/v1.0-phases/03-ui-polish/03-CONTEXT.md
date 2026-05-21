# Phase 3: UI Polish - Context

**Gathered:** 2026-05-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Every interaction on the platform feels complete — no spinners that never resolve, no blank screens, no broken layouts on mobile. Covers loading states for all async operations, user-friendly error messages, empty states that guide next actions, and mobile responsiveness across all platform pages.

</domain>

<decisions>
## Implementation Decisions

### Toast/Notification System
- **D-01:** Hybrid feedback approach — inline messages for form validation errors (field-level), toast notifications for action results (saved, deleted, generation started/failed).
- **D-02:** Toast position: **bottom-right**, stacking upward. Auto-dismiss after 3-4 seconds for success, persist until dismissed for errors.
- **D-03:** Destructive actions (delete) get an **undo window** in the toast — "Ret slettet — Fortryd". Non-destructive actions (save, generate) are confirm-only.
- **D-04:** Create a `useToast()` composable and a `ToastContainer.vue` component mounted in the platform layout. Toast types: success, error, undo.

### Button Loading States
- **D-05:** Pattern: **spinner replaces button text + button disabled** while the async action is in progress. Same small spinner icon across all buttons.
- **D-06:** Apply to all action buttons: save, delete, generate, regenerate, retry, create restaurant, create dish. Any button that triggers an API call.
- **D-07:** Create a reusable `ActionButton.vue` component (or extend existing button patterns) that accepts a `loading` prop to handle the spinner/disable behavior consistently.

### Error Boundary
- **D-08:** Create `error.vue` at app root — **minimal branded page** with PopPlate logo, a Danish error message, and a "Tilbage til forsiden" (back to home) button.
- **D-09:** Single layout for all error codes (404, 500, etc.) — no contextual differentiation. Keep it simple.

### Empty States
- **D-10:** Audit and fill remaining gaps. Known missing: `/platform/r/[slug]/index.vue` and `/platform/r/[slug]/dishes.vue`. Most other pages already have empty states.

### Mobile Navigation
- **D-11:** Already handled — existing floating pill + slide-out drawer with scrim in `Sidebar.vue`. No changes needed.

### Claude's Discretion
- Exact Danish copy for toast messages and error page
- Spinner icon design (inline SVG or component)
- Which pages need loading state improvements vs are already covered
- Whether to extract a shared button component or add loading props to existing button patterns
- Toast animation style (slide-in, fade, etc.)
- Auto-dismiss timing for success toasts (3-4s range)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing UI Patterns
- `app/components/platform/PageSkeleton.vue` — Skeleton loading component with 4 variants (dashboard/list/detail/settings). Reuse for any page-level loading needs.
- `app/components/platform/StatCard.vue` — Stat card with delta/trend props. Already used on dashboard and analytics.
- `app/components/platform/DishTable.vue` — Table with horizontal scroll on mobile and empty state fallback.
- `app/components/platform/Sidebar.vue` — Full mobile nav implementation (floating pill, slide-out drawer, scrim overlay, Escape key handling).

### Layout System
- `app/layouts/platform.vue` — Platform layout with sidebar grid. Responsive at 900px/1100px/720px breakpoints.
- `app/layouts/public.vue` — Public layout with dock navigation.
- `app/app.vue` — NuxtLoadingIndicator configured (brown clay color, 2px).

### Pages Needing Polish
- `app/pages/platform/index.vue` — Dashboard. Has skeleton + empty state. Check button loading on actions.
- `app/pages/platform/restaurants.vue` — Has error card + empty state. Check create/delete button loading.
- `app/pages/platform/dishes/index.vue` — Has skeleton + empty state. Check filter/action loading.
- `app/pages/platform/dishes/[id].vue` — Dish detail. Has skeleton. Save/delete/generate buttons need loading states. Generation polling at 3s interval already exists.
- `app/pages/platform/dishes/new.vue` — Create dish form. Check create button loading.
- `app/pages/platform/analytics.vue` — Has skeleton + empty state + error state. Mostly complete.
- `app/pages/platform/settings.vue` — Uses setTimeout for success auto-hide. Migrate to toast.
- `app/pages/platform/r/[slug]/index.vue` — Restaurant workspace. Check empty state.
- `app/pages/platform/r/[slug]/dishes.vue` — Restaurant dishes. Check empty state.
- `app/pages/r/[slug].vue` — Public menu. Has skeleton + empty state. Check error handling.
- `app/pages/d/[publicDishId].vue` — Public dish detail. Has skeleton + 404 state.

### Error Handling Patterns
- `server/utils/access.ts` — `hasUnlimitedAccess()` and access control patterns.
- Existing error pattern: `createError({ statusCode, message })` on server, `err.data?.message ?? err.message` on client.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `PageSkeleton.vue`: 4 variants covering all platform page types — no new skeleton work needed
- `NuxtLoadingIndicator`: Global nav loading bar already configured in `app.vue`
- `StatCard.vue`: Delta/trend support built in — analytics page already uses it
- Inline error pattern: `errorMessage` ref + try/catch in form handlers — keep for form validation, add toast for action results
- Mobile sidebar: Complete implementation with drawer, scrim, Escape key — no changes needed

### Established Patterns
- Danish language for all user-facing text (consistent with Phases 1-2)
- Responsive breakpoints: `max-[480px]`, `max-[720px]`, `max-[900px]`, `max-[1100px]`
- `clamp()` for fluid typography on public pages
- `useLazyFetch` with `status` computed for loading states
- Error colors: `#8a4838` (error red), `#8b6914` (warning amber) from Phase 1
- Brand color: `#b87a4e` (clay brown) for accents

### Integration Points
- New `useToast()` composable in `app/composables/`
- New `ToastContainer.vue` mounted in `app/layouts/platform.vue` (and optionally `public.vue`)
- New `error.vue` at `app/error.vue`
- New `ActionButton.vue` component (or loading prop pattern) in `app/components/shared/` or `app/components/platform/`
- Existing page files modified to wire up toast calls and button loading states

</code_context>

<specifics>
## Specific Ideas

- Undo on destructive toasts: soft-delete pattern or delay the actual deletion while undo window is open
- Toast should respect the app's design language — warm tones, subtle shadows, rounded corners consistent with existing card style
- Button spinner should be small enough to fit in any button size without layout shift

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-ui-polish*
*Context gathered: 2026-05-21*
