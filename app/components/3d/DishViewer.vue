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

    <!-- model-viewer web component -->
    <model-viewer
      v-else
      :src="glbUrl"
      :ios-src="usdzUrl ?? undefined"
      :poster="posterUrl ?? undefined"
      :alt="alt ?? 'Dish 3D model'"
      auto-rotate
      camera-controls
      ar
      ar-modes="webxr scene-viewer quick-look"
      loading="lazy"
      class="w-full rounded-xl overflow-hidden block"
      :style="{ height: viewerHeight }"
      @error="hasError = true"
      @load="emit('viewer-loaded')"
    >
      <!-- iOS Quick Look source -->
      <source v-if="usdzUrl" :src="usdzUrl" type="model/vnd.usdz+zip" />

      <!-- AR button (slot) -->
      <ThreeDArButton @ar-clicked="emit('ar-clicked')" />

      <!-- Loading slot -->
      <div slot="progress-bar" class="w-full h-1 bg-gray-200">
        <div class="h-1 bg-orange-400 transition-all" style="width: 100%" />
      </div>
    </model-viewer>
  </div>
</template>

<script setup lang="ts">
// Import the model-viewer custom element on client only
if (import.meta.client) {
  import('@google/model-viewer')
}

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
</script>
