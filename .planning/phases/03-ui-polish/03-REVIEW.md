---
phase: 03-ui-polish
reviewed: 2026-05-22T00:00:00Z
depth: standard
files_reviewed: 11
files_reviewed_list:
  - app/composables/useToast.ts
  - app/components/platform/ToastContainer.vue
  - app/components/shared/ActionButton.vue
  - app/error.vue
  - app/layouts/platform.vue
  - app/pages/platform/dishes/[id].vue
  - app/pages/platform/dishes/new.vue
  - app/pages/platform/restaurants.vue
  - app/pages/platform/settings.vue
  - app/pages/platform/r/[slug]/index.vue
  - app/pages/platform/r/[slug]/dishes.vue
findings:
  critical: 0
  warning: 4
  info: 5
  total: 9
status: issues_found
---

# Phase 03: Code Review Report

**Reviewed:** 2026-05-22
**Depth:** standard
**Files Reviewed:** 11
**Status:** issues_found

## Summary

Phase 03 introduces a useToast composable with auto-dismiss, a ToastContainer, an ActionButton with loading spinner, an error boundary, and updated platform pages. The code is generally well-structured and follows consistent Vue 3 / Nuxt 4 patterns. There are no critical security vulnerabilities.

Four warnings are raised: a setTimeout handle that is not cleaned up on component unmount (potential stale callback against already-GCd state), a non-null assertion on a computed that can be `undefined`, a missing error handler branch in the polling loop, and a `saveProfile` function that resets its loading flag only on the happy path when an exception is thrown. Five informational items cover dead/commented-out code, a mixed-language UI string, an unused `isPolling` variable, duplicate `confirm()` dialog text kept in English, and a minor indentation inconsistency.

---

## Warnings

### WR-01: setTimeout in useToast is never cancelled if the toast is dismissed early

**File:** `app/composables/useToast.ts:22`

**Issue:** When `addToast` is called with `autoDismissMs`, it schedules a `setTimeout` that calls `dismiss(id)`. If the user manually dismisses the toast before the timer fires, the timeout is not cancelled. The `dismiss` call itself is a no-op at that point (the filter just finds nothing), so there is no crash. However, if `toasts` state from `useState` is replaced or the component is unmounted the timer still holds a reference to the `dismiss` closure and fires regardless. On a SSR-enabled global `useState` this is harmless but the un-cancelled handle is a resource leak and will become a real bug if the state is ever scoped per-component.

**Fix:**
```ts
function addToast(toast: Omit<Toast, 'id' | 'createdAt'>, autoDismissMs?: number) {
  const id = Date.now().toString()
  const entry: Toast = { ...toast, id, createdAt: Date.now() }
  toasts.value = [entry, ...toasts.value].slice(0, 3)
  if (autoDismissMs) {
    const timer = setTimeout(() => dismiss(id), autoDismissMs)
    // Store timer so dismiss() can cancel it
    timerMap.set(id, timer)
  }
}

function dismiss(id: string) {
  const timer = timerMap.get(id)
  if (timer !== undefined) {
    clearTimeout(timer)
    timerMap.delete(id)
  }
  toasts.value = toasts.value.filter(t => t.id !== id)
}

// In useToast(), before the return:
const timerMap = new Map<string, ReturnType<typeof setTimeout>>()
```

---

### WR-02: Non-null assertion on a computed that can return `undefined`

**File:** `app/pages/platform/dishes/[id].vue:301`

**Issue:** `modelGlbUrl` is typed `string` (via a trailing `!`) but `resolveModelUrl` returns `string | undefined`. When `dish.value?.previewModelGlbUrl` is `null` the function returns `undefined`, making the non-null assertion a lie. The viewer component will receive `undefined` cast as `string`, which can cause a runtime error inside `ViewerDishViewer` if it does not guard for falsy URL values.

```ts
// line 301 — the trailing ! removes undefined from the type but the value is still undefined at runtime
const modelGlbUrl = computed(() => resolveModelUrl(dish.value?.previewModelGlbUrl ?? null, 'glb')!)
```

The `ViewerDishViewer` is only rendered when `dish.previewModelGlbUrl` is truthy (line 116), so in practice the wrong value is never *sent* to the viewer. But the assertion still produces an incorrect type that could silently break if the conditional guard is ever relaxed.

**Fix:**
```ts
const modelGlbUrl = computed(() => resolveModelUrl(dish.value?.previewModelGlbUrl ?? null, 'glb'))
// type is string | undefined — matches the viewer prop which should accept string | undefined
```

Remove the `!` and update `ViewerDishViewer`'s `:glb-url` prop type to `string | undefined` if it is not already.

---

### WR-03: Error inside the polling interval is silently swallowed

**File:** `app/pages/platform/dishes/[id].vue:368-380`

**Issue:** The `setInterval` callback in `startPolling` calls `$fetch` twice inside `Promise.all`. If either request fails (network error, 401, 500) the unhandled rejection will be swallowed silently because there is no `try/catch` around the `await Promise.all(...)`. The interval continues running and the UI shows no indication that polling failed. In the worst case an expired session causes silent repeated failed requests every 3 seconds until the user navigates away.

