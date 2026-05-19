<template>
  <div class="min-h-screen bg-[#f8f5ee] text-slate-950">
    <div v-if="pending" class="flex min-h-screen items-center justify-center px-6">
      <div class="flex items-center gap-3 text-sm font-medium text-slate-500">
        <svg class="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        Loading menu...
      </div>
    </div>

    <div v-else-if="error || !menu" class="flex min-h-screen items-center justify-center px-6">
      <div class="max-w-sm text-center">
        <p class="text-sm font-bold uppercase tracking-[0.24em] text-orange-600">PopPlate</p>
        <h1 class="mt-4 text-3xl font-black tracking-tight text-slate-950">Menu not found</h1>
        <p class="mt-3 text-sm leading-6 text-slate-600">This restaurant menu may not be published yet.</p>
      </div>
    </div>

    <main v-else class="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_440px] lg:px-8 lg:py-8 xl:grid-cols-[minmax(0,1fr)_500px]">
      <section class="pb-8 lg:pb-16">
        <header class="border-b border-slate-900/10 pb-6 pt-4">
          <NuxtLink to="/" class="text-sm font-black tracking-tight text-slate-950">
            PopPlate
          </NuxtLink>
          <div class="mt-10 max-w-3xl">
            <p class="text-xs font-bold uppercase tracking-[0.28em] text-orange-700">3D restaurant menu</p>
            <h1 class="mt-4 text-5xl font-black leading-none tracking-tight text-slate-950 sm:text-6xl">
              {{ menu.restaurant.name }}
            </h1>
            <p class="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              Browse the dishes, rotate each plate in 3D, and open the selected dish on your table when your device supports AR.
            </p>
          </div>
        </header>

        <div v-if="menu.dishes.length === 0" class="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center">
          <h2 class="text-xl font-bold text-slate-950">No published dishes yet</h2>
          <p class="mt-2 text-sm text-slate-600">Published dishes will appear here automatically.</p>
        </div>

        <div v-else class="mt-8 space-y-3">
          <button
            v-for="dish in menu.dishes"
            :key="dish.publicDishId"
            type="button"
            class="group grid w-full gap-4 rounded-2xl border p-4 text-left transition sm:grid-cols-[112px_minmax(0,1fr)_auto]"
            :class="dish.publicDishId === selectedPublicDishId ? 'border-slate-950 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.10)]' : 'border-slate-200 bg-white/60 hover:border-slate-400 hover:bg-white'"
            @click="selectDish(dish.publicDishId)"
          >
            <div class="aspect-square overflow-hidden rounded-xl bg-stone-200">
              <img
                v-if="dish.hasPoster"
                :src="posterUrl(dish)"
                :alt="dish.name"
                class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              >
              <div v-else class="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-200 to-orange-100 text-slate-400">
                <svg class="h-9 w-9" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 0v18M3 12h18" />
                </svg>
              </div>
            </div>

            <div class="min-w-0 self-center">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <h2 class="text-xl font-black leading-tight text-slate-950">{{ dish.name }}</h2>
                <span v-if="dish.priceText" class="rounded-full bg-slate-950 px-3 py-1 text-sm font-bold text-white sm:hidden">
                  {{ dish.priceText }}
                </span>
              </div>
              <p v-if="dish.shortDescription" class="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                {{ dish.shortDescription }}
              </p>
              <div v-if="allergenList(dish).length" class="mt-3 flex flex-wrap gap-2">
                <span
                  v-for="allergen in allergenList(dish)"
                  :key="allergen"
                  class="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800"
                >
                  {{ allergen }}
                </span>
              </div>
            </div>

            <div class="hidden self-start text-right sm:block">
              <p v-if="dish.priceText" class="text-lg font-black text-slate-950">{{ dish.priceText }}</p>
              <p class="mt-2 text-xs font-bold uppercase tracking-[0.18em]" :class="dish.hasModel ? 'text-emerald-700' : 'text-slate-400'">
                {{ dish.hasModel ? '3D ready' : 'Info only' }}
              </p>
            </div>
          </button>
        </div>
      </section>

      <aside class="lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)]">
        <div class="flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-900/10 bg-slate-950 text-white shadow-2xl shadow-slate-900/20">
          <div class="border-b border-white/10 p-5">
            <p class="text-xs font-bold uppercase tracking-[0.26em] text-orange-300">Selected dish</p>
            <div v-if="selectedDish" class="mt-3 flex items-start justify-between gap-3">
              <div>
                <h2 class="text-2xl font-black leading-tight">{{ selectedDish.name }}</h2>
                <p v-if="selectedDish.priceText" class="mt-1 text-sm font-bold text-orange-200">{{ selectedDish.priceText }}</p>
              </div>
              <NuxtLink
                :to="`/d/${selectedDish.publicDishId}`"
                class="inline-flex shrink-0 items-center rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-950 transition hover:bg-orange-100"
                @click="trackMenuArClick(selectedDish)"
              >
                AR view
              </NuxtLink>
            </div>
          </div>

          <div class="min-h-[360px] flex-1 bg-[radial-gradient(circle_at_50%_20%,rgba(251,146,60,0.18),transparent_34%),linear-gradient(180deg,#1f2937_0%,#020617_100%)] p-4">
            <ViewerDishViewer
              v-if="selectedDish?.hasModel"
              :key="selectedDish.publicDishId"
              :glb-url="modelGlbUrl(selectedDish)"
              :usdz-url="modelUsdzUrl(selectedDish)"
              :poster-url="posterUrl(selectedDish)"
              :alt="selectedDish.name"
              :scale="viewerScale(selectedDish)"
              height="100%"
              rotation-per-second="14deg"
              @viewer-loaded="trackSelectedViewerLoaded"
              @ar-clicked="trackSelectedArClicked"
            />
            <div v-else class="flex h-full min-h-[360px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
              <svg class="h-14 w-14 text-white/40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
              </svg>
              <h3 class="mt-4 text-xl font-black">3D model coming soon</h3>
              <p class="mt-2 text-sm leading-6 text-white/60">This dish can still be listed while the model is being prepared.</p>
            </div>
          </div>

          <div v-if="selectedDish" class="space-y-4 border-t border-white/10 p-5">
            <p v-if="selectedDish.shortDescription" class="text-sm leading-6 text-white/72">
              {{ selectedDish.shortDescription }}
            </p>
            <NuxtLink
              :to="`/d/${selectedDish.publicDishId}`"
              class="flex w-full items-center justify-center rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-600"
              @click="trackMenuArClick(selectedDish)"
            >
              View on your table
            </NuxtLink>
          </div>
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup lang="ts">
import { trackArLaunchClicked, trackEvent, trackViewerLoaded } from '~/lib/analytics/events'

