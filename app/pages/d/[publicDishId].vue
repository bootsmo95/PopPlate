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
        v-if="dish.posterUrl"
        :src="dish.posterUrl"
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

    <!-- 3D Viewer -->
    <div v-if="dish.previewModelGlbUrl" class="px-5 mt-6">
      <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        View in 3D
      </h2>
      <ViewerDishViewer
        :glb-url="`/api/dishes/${dish.id}/model`"
        :usdz-url="dish.previewModelUsdzUrl ? `/api/dishes/${dish.id}/model?format=usdz` : undefined"
        :poster-url="dish.posterUrl ? `/api/dishes/${dish.id}/model?format=poster` : undefined"
        :alt="dish.name"
        height="60vh"
        @viewer-loaded="onViewerLoaded"
        @ar-clicked="onArClicked"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { trackPageOpen, trackViewerLoaded, trackArLaunchClicked } from '~/lib/analytics/events'

definePageMeta({ layout: 'public' })

const route = useRoute()
const publicDishId = route.params.publicDishId as string

interface PublicDish {
  id: string
  name: string
  shortDescription: string | null
  priceText: string | null
  allergens: string | null
  posterUrl: string | null
  previewModelGlbUrl: string | null
  previewModelUsdzUrl: string | null
  restaurantId: string
  publicDishId: string
}

const {
  data: dish,
  pending,
  error,
} = await useFetch<PublicDish>(`/api/public/dishes/${publicDishId}`)

// Parse comma-separated allergens into an array
const allergenList = computed<string[]>(() => {
  if (!dish.value?.allergens) return []
  return dish.value.allergens
    .split(',')
    .map((a) => a.trim())
    .filter(Boolean)
})

// Set page title dynamically
useHead({
  title: computed(() => dish.value?.name ?? 'Dish'),
  meta: [
    {
      name: 'description',
      content: computed(() => dish.value?.shortDescription ?? ''),
    },
  ],
})

// Analytics — only fire on client
onMounted(() => {
  if (dish.value) {
    trackPageOpen(dish.value.id, dish.value.restaurantId)
  }
})

function onViewerLoaded() {
  if (dish.value) {
    trackViewerLoaded(dish.value.id, dish.value.restaurantId)
  }
}

function onArClicked() {
  if (dish.value) {
    trackArLaunchClicked(dish.value.id, dish.value.restaurantId)
  }
}
</script>