```ts
// lines 368-380 — no error handling
pollInterval = setInterval(async () => {
  const [freshDish, freshJobs] = await Promise.all([
    $fetch<DishDetail>(`/api/dishes/${id}`),
    $fetch<GenerationJob[]>(`/api/dishes/${id}/jobs`),
  ])
  // ...
}, 3000)
```

**Fix:**
```ts
pollInterval = setInterval(async () => {
  try {
    const [freshDish, freshJobs] = await Promise.all([
      $fetch<DishDetail>(`/api/dishes/${id}`),
      $fetch<GenerationJob[]>(`/api/dishes/${id}/jobs`),
    ])
    dish.value = freshDish
    jobsData.value = freshJobs
    const status = latestJob.value?.status
    if (status !== 'queued' && status !== 'processing') {
      stopPolling()
    }
  } catch {
    stopPolling()
  }
}, 3000)
```

---

### WR-04: `saveProfile` does not reset loading state on exception

**File:** `app/pages/platform/settings.vue:49-62`

**Issue:** `profileSaving` is set to `true` at the start of `saveProfile` but is only reset to `false` at the very end of the function body — outside a `finally` block. If `$fetch` throws an exception the assignment on line 61 (`profileSaving.value = false`) is never reached. The submit button will remain permanently disabled / in loading state for the rest of the session.

```ts
async function saveProfile() {
  profileSaving.value = true
  try {
    await $fetch('/api/user/profile', { ... })
    toast.success('Profil gemt')
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    toast.error(e?.data?.message ?? 'Kunne ikke gemme profil')
  }
  profileSaving.value = false   // <-- not reached on throw
}
```

**Fix:**
```ts
async function saveProfile() {
  profileSaving.value = true
  try {
    await $fetch('/api/user/profile', {
      method: 'PATCH',
      body: { displayName: profileDisplayName.value },
    })
    toast.success('Profil gemt')
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    toast.error(e?.data?.message ?? 'Kunne ikke gemme profil')
  } finally {
    profileSaving.value = false
  }
}
```

---

## Info

### IN-01: Unused variable `isPolling`

**File:** `app/pages/platform/dishes/[id].vue:364`

**Issue:** `isPolling` is declared as `let isPolling = false` but is never read or written after declaration. It is dead code.

**Fix:** Remove the declaration.

---

### IN-02: Confirm dialog strings are in English on a Danish-language platform

**File:** `app/pages/platform/dishes/[id].vue:486`, `app/pages/platform/dishes/[id].vue:503`

**Issue:** The archive and permanent-delete confirmation strings (`'Archive this dish? ...'` and `'Permanently delete this dish? ...'`) are in English. All other user-facing copy in this file and across the platform is in Danish.

**Fix:** Translate both strings to Danish to match the rest of the UI, for example:
```ts
if (!confirm('Arkiver denne ret? Den vil ikke længere være synlig for gæster.')) return
if (!confirm('Slet retten permanent? Dette fjerner QR-kode, analytics, jobs og kildebilledposter.')) return
```

---

### IN-03: Large block of commented-out production UI code in settings.vue

**File:** `app/pages/platform/settings.vue:120-197`

**Issue:** The `tier` tab contains a substantial commented-out block (~80 lines) including an entire pricing card and invoice history table. Commented-out code adds maintenance noise and can mislead future readers about what is actually active.

**Fix:** If the billing UI is deferred until a later phase, move it to a separate branch or a `<!-- TODO(phase-N): billing card -->` stub comment with a ticket reference. If it is truly abandoned, delete it.

---

### IN-04: ActionButton does not surface slot content to assistive technology when loading

**File:** `app/components/shared/ActionButton.vue:45-58`

**Issue:** When `loading` is `true`, the slot (which contains the button label) is replaced by the spinner SVG and is not rendered at all. Screen readers will announce an empty or unlabelled button because there is no `aria-label` or `aria-busy` attribute. The spinner SVG already has `aria-hidden="true"`, but there is nothing left for the accessible name.

**Fix:**
```html
<button
  :type="type"
  :disabled="loading || disabled"
  :aria-busy="loading || undefined"
  :aria-label="loading ? 'Indlæser…' : undefined"
  ...
>
```
Alternatively, keep the slot text visually hidden when loading using `sr-only`:
```html
<template v-if="loading">
  <svg aria-hidden="true" ...>...</svg>
  <span class="sr-only"><slot /></span>
</template>
<template v-else>
  <slot />
</template>
```

---

### IN-05: `id` parameter cast without route-param validation in dishes/[id].vue

**File:** `app/pages/platform/dishes/[id].vue:238`

**Issue:** `route.params.id` is cast with `as string` without checking whether it is actually a string. In Nuxt 4, dynamic params can technically be `string | string[]`. If the router somehow produces an array (e.g., via direct URL manipulation) all subsequent `$fetch` calls will receive `[object Object]` or a stringified array as the dish ID.

**Fix:**
```ts
const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
```

---

_Reviewed: 2026-05-22_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
