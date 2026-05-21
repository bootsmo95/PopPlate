# Phase 3: UI Polish - Pattern Map

**Mapped:** 2026-05-21
**Files analyzed:** 11 (4 new, 7 modified)
**Analogs found:** 11 / 11

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `app/composables/useToast.ts` | composable | event-driven | `app/composables/useAuth.ts` | role-match |
| `app/components/platform/ToastContainer.vue` | component | event-driven | `app/components/platform/PageSkeleton.vue` | role-match |
| `app/components/shared/ActionButton.vue` | component | request-response | `app/components/shared/Icon.vue` | role-match |
| `app/error.vue` | page | request-response | `app/pages/platform/r/[slug]/index.vue` (error branch) | partial |
| `app/layouts/platform.vue` | layout | request-response | self | exact |
| `app/pages/platform/dishes/[id].vue` | page | CRUD | self | exact |
| `app/pages/platform/dishes/new.vue` | page | CRUD | self | exact |
| `app/pages/platform/restaurants.vue` | page | CRUD | self | exact |
| `app/pages/platform/settings.vue` | page | CRUD | self | exact |
| `app/pages/platform/r/[slug]/index.vue` | page | CRUD | `app/pages/platform/restaurants.vue` (empty state) | role-match |
| `app/pages/platform/r/[slug]/dishes.vue` | page | CRUD | `app/pages/platform/restaurants.vue` (empty state) | role-match |

---

## Pattern Assignments

### `app/composables/useToast.ts` (composable, event-driven)

**Analog:** `app/composables/useAuth.ts`

**Composable structure pattern** (`app/composables/useAuth.ts`, lines 9-46):
```typescript
// Named export function, NOT default export
export function useAuth() {
  // shared reactive state defined once at module scope (or via useState for SSR safety)
  const isAuthenticated = computed(() => loggedIn.value)

  // action functions scoped inside
  async function login(next = '/platform/dishes'): Promise<void> { ... }

  // single return object with all public API
  return {
    user: authUser,
    isAuthenticated,
    login,
    logout,
  }
}
```

**New composable target shape** (based on UI-SPEC API contract):
```typescript
// app/composables/useToast.ts
// Use useState for SSR-safe shared reactive state across layout + pages
const toasts = useState<Toast[]>('toasts', () => [])

export function useToast() {
  function success(message: string) { ... }
  function error(message: string) { ... }
  function undo(message: string, options: { onUndo: () => void }) { ... }
  function dismiss(id: string) { ... }

  return { toasts, toast: { success, error, undo }, dismiss }
}
```

**Toast shape** (from UI-SPEC, lines 135):
```typescript
interface Toast {
  id: string          // crypto.randomUUID() or Date.now().toString()
  type: 'success' | 'error' | 'undo'
  message: string
  undoLabel?: string  // 'Fortryd' for undo type
  onUndo?: () => void
  createdAt: number   // Date.now() for auto-dismiss calculation
}
```

**Auto-dismiss pattern** — use `setTimeout` inside each `toast.success` / `toast.undo` call, matching the existing `setTimeout` pattern already used in `app/pages/platform/settings.vue` line 58:
```typescript
// Existing pattern in settings.vue lines 58 — migrate this out to toast composable
setTimeout(() => (profileSaved.value = false), 3000)

// New pattern: encapsulated in composable
function success(message: string) {
  const id = Date.now().toString()
  toasts.value = [{ id, type: 'success', message, createdAt: Date.now() }, ...toasts.value].slice(0, 3)
  setTimeout(() => dismiss(id), 3500)
}
```

---

### `app/components/platform/ToastContainer.vue` (component, event-driven)

**Analog:** `app/components/platform/PageSkeleton.vue` (SFC structure, scoped styles, no props beyond internal computed)

**SFC structure pattern** (`app/components/platform/PageSkeleton.vue`, lines 63-83):
```vue
<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'dashboard' | 'list' | 'detail' | 'settings'
  rows?: number
}>(), {
  variant: 'list',
  rows: 5,
})
</script>

<template>
  <div class="animate-pulse space-y-6 py-6">
    ...
  </div>
</template>

<style scoped>
.skel { background: rgba(26, 20, 16, 0.08); }
</style>
```