definePageMeta({ layout: 'public' })

const route = useRoute()
const slug = route.params.slug as string

interface MenuDish {
  id: string
  publicDishId: string
  name: string
  shortDescription: string | null
  priceText: string | null
  allergens: string | null
  ingredients: string | null
  hasModel: boolean
  hasUsdz: boolean
  hasPoster: boolean
  scaleCm: number | null
  publishedAt: string | null
  createdAt: string
}

interface RestaurantMenu {
  restaurant: {
    id: string
    name: string
    slug: string
    status: string
  }
  dishes: MenuDish[]
}

const { data: menu, pending, error } = await useFetch<RestaurantMenu>(`/api/public/restaurants/${slug}/menu`)
const selectedPublicDishId = ref<string | null>(null)
const trackedViewerLoads = new Set<string>()

const selectedDish = computed(() => {
  if (!menu.value?.dishes.length) return null
  return menu.value.dishes.find((dish) => dish.publicDishId === selectedPublicDishId.value) ?? menu.value.dishes[0]!
})

watch(
  () => menu.value?.dishes,
  (dishes) => {
    if (!selectedPublicDishId.value && dishes?.length) {
      selectedPublicDishId.value = dishes[0]!.publicDishId
    }
  },
  { immediate: true },
)

useHead({
  title: computed(() => menu.value ? `${menu.value.restaurant.name} menu - PopPlate` : 'Restaurant menu - PopPlate'),
  meta: [
    {
      name: 'description',
      content: computed(() => menu.value ? `Browse ${menu.value.restaurant.name}'s 3D menu in PopPlate.` : 'Browse a 3D restaurant menu in PopPlate.'),
    },
  ],
})

onMounted(() => {
  if (selectedDish.value && menu.value) {
    trackEvent('menu_open', selectedDish.value.publicDishId, menu.value.restaurant.id)
  }
})

function selectDish(publicDishId: string) {
  selectedPublicDishId.value = publicDishId
  const dish = menu.value?.dishes.find((item) => item.publicDishId === publicDishId)
  if (dish && menu.value) {
    trackEvent('menu_dish_selected', dish.publicDishId, menu.value.restaurant.id)
  }
}

function modelGlbUrl(dish: MenuDish) {
  return `/m/${dish.publicDishId}.glb`
}

function modelUsdzUrl(dish: MenuDish) {
  return dish.hasUsdz ? `/m/${dish.publicDishId}.usdz` : undefined
}

function posterUrl(dish: MenuDish) {
  return dish.hasPoster ? `/m/${dish.publicDishId}.png` : undefined
}

function viewerScale(dish: MenuDish) {
  return dish.scaleCm && dish.scaleCm > 0 ? dish.scaleCm / 100 : 0.05
}

function allergenList(dish: MenuDish) {
  if (!dish.allergens) return []
  return dish.allergens
    .split(',')
    .map((allergen) => allergen.trim())
    .filter(Boolean)
}

function trackSelectedViewerLoaded() {
  if (!selectedDish.value || !menu.value) return
  if (trackedViewerLoads.has(selectedDish.value.publicDishId)) return

  trackedViewerLoads.add(selectedDish.value.publicDishId)
  trackViewerLoaded(selectedDish.value.publicDishId, menu.value.restaurant.id)
}

function trackSelectedArClicked() {
  if (!selectedDish.value || !menu.value) return
  trackArLaunchClicked(selectedDish.value.publicDishId, menu.value.restaurant.id)
}

function trackMenuArClick(dish: MenuDish) {
  if (!menu.value) return
  trackEvent('menu_ar_launch_clicked', dish.publicDishId, menu.value.restaurant.id)
}
</script>
