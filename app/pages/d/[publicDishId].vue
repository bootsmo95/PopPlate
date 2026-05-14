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

  <!-- QR landing: AR-first only -->
  <div v-else-if="showQrArLoader" class="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center px-6">
    <div class="flex max-w-sm flex-col items-center gap-4 text-center">
      <div class="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5">
        <svg class="h-10 w-10 animate-spin text-orange-300" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
      <div class="space-y-2">
        <p class="text-xs font-semibold uppercase tracking-[0.35em] text-orange-300/80">PopPlate AR</p>
        <h1 class="text-2xl font-semibold">{{ dish.name }}</h1>
        <p class="text-sm text-stone-300">{{ arLoaderText }}</p>
      </div>
    </div>

    <div class="pointer-events-none absolute inset-0 opacity-0">
      <ViewerDishViewer
        ref="viewerComponent"
        :glb-url="modelGlbUrl"
        :usdz-url="modelUsdzUrl"
        :poster-url="modelPosterUrl"
        :alt="dish.name"
        :scale="viewerScale"
        height="1px"
        @viewer-loaded="onViewerLoaded"
        @ar-clicked="onArClicked"
      />
    </div>
  </div>

  <!-- Dish content / fallback -->
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
      <div class="flex items-start justify-between gap-3">
        <h1 class="text-3xl font-bold text-gray-900 leading-tight">{{ dish.name }}</h1>
        <span
          v-if="dish.priceText"
          class="flex-shrink-0 text-xl font-semibold text-orange-500 mt-1"
        >
          {{ dish.priceText }}
        </span>
      </div>

      <p v-if="dish.shortDescription" class="text-gray-600 text-base leading-relaxed">
        {{ dish.shortDescription }}
      </p>

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

    <div v-if="dish.hasModel" class="px-5 mt-6">
      <div class="space-y-4">
        <div v-if="showFallbackNotice" class="rounded-3xl border border-orange-100 bg-orange-50/70 p-4 text-center shadow-sm">
          <p class="text-sm font-medium text-gray-700">AR kunne ikke åbnes på den her enhed.</p>
          <p class="mt-1 text-sm text-gray-500">Du får 3D-visningen i stedet.</p>
        </div>

        <div>
          <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            View in 3D
          </h2>
          <ViewerDishViewer
            v-if="!showQrArLoader"
            ref="viewerComponent"
            :glb-url="modelGlbUrl"
            :usdz-url="modelUsdzUrl"
            :poster-url="modelPosterUrl"
            :alt="dish.name"
            :scale="viewerScale"
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
  scaleCm: number | null
}

type ViewerExpose = {
  activateAr: () => Promise<boolean>
  isLoaded: boolean
}

const viewerComponent = ref<ViewerExpose | null>(null)
const isMobile = ref(false)
const arLaunching = ref(false)
const viewerLoaded = ref(false)
const arLandingActive = ref(false)
const arFallbackVisible = ref(false)
const arActivated = ref(false)
const arLaunchStarted = ref(false)
const showQrArLoader = computed(() => arLandingActive.value && !arFallbackVisible.value)
const showFallbackNotice = computed(() => isMobile.value && arLandingActive.value && arFallbackVisible.value)
const arLoaderText = computed(() => {
  if (!viewerLoaded.value) return 'Vi klargør AR-oplevelsen…'
  if (arLaunching.value) return 'Åbner kamera og placering på bordet…'
  return 'Næsten klar…'
})

const {
  data: dish,
  pending,
  error,
} = await useFetch<PublicDish>(`/api/public/dishes/${publicDishId}`)

const modelGlbUrl = computed(() => `/m/${publicDishId}.glb`)
const modelUsdzUrl = computed(() => dish.value?.hasUsdz ? `/m/${publicDishId}.usdz` : undefined)
const modelPosterUrl = computed(() => dish.value?.hasPoster ? `/m/${publicDishId}.png` : undefined)
const viewerScale = computed(() => {
  const scaleCm = dish.value?.scaleCm
  return scaleCm && scaleCm > 0 ? scaleCm / 100 : 0.05
})

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
  arLandingActive.value = isMobile.value && !!dish.value?.hasModel

  if (dish.value) {
    trackPageOpen(publicDishId, dish.value.restaurantId)
  }
})

async function launchAr() {
  if (!dish.value || arLaunchStarted.value) return

  arLaunchStarted.value = true
  trackArLaunchClicked(publicDishId, dish.value.restaurantId)
  arLaunching.value = true

  try {
    const activated = await viewerComponent.value?.activateAr?.()

    if (!activated) {
      arFallbackVisible.value = true
      return
    }

    arActivated.value = true
  } finally {
    window.setTimeout(() => {
      arLaunching.value = false
    }, 600)
  }
}

function onViewerLoaded() {
  if (!viewerLoaded.value && dish.value) {
    trackViewerLoaded(publicDishId, dish.value.restaurantId)
  }

  viewerLoaded.value = true

  if (arLandingActive.value && !arFallbackVisible.value) {
    void launchAr()
  }
}

function onArClicked() {
  if (dish.value) {
    trackArLaunchClicked(publicDishId, dish.value.restaurantId)
  }
}
</script>
