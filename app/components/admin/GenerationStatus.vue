<template>
  <div class="rounded-xl border border-gray-200 p-5 bg-white">
    <!-- No job yet -->
    <template v-if="!latestJob && !isReady">
      <div v-if="imageCount >= MIN_IMAGES" class="flex items-center gap-3">
        <p class="text-sm text-gray-600 flex-1">Klar til at generere en 3D-model fra dine billeder.</p>
        <button
          :disabled="loading"
          class="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-400 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
          @click="startGeneration"
        >
          {{ loading ? 'Starter...' : 'Start generation' }}
        </button>
      </div>
      <p v-else class="text-sm text-amber-600 bg-amber-50 rounded-lg px-4 py-3">
        Upload mindst {{ MIN_IMAGES }} billeder for at starte generation ({{ imageCount }}/{{ MIN_IMAGES }} uploadet).
      </p>
    </template>

    <!-- Queued -->
    <template v-else-if="latestJob?.status === 'queued'">
      <div class="space-y-2">
        <div class="flex items-center gap-3 text-sm text-gray-600">
          <svg class="animate-spin h-4 w-4 text-slate-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Din 3D-model er i kø og starter om lidt.</span>
        </div>
        <p class="text-xs text-gray-400 ml-7">Det tager typisk et par minutter. Du kan godt forlade siden imens.</p>
      </div>
    </template>

    <!-- Ready -->
    <template v-else-if="isReady">
      <div class="space-y-3">
        <div class="flex items-center gap-2 text-green-700">
          <svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <p class="text-sm font-semibold">3D-modellen er klar.</p>
        </div>
        <button
          :disabled="loading"
          class="px-4 py-2 bg-white hover:bg-gray-50 disabled:opacity-50 text-slate-700 text-sm font-medium border border-gray-300 rounded-lg transition-colors"
          @click="startGeneration"
        >
          {{ loading ? 'Starter...' : 'Generer igen' }}
        </button>
      </div>
    </template>

    <!-- Processing -->
    <template v-else-if="latestJob?.status === 'processing'">
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <p class="text-sm text-slate-700 font-medium">Genererer 3D-model...</p>
          <span class="text-sm font-semibold text-slate-700 tabular-nums">{{ displayProgress }}%</span>
        </div>
        <div class="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div
            class="h-2.5 bg-slate-600 rounded-full transition-all duration-700 ease-out"
            :style="{ width: `${displayProgress}%` }"
          />
        </div>
        <p class="text-xs text-gray-400">Det tager typisk 2-5 minutter. Du kan godt forlade siden imens.</p>
      </div>
    </template>

    <!-- Failed -->
    <template v-else-if="latestJob?.status === 'failed'">
      <div class="space-y-3">
        <div class="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
          <p class="text-sm font-semibold text-red-700 mb-0.5">Generation fejlede</p>
          <p v-if="latestJob.errorMessage" class="text-sm text-red-600">{{ latestJob.errorMessage }}</p>
          <p v-else class="text-sm text-red-500">Der opstod en ukendt fejl.</p>
        </div>
        <button
          :disabled="loading"
          class="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-400 text-white text-sm font-semibold rounded-lg transition-colors"
          @click="startGeneration"
        >
          {{ loading ? 'Starter...' : 'Prøv igen' }}
        </button>
      </div>
    </template>

    <p v-if="error" class="mt-3 text-red-600 text-sm">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
const MIN_IMAGES = 2

interface GenerationJob {
  id: string
  dishId: string
  status: string
  attemptNumber: number
  progress: number
  errorMessage: string | null
  errorCode: string | null
  createdAt: string
  updatedAt: string
}

const props = defineProps<{
  dishId: string
  dishStatus: string
  hasModel?: boolean
  imageCount: number
  latestJob: GenerationJob | null
}>()

const emit = defineEmits<{
  jobCreated: [job: GenerationJob]
}>()

const loading = ref(false)
const error = ref('')
const isReady = computed(() =>
  props.hasModel ||
  props.latestJob?.status === 'ready' ||
  props.dishStatus === 'ready' ||
  props.dishStatus === 'published',
)

// Smooth progress: interpolate between polled values so the bar doesn't jump
const serverProgress = computed(() => props.latestJob?.progress ?? 0)
const interpolatedProgress = ref(0)
let interpolationTimer: ReturnType<typeof setInterval> | null = null

watch(serverProgress, (newVal) => {
  if (interpolationTimer) clearInterval(interpolationTimer)

  if (newVal <= interpolatedProgress.value) {
    interpolatedProgress.value = newVal
    return
  }

  // Smoothly step toward the new server value over ~2.5 seconds
  const diff = newVal - interpolatedProgress.value
  const steps = 10
  const stepSize = diff / steps
  let remaining = steps

  interpolationTimer = setInterval(() => {
    remaining--
    if (remaining <= 0) {
      interpolatedProgress.value = newVal
      if (interpolationTimer) clearInterval(interpolationTimer)
      interpolationTimer = null
    } else {
      interpolatedProgress.value = Math.round(interpolatedProgress.value + stepSize)
    }
  }, 250)
}, { immediate: true })

// Reset interpolation when job changes
watch(() => props.latestJob?.id, () => {
  interpolatedProgress.value = 0
  if (interpolationTimer) {
    clearInterval(interpolationTimer)
    interpolationTimer = null
  }
})

onUnmounted(() => {
  if (interpolationTimer) clearInterval(interpolationTimer)
})

const displayProgress = computed(() => isReady.value ? 100 : Math.min(interpolatedProgress.value, 99))

async function startGeneration() {
  loading.value = true
  error.value = ''
  try {
    const job = await $fetch<GenerationJob>(`/api/dishes/${props.dishId}/generate`, {
      method: 'POST',
    })
    emit('jobCreated', job)
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    error.value = e?.data?.message ?? e?.message ?? 'Kunne ikke starte generation.'
  } finally {
    loading.value = false
  }
}
</script>
