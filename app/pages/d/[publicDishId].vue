<template>
  <!-- Loading skeleton -->
  <div v-if="pending" class="min-h-screen animate-pulse">
    <!-- Top bar skeleton -->
    <div
      class="flex justify-between items-center sticky top-0 z-50 border-b border-line px-10 py-7 max-[720px]:px-4.5 max-[720px]:py-4"
      style="background: rgba(243, 237, 226, 0.92);"
    >
      <div class="h-4 w-20 rounded" style="background: rgba(26, 20, 16, 0.08);" />
      <div class="h-3 w-32 rounded hidden md:block" style="background: rgba(26, 20, 16, 0.06);" />
      <div class="h-10 w-10 rounded-full border border-line" />
    </div>

    <!-- Split layout skeleton -->
    <div class="d-main grid min-h-[calc(100vh-90px)]" style="grid-template-columns: 1.4fr 1fr;">
      <!-- 3D viewer area -->
      <div class="relative overflow-hidden grid place-items-center min-h-[70vh] max-[980px]:min-h-[50vh]" style="background: linear-gradient(180deg, #1a1410 0%, #2b1f15 50%, #1a1410 100%);">
        <div class="absolute inset-0 z-[1]" style="background: radial-gradient(circle at 50% 55%, rgba(184, 122, 78, 0.25), transparent 55%);" />
        <div class="relative z-[2] w-[55%] aspect-square rounded-full" style="background: rgba(184, 122, 78, 0.08); box-shadow: 0 30px 50px rgba(0,0,0,0.3);" />
      </div>

      <!-- Info panel skeleton -->
      <div class="p-15 px-14 max-[980px]:px-8 max-[980px]:py-12">
        <div class="h-14 w-[80%] rounded mb-8" style="background: rgba(26, 20, 16, 0.07);" />
        <div class="flex justify-between items-baseline py-5 border-t border-b border-line mb-8">
          <div class="h-2.5 w-10 rounded" style="background: rgba(26, 20, 16, 0.08);" />
          <div class="h-8 w-20 rounded" style="background: rgba(26, 20, 16, 0.06);" />
        </div>
        <div class="space-y-3 mb-10">
          <div class="h-4 w-full rounded" style="background: rgba(26, 20, 16, 0.05);" />
          <div class="h-4 w-5/6 rounded" style="background: rgba(26, 20, 16, 0.05);" />
          <div class="h-4 w-2/3 rounded" style="background: rgba(26, 20, 16, 0.05);" />
        </div>
        <div class="mb-7">
          <div class="h-2.5 w-24 rounded mb-3" style="background: rgba(26, 20, 16, 0.08);" />
          <div class="flex flex-wrap gap-2">
            <div v-for="i in 5" :key="i" class="h-8 rounded-full" :style="{ width: [72,56,80,64,48][i-1]+'px', background: 'rgba(26, 20, 16, 0.05)' }" />
          </div>
        </div>
        <div class="mb-7">
          <div class="h-2.5 w-20 rounded mb-3" style="background: rgba(26, 20, 16, 0.08);" />
          <div class="flex flex-wrap gap-2">
            <div v-for="i in 3" :key="'a'+i" class="h-8 rounded-full" :style="{ width: [60,72,52][i-1]+'px', background: 'rgba(26, 20, 16, 0.05)' }" />
          </div>
        </div>
        <div class="mt-10 p-8 rounded" style="background: #2b1f15;">
          <div class="h-7 w-[60%] rounded mb-3" style="background: rgba(255, 255, 255, 0.08);" />
          <div class="h-3.5 w-[80%] rounded mb-6" style="background: rgba(255, 255, 255, 0.05);" />
          <div class="h-14 w-36 rounded-full" style="background: rgba(212, 168, 128, 0.15);" />
        </div>
      </div>
    </div>
  </div>

  <!-- 404 / error state -->
  <div v-else-if="error || !dish" class="min-h-screen flex items-center justify-center px-6">
    <div class="text-center max-w-sm">
      <p class="text-sm font-bold uppercase tracking-[0.24em] text-orange-600">PopPlate</p>
      <h1 class="mt-4 text-3xl font-black tracking-tight text-slate-950">Dish not found</h1>
      <p class="mt-3 text-sm leading-6 text-slate-600">This dish may not be available or the link may be incorrect.</p>
    </div>
  </div>

  <!-- QR landing: AR-first only (mobile AR auto-launch) -->
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

  <!-- Dish content: design's split layout for desktop, fallback for mobile -->
  <div v-else class="min-h-screen">
    <!-- Top bar -->
    <div
      class="flex justify-between items-center sticky top-0 z-50 border-b border-line gap-3.5 flex-wrap
             px-10 py-7 max-[720px]:px-4.5 max-[720px]:py-4 max-[720px]:gap-2.5"
      style="background: rgba(243, 237, 226, 0.92); backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%);"
    >
      <button type="button" @click="$router.back()" class="inline-flex items-center gap-2.5 font-body text-sm text-ink-soft px-3.5 py-2 rounded-full transition hover:bg-[rgba(26,20,16,0.06)] hover:text-ink">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 2L4 7l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        Tilbage
      </button>
      <div class="font-mono text-[11px] uppercase font-medium text-ink-faint hidden md:block" style="letter-spacing: 0.18em;">
        <strong>{{ dish.name }}</strong>
      </div>
      <div class="flex gap-2.5">
        <button type="button" aria-label="Share" class="w-10 h-10 rounded-full border border-line-strong grid place-items-center text-ink transition hover:border-ink hover:bg-[rgba(26,20,16,0.04)]">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M3 8l5-5m0 0l5 5M8 3v10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Main layout -->
    <div class="d-main grid min-h-[calc(100vh-90px)]" style="grid-template-columns: 1.4fr 1fr;">
      <!-- 3D viewer -->
      <div v-if="dish.hasModel" class="relative overflow-hidden grid place-items-center min-h-[70vh]" style="background: linear-gradient(180deg, #1a1410 0%, #2b1f15 50%, #1a1410 100%);">
        <div class="absolute inset-0 z-[1]" style="background: radial-gradient(circle at 50% 55%, rgba(184, 122, 78, 0.45), transparent 55%);" />
        <div
          class="absolute inset-0 z-[1] pointer-events-none"
          style="background-image: linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px); background-size: 40px 40px; mask: radial-gradient(circle at center, black 30%, transparent 80%); -webkit-mask: radial-gradient(circle at center, black 30%, transparent 80%);"
        />

        <!-- Top label -->
        <div
          class="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2.5 font-mono text-[11px] uppercase font-medium text-clay-soft z-[4]"
          style="letter-spacing: 0.22em;"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-clay animate-pulse-clay" />
          3D - interaktiv
        </div>

        <!-- Corners -->
        <div class="absolute inset-8 z-[4] pointer-events-none">
          <span class="absolute top-0 left-0 w-[22px] h-[22px]" style="border: 1px solid rgba(212, 168, 128, 0.6); border-right: none; border-bottom: none;" />
          <span class="absolute top-0 right-0 w-[22px] h-[22px]" style="border: 1px solid rgba(212, 168, 128, 0.6); border-left: none; border-bottom: none;" />
          <span class="absolute bottom-0 left-0 w-[22px] h-[22px]" style="border: 1px solid rgba(212, 168, 128, 0.6); border-right: none; border-top: none;" />
          <span class="absolute bottom-0 right-0 w-[22px] h-[22px]" style="border: 1px solid rgba(212, 168, 128, 0.6); border-left: none; border-top: none;" />
        </div>

        <div class="relative z-[2] w-full h-full" style="min-height: 60vh;">
          <ViewerDishViewer
            v-if="!showQrArLoader"
            ref="viewerComponent"
            :glb-url="modelGlbUrl"
            :usdz-url="modelUsdzUrl"
            :poster-url="modelPosterUrl"
            :alt="dish.name"
            :scale="viewerScale"
            height="100%"
            @viewer-loaded="onViewerLoaded"
            @ar-clicked="onArClicked"
          />
        </div>
      </div>

      <!-- No-model fallback for left panel -->
      <div v-else class="relative overflow-hidden grid place-items-center min-h-[70vh]" style="background: linear-gradient(180deg, #1a1410 0%, #2b1f15 50%, #1a1410 100%);">
        <div class="w-full aspect-square max-w-md">
          <img
            v-if="dish.hasPoster"
            :src="modelPosterUrl!"
            :alt="dish.name"
            class="w-full h-full object-cover rounded-xl"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-white/30">
            <svg class="w-20 h-20" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 0v18M3 12h18" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Info panel (right side) -->
      <div class="p-15 px-14 flex flex-col relative max-[980px]:px-8 max-[980px]:py-12">
        <div v-if="showFallbackNotice" class="rounded-3xl border border-orange-100 bg-orange-50/70 p-4 text-center shadow-sm mb-8">
          <p class="text-sm font-medium text-gray-700">AR kunne ikke åbnes på den her enhed.</p>
          <p class="mt-1 text-sm text-gray-500">Du får 3D-visningen i stedet.</p>
        </div>

        <h1
          class="font-display font-normal mb-8 leading-[0.98]"
          style="font-size: clamp(36px, 4.4vw, 64px); letter-spacing: -0.025em;"
        >
          {{ dish.name }}
        </h1>

        <div class="flex justify-between items-baseline py-5 border-t border-b border-line mb-8">
          <span class="mono-label">Dish</span>
          <span v-if="dish.priceText" class="font-body text-[32px] font-medium text-ink tabular-nums">{{ dish.priceText }}</span>
        </div>

        <p v-if="dish.shortDescription" class="text-[17px] leading-[1.6] text-ink-soft mb-10 max-w-[540px]">{{ dish.shortDescription }}</p>

        <div v-if="ingredientList.length" class="mb-7">
          <h5 class="mono-label mb-3">Ingredienser</h5>
          <div class="flex flex-wrap gap-2">
            <span v-for="i in ingredientList" :key="i" class="font-body text-[13px] px-3.5 py-1.5 bg-card rounded-full text-ink-soft">{{ i }}</span>
          </div>
        </div>
        <div v-if="allergenList.length" class="mb-7">
          <h5 class="mono-label mb-3">Allergener</h5>
          <div class="flex flex-wrap gap-2">
            <span v-for="a in allergenList" :key="a" class="font-body text-[13px] px-3.5 py-1.5 bg-card rounded-full text-ink-soft">{{ a }}</span>
          </div>
        </div>

        <!-- AR CTA -->
        <div
          v-if="dish.hasModel"
          class="mt-10 p-8 rounded relative overflow-hidden text-ink-inv"
          style="background: #2b1f15;"
        >
          <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(circle at 80% 50%, rgba(184, 122, 78, 0.4), transparent 55%);" />
          <h4 class="relative font-display font-normal text-2xl tracking-[-0.015em] mb-2" style="color: #f3ede2;">
            Se den på <span class="italic text-clay-soft">jeres bord</span>.
          </h4>

          <!-- Mobile: AR button -->
          <template v-if="isMobile">
            <p class="relative text-sm leading-[1.5] mb-6 max-w-[380px]" style="color: rgba(243, 237, 226, 0.7);">
              Tryk for at åbne AR og se retten på dit bord.
            </p>
            <button
              type="button"
              class="relative inline-flex items-center gap-3.5 px-7 py-4.5 rounded-full font-medium text-[15px] transition hover:-translate-y-px"
              style="background: #d4a880; color: #2b1f15;"
              @click="onArClicked"
            >
              <span>View in AR</span>
            </button>
          </template>

          <!-- Desktop: QR code -->
          <template v-else>
            <p class="relative text-sm leading-[1.5] mb-6 max-w-[380px]" style="color: rgba(243, 237, 226, 0.7);">
              Scan med din telefon for at se retten på dit bord.
            </p>
            <div v-if="qrDataUrl" class="relative">
              <img :src="qrDataUrl" alt="QR code" class="w-[160px] h-[160px] rounded-lg" />
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { trackPageOpen, trackViewerLoaded, trackArLaunchClicked } from '~/lib/analytics/events'
import QRCode from 'qrcode'

