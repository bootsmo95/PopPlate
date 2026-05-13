<template>
  <!-- Loading -->
  <div v-if="pending" class="min-h-screen flex items-center justify-center">
    <div class="flex flex-col items-center gap-3 text-gray-400">
      <svg class="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      <span class="text-sm">Loading…</span>
    </div>
  </div>

  <!-- 404 / error state -->
  <div v-else-if="error || !dish" class="min-h-screen flex items-center justify-center px-6">
    <div class="text-center max-w-sm">
      <div class="text-6xl mb-4">🍽️</div>
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Dish not found</h1>
      <p class="text-gray-500 text-sm">This dish may not be available or the link may be incorrect.</p>
    </div>
  </div>

  <!-- Dish content -->
  <div v-else class="max-w-lg mx-auto pb-12">
    <!-- Hero poster -->
    <div class="relative w-full aspect-square bg-gray-100 overflow-hidden">
      <img
        v-if="dish.hasPoster"
        :src="modelPosterUrl!"
        :alt="dish.name"
        class="w-full h-full object-cover"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center text-gray-300"
      >
        <svg class="w-20 h-20" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 0v18M3 12h18" />
        </svg>
      </div>
    </div>

    <!-- Dish info -->
    <div class="px-5 pt-6 space-y-4">
      <!-- Name + Price -->
      <div class="flex items-start justify-between gap-3">
        <h1 class="text-3xl font-bold text-gray-900 leading-tight">{{ dish.name }}</h1>
        <span
          v-if="dish.priceText"
          class="flex-shrink-0 text-xl font-semibold text-orange-500 mt-1"
        >
          {{ dish.priceText }}
        </span>
      </div>

      <!-- Description -->
      <p v-if="dish.shortDescription" class="text-gray-600 text-base leading-relaxed">
        {{ dish.shortDescription }}
      </p>

      <!-- Allergen pills -->
      <div v-if="allergenList.length > 0" class="flex flex-wrap gap-2">
        <span
          v-for="allergen in allergenList"
          :key="allergen"
          class="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium rounded-full"
        >
          {{ allergen }}
        </span>
      </div>
    </div>

    <!-- AR / 3D Viewer -->
    <div v-if="dish.hasModel" class="px-5 mt-6">
      <div class="space-y-4">
        <!-- AR prompt (mobile, before AR attempted) -->
        <div v-if="showArPrompt" class="rounded-3xl border border-orange-100 bg-orange-50/70 p-4 shadow-sm">
          <div class="flex flex-col items-center gap-4 text-center">
            <button
              class="flex items-center gap-3 px-8 py-4 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-lg rounded-2xl shadow-lg transition-colors disabled:opacity-70 disabled:cursor-wait"
              :disabled="arLaunching"
              @click="launchAr"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
              </svg>
              {{ arLaunching ? 'Opening AR…' : 'View on your table' }}
            </button>
            <p class="text-sm text-gray-500">
              {{ viewerLoaded ? 'AR is ready.' : 'Preparing AR in the background…' }}
            </p>
            <button class="text-sm text-gray-400 underline" @click="skipAr">
              View in 3D instead
            </button>
          </div>
        </div>

        <!-- 3D Viewer fallback -->
        <div>
          <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            View in 3D
          </h2>
          <ViewerDishViewer
            ref="viewerComponent"
            :glb-url="modelGlbUrl"
            :usdz-url="modelUsdzUrl"
            :poster-url="modelPosterUrl"
            :alt="dish.name"
            height="60vh"
            @viewer-loaded="onViewerLoaded"
            @ar-clicked="onArClicked"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { trackPageOpen, trackViewerLoaded, trackArLaunchClicked } from '~/lib/analytics/events'

definePageMeta({ layout: 'public' })

const route = useRoute()
const publicDishId = route.params.publicDishId as string

interface PublicDish {
  publicDishId: string
  name: string
  shortDescription: string | null
  priceText: string | null
  allergens: string | null
  hasModel: boolean
  hasUsdz: boolean
  hasPoster: boolean
  restaurantId: string
}

type ViewerExpose = {
  activateAr: () => Promise<boolean>
  isLoaded: boolean
}

const viewerComponent = ref<ViewerExpose | null>(null)
const isMobile = ref(false)
const arAttempted = ref(false)
const arLaunching = ref(false)
const viewerLoaded = ref(false)
const showArPrompt = computed(() => isMobile.value && !arAttempted.value)

const {
  data: dish,
  pending,
  error,
} = await useFetch<PublicDish>(`/api/public/dishes/${publicDishId}`)

const modelGlbUrl = computed(() => `/m/${publicDishId}.glb`)
const modelUsdzUrl = computed(() => dish.value?.hasUsdz ? `/m/${publicDishId}.usdz` : undefined)
const modelPosterUrl = computed(() => dish.value?.hasPoster ? `/m/${publicDishId}.png` : undefined)

const allergenList = computed<string[]>(() => {
  if (!dish.value?.allergens) return []
  return dish.value.allergens
    .split(',')
    .map((a) => a.trim())
    .filter(Boolean)
})

useHead({
  title: computed(() => dish.value?.name ?? 'Dish'),
  meta: [
    {
      name: 'description',
      content: computed(() => dish.value?.shortDescription ?? ''),
    },
  ],
  link: computed(() => {
    const links: Array<Record<string, string>> = []

    if (dish.value?.hasModel) {
      links.push({ rel: 'preload', href: modelGlbUrl.value, as: 'fetch', crossorigin: 'anonymous' })
    }

    if (dish.value?.hasUsdz && modelUsdzUrl.value) {
      links.push({ rel: 'prefetch', href: modelUsdzUrl.value })
    }

    if (dish.value?.hasPoster && modelPosterUrl.value) {
      links.push({ rel: 'preload', href: modelPosterUrl.value, as: 'image', fetchpriority: 'high' })
    }

    return links
  }),
})

onMounted(() => {
  isMobile.value = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

  if (dish.value) {
    trackPageOpen(publicDishId, dish.value.restaurantId)
  }
})

async function launchAr() {
  if (!dish.value) return

  trackArLaunchClicked(publicDishId, dish.value.restaurantId)
  arLaunching.value = true

  try {
    const activated = await viewerComponent.value?.activateAr?.()

    if (!activated) {
      arAttempted.value = true
    }
  } finally {
    window.setTimeout(() => {
      arLaunching.value = false
    }, 600)
  }
}

function skipAr() {
  arAttempted.value = true
}

function onViewerLoaded() {
  viewerLoaded.value = true

  if (dish.value) {
    trackViewerLoaded(publicDishId, dish.value.restaurantId)
  }
}

function onArClicked() {
  if (dish.value) {
    trackArLaunchClicked(publicDishId, dish.value.restaurantId)
  }
}
</script>
