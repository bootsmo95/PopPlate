<template>
  <div class="w-full relative" :style="{ height: viewerHeight }">
    <model-viewer
      ref="viewerRef"
      :src="glbUrl"
      :ios-src="effectiveUsdzUrl ?? undefined"
      :poster="posterUrl ?? undefined"
      :alt="alt ?? 'Dish 3D model'"
      :scale="scaleAttr"
      ar-scale="fixed"
      :auto-rotate="autoRotate ? true : undefined"
      :auto-rotate-delay="autoRotate ? 0 : undefined"
      :rotation-per-second="autoRotate ? rotationPerSecond : undefined"
      camera-controls
      ar
      ar-modes="webxr scene-viewer quick-look"
      shadow-intensity="0.6"
      exposure="0.85"
      environment-image="neutral"
      tone-mapping="commerce"
      class="w-full rounded-xl overflow-hidden transition-opacity duration-300"
      :class="hasError ? 'opacity-0 pointer-events-none absolute inset-0' : modelLoaded ? 'opacity-100' : 'opacity-[0.02]'"
      :style="{ height: '100%', display: 'block' }"
      @error="handleError"
      @load="handleLoad"
    >
      <ViewerArButton @ar-clicked="emit('ar-clicked')" />
    </model-viewer>

    <div
      v-if="!hasError && !modelLoaded"
      class="absolute inset-0 flex items-center justify-center rounded-xl"
      :style="{ height: viewerHeight }"
    >
      <div class="flex items-center gap-2 text-sm" style="color: rgba(212, 168, 128, 0.55);">
        <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Indlæser 3D-visning...
      </div>
    </div>

    <div
      v-if="hasError"
      class="absolute inset-0 flex flex-col items-center justify-center rounded-xl gap-2"
      :style="{ height: viewerHeight, color: 'rgba(212, 168, 128, 0.45)' }"
    >
      <svg class="w-10 h-10" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
      <p class="text-sm">3D-visning er ikke tilgængelig</p>
    </div>
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
    scale?: number
    autoAr?: boolean
    autoRotate?: boolean
    rotationPerSecond?: string
  }>(),
  {
    usdzUrl: null,
    posterUrl: null,
    alt: 'Dish 3D model',
    height: '60vh',
    scale: 0.05,
    autoAr: false,
    autoRotate: true,
    rotationPerSecond: '18deg',
  },
)

type ModelViewerElement = HTMLElement & {
  canActivateAR?: boolean
  activateAR?: () => Promise<void>
}

const viewerRef = ref<ModelViewerElement | null>(null)
const viewerHeight = computed(() => props.height)
const scaleAttr = computed(() => `${props.scale} ${props.scale} ${props.scale}`)
const hasError = ref(false)
const modelLoaded = ref(false)
const pendingArActivation = ref(false)
const isIosQuickLook = ref(false)
const effectiveUsdzUrl = computed(() => isIosQuickLook.value ? props.usdzUrl : null)

onMounted(() => {
  const ua = window.navigator.userAgent
  const isIpadOs = window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1
  isIosQuickLook.value = /iPad|iPhone|iPod/.test(ua) || isIpadOs
})

watch(
  () => props.glbUrl,
  () => {
    hasError.value = false
    modelLoaded.value = false
    pendingArActivation.value = false
  },
)

async function handleLoad() {
  modelLoaded.value = true
  emit('viewer-loaded')

  if (props.autoAr || pendingArActivation.value) {
    await activateAr()
  }
}

function handleError() {
  if (!modelLoaded.value) {
    hasError.value = true
  }
}

async function activateAr() {
  const viewer = viewerRef.value

  if (!viewer || hasError.value) {
    return false
  }

  if (!modelLoaded.value) {
    pendingArActivation.value = true
    return true
  }

  if (!viewer.canActivateAR || !viewer.activateAR) {
    pendingArActivation.value = false
    return false
  }

  pendingArActivation.value = false
  await viewer.activateAR()
  return true
}

defineExpose({
  activateAr,
  isLoaded: modelLoaded,
})
</script>

<style scoped>
model-viewer {
  --poster-color: transparent;
  background: transparent;
}
</style>