definePageMeta({ layout: false })

const route = useRoute()
const publicDishId = route.params.publicDishId as string

interface PublicDish {
  publicDishId: string
  name: string
  shortDescription: string | null
  priceText: string | null
  allergens: string | null
  ingredients: string | null
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
  if (!viewerLoaded.value) return 'Vi klargør AR-oplevelsen...'
  if (arLaunching.value) return 'Åbner kamera og placering på bordet...'
  return 'Næsten klar...'
})

const qrDataUrl = ref<string | null>(null)

onMounted(async () => {
  if (typeof window !== 'undefined') {
    const dishUrl = `${window.location.origin}/d/${publicDishId}`
    qrDataUrl.value = await QRCode.toDataURL(dishUrl, { width: 400, margin: 2 })
  }
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
  return scaleCm && scaleCm > 0 ? scaleCm / 100 : 0.24
})

const allergenList = computed<string[]>(() => {
  if (!dish.value?.allergens) return []
  return dish.value.allergens
    .split(',')
    .map((a) => a.trim())
    .filter(Boolean)
})

const ingredientList = computed<string[]>(() => {
  if (!dish.value?.ingredients) return []
  return dish.value.ingredients
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

<style scoped>
@media (max-width: 980px) {
  .d-main { grid-template-columns: 1fr !important; }
}
</style>