**Transition/animation analog** — `app/pages/platform/restaurants.vue`, scoped styles (lines 234-248):
```vue
<style scoped>
.slide-enter-active { transition: all 200ms ease-out; }
.slide-leave-active { transition: all 150ms ease-in; }
.slide-enter-from, .slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
```
Copy this pattern for toast enter/exit — change `translateY(-8px)` to `translateY(8px)` (slides up from bottom) and use `<TransitionGroup>` instead of `<Transition>`.

**Toast visual tokens** (from `tailwind.config.ts` and `main.css`):
- Background: `bg-paper` (#f8f3e9)
- Border: `border border-line rounded-md` — defined in `main.css` line 66: `.p-card { @apply bg-paper border border-line rounded-md p-6; }`
- Shadow: use `shadow-[0_14px_30px_rgba(26,20,16,0.10)]` (matches `shadow-card` convention from UI-SPEC)
- Success left stripe: `border-l-[3px] border-l-clay` (#b87a4e)
- Error/undo left stripe: `border-l-[3px] border-l-[#a85a48]` (status.failed)
- Message text: `text-[14px] text-ink` — ink = #1a1410

**Dismiss button pattern** — copies `Icon name="close"` usage from `app/pages/platform/dishes/[id].vue` inline usage. Pass `size={14}` and `aria-label="Luk besked"`.

**Fixed positioning:**
```html
<!-- ToastContainer placement -->
<div class="fixed bottom-8 right-8 z-50 flex flex-col-reverse gap-6 max-[480px]:bottom-6 max-[480px]:right-6">
  <!-- w-[320px] max-w-[calc(100vw-48px)] on each toast item -->
</div>
```

---

### `app/components/shared/ActionButton.vue` (component, request-response)

**Analog:** `app/components/shared/Icon.vue` (defineProps with defaults, inline SVG, single-purpose shared component)

**Props definition pattern** (`app/components/shared/Icon.vue`, lines 2-14):
```typescript
const props = withDefaults(
  defineProps<{
    name: 'home' | 'dish' | ...
    size?: number | string
    stroke?: number | string
  }>(),
  { size: 16, stroke: 1.4 },
)
```

**ActionButton props** (from UI-SPEC, lines 147-154):
```typescript
interface ActionButtonProps {
  loading?: boolean
  disabled?: boolean
  variant?: 'primary' | 'ghost' | 'danger'
  type?: 'button' | 'submit'
  size?: 'md' | 'sm'
}
```

**Variant-to-CSS mapping** (from UI-SPEC + `main.css` lines 74-83):
```
primary → class="top-btn top-btn--primary"
ghost   → class="top-btn"
danger  → class="top-btn" + inline style for text-[#a85a48] border
```

`top-btn` definition in `main.css` lines 74-79:
```css
.top-btn {
  @apply inline-flex items-center gap-2 h-9 px-4 rounded-full
         border border-line-strong text-[13px] font-medium text-ink ...;
}
.top-btn--primary { @apply bg-ink text-ink-inv border-ink; }
.top-btn--primary:hover { @apply bg-clay-deep border-clay-deep; }
```

**Spinner SVG** — inline arc circle, 14×14, `animate-[spin_0.7s_linear_infinite]` (standard Tailwind). Stroke `currentColor`, stroke-width 1.6:
```html
<svg width="14" height="14" viewBox="0 0 14 14" fill="none"
     class="animate-[spin_0.7s_linear_infinite] shrink-0"
     aria-hidden="true">
  <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.6"
          stroke-dasharray="22" stroke-dashoffset="8" stroke-linecap="round"
          opacity="0.4" />
  <path d="M7 2a5 5 0 0 1 5 5" stroke="currentColor" stroke-width="1.6"
        stroke-linecap="round" />
</svg>
```

**Loading state** (`app/pages/platform/dishes/[id].vue` lines 74-81 as current pattern to replace):
```html
<!-- CURRENT pattern across pages — ActionButton replaces this entirely -->
<button
  type="submit"
  :disabled="saving"
  class="top-btn top-btn--primary !py-3.5 !px-6 !text-sm"
>
  {{ saving ? 'Saving...' : 'Gem ændringer' }}
</button>
```

**Template target:**
```html
<!-- ActionButton replaces all of the above -->
<ActionButton variant="primary" type="submit" :loading="saving">
  Gem ændringer
</ActionButton>
```

**Button disabled + opacity state** — copy pattern from `app/pages/platform/restaurants.vue` line 150:
```html
<button type="submit" :disabled="submitting" class="top-btn top-btn--primary">
```
Add `:class="{ 'opacity-70 cursor-not-allowed': loading, 'opacity-50 cursor-not-allowed': disabled && !loading }"` on top.

---

### `app/error.vue` (page, request-response)

**Analog:** No direct existing error page. Closest structural analog is the centered empty-state pattern in `app/pages/platform/restaurants.vue` lines 174-180:
```html
<div v-if="!restaurants?.length" class="p-card py-16 text-center">
  <h3 class="font-display font-normal text-[22px] tracking-[-0.015em] mb-2">Ingen restauranter endnu</h3>
  <p class="text-ink-mute text-[15px] mb-6">Opret din første restaurant for at komme i gang.</p>
  <button type="button" class="top-btn top-btn--primary" @click="showCreate = true">
    <Icon name="plus" :size="14" /><span>Ny restaurant</span>
  </button>
</div>
```

**Nuxt error page API** — `app/error.vue` receives the `error` prop automatically:
```typescript
const props = defineProps<{
  error: { statusCode: number; statusMessage: string; message: string }
}>()
// Clear error and navigate: useError().value = null + navigateTo('/')
const handleBack = () => clearError({ redirect: '/' })
```

**Logo component:** `app/components/shared/LogoMark.vue` — `<LogoMark :size="32" />` (lines 1-16).

**Typography classes** (from `main.css` + tailwind.config.ts):
- Error code eyebrow: `font-mono text-[11px] uppercase font-medium text-ink-faint tracking-[0.22em]`
- Heading: `font-display font-normal text-[32px] tracking-[-0.025em] text-ink`
- Body: `text-[15px] text-ink-mute leading-[1.5]`

**CTA button** uses `top-btn top-btn--primary` (same as everywhere else).

**Page structure** (no layout — `definePageMeta({ layout: false })` implied by Nuxt error.vue convention):
```html
<div class="min-h-screen flex items-center justify-center bg-bg">
  <div class="text-center max-w-[480px] px-6">
    <LogoMark :size="32" class="mx-auto mb-12" />
    <div v-if="error?.statusCode" class="mono-label mb-4">{{ error.statusCode }}</div>
    <h1 class="font-display font-normal text-[32px] tracking-[-0.025em] mb-3">Noget gik galt</h1>
    <p class="text-[15px] text-ink-mute mb-8">Siden kunne ikke indlæses...</p>
    <button class="top-btn top-btn--primary" @click="handleBack">Tilbage til forsiden</button>
  </div>
</div>
```

---

### `app/layouts/platform.vue` (layout, request-response)

**Analog:** Self (lines 48-66 — the template to extend).

**Current template** (`app/layouts/platform.vue`, lines 48-66):
```html
<template>
  <div class="platform-shell grid min-h-screen" style="grid-template-columns: 260px 1fr;">
    <Sidebar ... />
    <main class="platform-main p-9 px-12 pb-20 ...">
      <slot />
    </main>
  </div>
</template>
```

**Modification:** Mount `<ToastContainer />` as a sibling outside the grid — append before closing `</div>` at line 65 so it escapes the grid flow and is truly fixed-positioned. Import pattern mirrors `Sidebar` import on line 2:
```typescript
import ToastContainer from '~/components/platform/ToastContainer.vue'
```

---

### `app/pages/platform/dishes/[id].vue` (page, CRUD)

**Analog:** Self. Patterns to migrate:

**Existing loading ref pattern** (lines 455-457):
```typescript
const saving = ref(false)
const saveError = ref('')
const saveSuccess = ref(false)  // ← remove: replaced by toast
```

**Existing save handler** (lines 459-494) — keep `saving` ref, remove `saveSuccess` ref and its template `<p>` (line 72-73). Replace with:
```typescript
const { toast } = useToast()

// After successful $fetch:
toast.success('Ændringer gemt')

// In catch block (line 488-490):
const e = err as { data?: { message?: string }; message?: string }
toast.error(e?.data?.message ?? 'Noget gik galt — prøv igen')
```

**Error extraction pattern** (consistent across all pages — lines 489-490 in `[id].vue`, lines 69-70 in `restaurants.vue`):
```typescript
const e = err as { data?: { message?: string }; message?: string }
// Use: e?.data?.message ?? e?.message ?? 'Fallback message'
```

**Delete/archive buttons** (lines 206-225) — replace text interpolation `{{ archiving ? 'Archiving...' : 'Arkiver ret' }}` with `<ActionButton variant="ghost" :loading="archiving">Arkiver ret</ActionButton>`. Same for delete button.

---

### `app/pages/platform/dishes/new.vue` (page, CRUD)

**Analog:** Self. Current loading button (lines 113-120):
```html
<button
  type="submit"
  :disabled="loading"
  class="top-btn top-btn--primary flex-1 !justify-center !py-4 !text-[15px]"
>
  <span>{{ loading ? 'Opretter...' : 'Opret ret' }}</span>
  <Icon name="arrow" :size="13" />
</button>
```

Replace with `<ActionButton>`. Note: `new.vue` navigates away on success (`navigateTo`, line 218) so no toast is needed on this page — the next page can confirm. Error case (`catch`, lines 219-222) should call `toast.error(...)`.

---

### `app/pages/platform/restaurants.vue` (page, CRUD)

**Analog:** Self. Existing create button (lines 149-155):
```html
<button type="submit" :disabled="submitting" class="top-btn top-btn--primary">
  <span>{{ submitting ? 'Opretter...' : 'Opret restaurant' }}</span>
  <Icon name="arrow" :size="13" />
</button>
```

Replace with `<ActionButton variant="primary" type="submit" :loading="submitting">Opret restaurant</ActionButton>`.

**Delete button** (lines 216-225) — currently an `icon-btn`. Since delete is destructive, swap to `<ActionButton variant="danger" :loading="deletingSlug === r.slug">` or keep icon-btn with manual spinner (smaller surface).

**Toast wiring after `handleCreate` success** (line 67): `toast.success('Restaurant oprettet')`.
**Toast wiring after `handleDelete` success** (line 85): `toast.undo('Restaurant slettet', { onUndo: () => restoreRestaurant(restaurant) })`.

---

### `app/pages/platform/settings.vue` (page, CRUD)

**Analog:** Self. The `setTimeout` pattern to remove (lines 57-58):
```typescript
profileSaved.value = true
setTimeout(() => (profileSaved.value = false), 3000)
```

Remove `profileSaved` ref entirely. Remove template span on line 288:
```html
<span v-if="profileSaved" class="text-sm text-[#4a6240] font-medium">Gemt!</span>
```

Replace with:
```typescript
const { toast } = useToast()
// After successful PATCH (line 56):
toast.success('Profil gemt')
```

Save button (lines 284-288) — replace with `<ActionButton variant="primary" type="submit" :loading="profileSaving">Gem ændringer</ActionButton>`.

---

### `app/pages/platform/r/[slug]/index.vue` (page, CRUD) — empty state gap-fill

**Analog:** `app/pages/platform/restaurants.vue` empty state (lines 174-180).

**Existing minimal empty state in this file** (lines 169-171) — a plain inline div with no structured empty state:
```html
<div v-if="!dishes.length" class="py-12 text-center text-ink-faint">
  Ingen retter endnu. Opret den foerste for at komme i gang.
</div>
```

**Target pattern** — upgrade to full `p-card` empty state matching the restaurants.vue pattern:
```html
<div v-if="!dishes.length" class="p-card py-16 text-center">
  <Icon name="dish" :size="32" class="text-ink-faint mx-auto mb-3" />
  <h3 class="font-display font-normal text-[18px] tracking-[-0.015em] mb-2">Ingen retter endnu</h3>
  <p class="text-ink-mute text-[13px] mb-5">Tilføj din første ret for at komme i gang.</p>
  <NuxtLink to="/platform/dishes/new" class="top-btn top-btn--primary !inline-flex">
    <Icon name="plus" :size="14" /><span>Tilføj ret</span>
  </NuxtLink>
</div>
```

Note: This replaces the existing `v-if="!dishes.length"` block at line 169 only. The `v-else-if="filteredDishes.length"` / search-no-match branch at line 190 stays unchanged.

---

### `app/pages/platform/r/[slug]/dishes.vue` (page, CRUD) — empty state gap-fill

**Analog:** `app/pages/platform/restaurants.vue` empty state (lines 174-180).

**Existing minimal empty state** (`r/[slug]/dishes.vue`, lines 113-115):
```html
<div v-if="!dishes.length" class="p-card py-16 text-center text-ink-faint">
  <div class="font-display italic text-2xl text-ink mb-2">Ingen retter endnu</div>
  <p>Opret en ret fra denne restaurant for at tilknytte den korrekt.</p>
</div>
```

**Target pattern** (upgrade to full anatomy with CTA):
```html
<div v-if="!dishes.length" class="p-card py-16 text-center">
  <Icon name="dish" :size="32" class="text-ink-faint mx-auto mb-3" />
  <h3 class="font-display font-normal text-[18px] tracking-[-0.015em] mb-2">Ingen retter på denne menu</h3>
  <p class="text-ink-mute text-[13px] mb-5">Retter vises her, når du tilknytter dem til restauranten.</p>
  <NuxtLink to="/platform/dishes" class="top-btn !inline-flex">
    <span>Se alle retter</span>
  </NuxtLink>
</div>
```

---

## Shared Patterns

### Error Extraction
**Source:** `app/pages/platform/restaurants.vue` lines 68-70, `app/pages/platform/dishes/[id].vue` lines 488-490
**Apply to:** All CRUD handlers in all modified pages
```typescript
const e = err as { data?: { message?: string }; message?: string }
const message = e?.data?.message ?? e?.message ?? 'Noget gik galt — prøv igen'
```

### Button Loading State (current — to replace)
**Source:** `app/pages/platform/dishes/[id].vue` lines 74-81 and `app/pages/platform/restaurants.vue` lines 149-155
**Pattern being replaced everywhere:**
```html
<button type="submit" :disabled="saving" class="top-btn top-btn--primary">
  {{ saving ? 'Saving...' : 'Gem ændringer' }}
</button>
```
**Replacement:** `<ActionButton variant="primary" type="submit" :loading="saving">Gem ændringer</ActionButton>`

### CSS Button Classes
**Source:** `app/assets/css/main.css` lines 74-83
**Apply to:** ActionButton.vue variant mapping
```css
.top-btn { @apply inline-flex items-center gap-2 h-9 px-4 rounded-full
           border border-line-strong text-[13px] font-medium text-ink ...; }
.top-btn--primary { @apply bg-ink text-ink-inv border-ink; }
.top-btn--primary:hover { @apply bg-clay-deep border-clay-deep; }
```

### Reduced Motion
**Source:** `app/assets/css/main.css` lines 33-39
**Apply to:** ToastContainer.vue animation, ActionButton spinner
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
```
This is global — no per-component handling needed. Spinner and toast transitions will automatically be suppressed.

### `p-card` + Empty State Structure
**Source:** `app/pages/platform/restaurants.vue` lines 174-180
**Apply to:** `r/[slug]/index.vue` and `r/[slug]/dishes.vue` new empty states
```html
<div class="p-card py-16 text-center">
  <!-- Icon 32px, ink-faint -->
  <!-- Heading: font-display text-[18px] tracking-[-0.015em] mb-2 -->
  <!-- Body: text-ink-mute text-[13px] mb-5 -->
  <!-- CTA: top-btn (ghost) or top-btn--primary with !inline-flex -->
</div>
```

### useLazyFetch + SSR Headers
**Source:** `app/pages/platform/dishes/[id].vue` lines 296-301
**Apply to:** Any new data fetching (no new fetches in this phase, but composables should follow this)
```typescript
const ssrHeaders = useAuthHeaders()
const { data, pending, error, refresh } = useLazyFetch<T>('/api/...', { headers: ssrHeaders })
```

### Danish Copy Convention
**Source:** All platform pages (consistent throughout codebase)
**Apply to:** All user-facing strings in new components
- Toast messages: see UI-SPEC Copywriting Contract
- Button labels: "Gem ændringer", "Opret restaurant", "Tilbage til forsiden"
- No English strings in user-facing output

---

## No Analog Found

All files have sufficient analogs. No gaps requiring RESEARCH.md fallback.

---

## Metadata

**Analog search scope:** `app/composables/`, `app/components/shared/`, `app/components/platform/`, `app/layouts/`, `app/pages/platform/`, `app/assets/css/main.css`, `tailwind.config.ts`
**Files scanned:** 13
**Pattern extraction date:** 2026-05-21
