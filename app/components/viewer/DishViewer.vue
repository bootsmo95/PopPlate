<template>
  <div class="w-full relative">
    <!-- Error fallback -->
    <div
      v-if="hasError"
      class="w-full flex flex-col items-center justify-center bg-gray-100 rounded-xl text-gray-400 gap-2"
      :style="{ height: viewerHeight }"
    >
      <svg class="w-10 h-10" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
      <p class="text-sm">3D preview unavailable</p>
    </div>

    <!-- Loading placeholder while model-viewer loads -->
    <div
      v-else-if="!ready"
      class="w-full flex items-center justify-center bg-gray-50 rounded-xl"
      :style="{ height: viewerHeight }"
    >
      <div class="flex items-center gap-2 text-gray-400 text-sm">
        <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading 3D viewer…
      </div>
    </div>

    <!-- model-viewer web component -->
    <model-viewer
      v-show="ready && !hasError"
      :src="glbUrl"
      :ios-src="usdzUrl ?? undefined"
      :poster="posterUrl ?? undefined"
      :alt="alt ?? 'Dish 3D model'"
      auto-rotate
      camera-controls
      ar
      ar-modes="webxr scene-viewer quick-look"
      shadow-intensity="1"
      class="w-full rounded-xl overflow-hidden"
      :style="{ height: viewerHeight, display: 'block' }"
      @error="hasError = true"
      @load="handleLoad"
    >
      <source v-if="usdzUrl" :src="usdzUrl" type="model/vnd.usdz+zip" />
      <ViewerArButton @ar-clicked="emit('ar-clicked')" />
    </model-viewer>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'viewer-loaded'): void
  (e: 'ar-clicked'): void
}>()

const props = withDefaults(
  defineProps<{
    glbUrl: string
    usdzUrl?: string | null
    posterUrl?: string | null
    alt?: string
    height?: string
  }>(),
  {
    usdzUrl: null,
    posterUrl: null,
    alt: 'Dish 3D model',
    height: '60vh',
  },
)

const viewerHeight = computed(() => props.height)
const hasError = ref(false)
const ready = ref(false)

function handleLoad() {
  ready.value = true
  emit('viewer-loaded')
}

onMounted(async () => {
  try {
    await import('@google/model-viewer')
    // Give the custom element time to register and upgrade
    await nextTick()
    // If model-viewer loaded but model hasn't triggered @load yet,
    // set ready after a brief delay so the element is at least visible
    setTimeout(() => {
      if (!hasError.value) {
        ready.value = true
      }
    }, 500)
  } catch {
    hasError.value = true
  }
})
</script>
