<template>
  <div>
    <!-- Monthly limit warning -->
    <div v-if="monthlyLimitReached" class="rounded-md border border-[#8b6914]/20 bg-[#8b6914]/5 px-4 py-3 mb-4">
      <p class="text-sm font-medium text-[#6b4f10] mb-0.5">Maanedlig graense naaet</p>
      <p class="text-sm text-[#8b6914]">Du har brugt alle dine 3D-generationer for denne maaned. Graensen nulstilles ved din naeste faktureringsdato.</p>
    </div>

    <!-- No job yet -->
    <template v-if="!latestJob && !isReady">
      <div v-if="imageCount >= MIN_IMAGES" class="flex items-center gap-3">
        <p class="text-sm text-ink-mute flex-1">Klar til at generere en 3D-model fra dine billeder.</p>
        <button
          :disabled="loading || monthlyLimitReached"
          class="top-btn top-btn--primary !py-3 !px-5 !text-sm disabled:opacity-50"
          @click="startGeneration"
        >
          {{ loading ? 'Starter...' : 'Start generation' }}
        </button>
      </div>
      <p v-else class="text-sm text-[#a85a48] bg-[#a85a48]/5 border border-[#a85a48]/15 rounded-md px-4 py-3">
        Upload mindst {{ MIN_IMAGES }} billeder for at starte generation ({{ imageCount }}/{{ MIN_IMAGES }} uploadet).
      </p>
    </template>

    <!-- Queued -->
    <template v-else-if="latestJob?.status === 'queued'">
      <div class="space-y-2">
        <div class="flex items-center gap-3 text-sm text-ink-soft">
          <svg class="animate-spin h-4 w-4 text-clay-deep flex-shrink-0" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Din 3D-model er i kø og starter om lidt.</span>
        </div>
        <p class="text-xs text-ink-faint ml-7">Det tager typisk et par minutter. Du kan godt forlade siden imens.</p>
      </div>
    </template>

    <!-- Ready -->
    <template v-else-if="isReady">
      <div class="space-y-3">
        <div class="flex items-center gap-2 text-[#4a6240]">
          <svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <p class="text-sm font-medium">3D-modellen er klar.</p>
        </div>
        <button
          :disabled="loading || monthlyLimitReached"
          class="top-btn !py-2.5 !px-4 !text-sm disabled:opacity-50"
          @click="startGeneration"
        >
          {{ loading ? 'Starter...' : 'Generer igen' }}
        </button>
      </div>
    </template>

    <!-- Processing -->
    <template v-else-if="latestJob?.status === 'processing'">
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <svg class="animate-spin h-4 w-4 text-clay-deep flex-shrink-0" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p class="text-sm text-ink font-medium">Genererer 3D-model...</p>
          </div>
          <span class="font-mono text-sm font-medium text-ink tabular-nums">{{ displayProgress }}%</span>
        </div>
        <div class="gen-progress-track">
          <div
            class="gen-progress-bar"
            :style="{ width: `${displayProgress}%` }"
          />
        </div>
        <p class="text-xs text-ink-faint">Det tager typisk 2-5 minutter. Du kan godt forlade siden imens.</p>
      </div>
    </template>

    <!-- Failed -->
    <template v-else-if="latestJob?.status === 'failed'">
      <div class="space-y-3">
        <div class="rounded-md border border-[#a85a48]/20 bg-[#a85a48]/5 px-4 py-3">
          <p class="text-sm font-medium text-[#8a4838] mb-0.5">Generation fejlede</p>
          <p v-if="latestJob.errorMessage" class="text-sm text-[#a85a48]">{{ latestJob.errorMessage }}</p>
          <p v-else class="text-sm text-[#a85a48]/80">Der opstod en ukendt fejl.</p>
        </div>
        <button
          :disabled="loading || monthlyLimitReached"
          class="top-btn top-btn--primary !py-3 !px-5 !text-sm disabled:opacity-50"
          @click="startGeneration"
        >
          {{ loading ? 'Starter...' : 'Prøv igen' }}
        </button>
      </div>
    </template>

    <p v-if="error" class="mt-3 text-[#a85a48] text-sm">{{ error }}</p>
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
  monthlyLimitReached?: boolean
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

<style scoped>
.gen-progress-track {
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: rgba(26, 20, 16, 0.06);
  overflow: hidden;
}
.gen-progress-bar {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #8b4e2c, #b87a4e, #d4a880);
  transition: width 700ms ease-out;
}
</style>
