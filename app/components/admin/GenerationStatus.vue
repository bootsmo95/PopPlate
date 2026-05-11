<template>
  <div class="rounded-xl border border-gray-200 p-5 bg-white">
    <!-- No job yet -->
    <template v-if="!latestJob">
      <div v-if="imageCount >= MIN_IMAGES" class="flex items-center gap-3">
        <p class="text-sm text-gray-600 flex-1">Ready to generate a 3D model from your images.</p>
        <button
          :disabled="loading"
          class="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-400 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
          @click="startGeneration"
        >
          {{ loading ? 'Starting…' : 'Start Generation' }}
        </button>
      </div>
      <p v-else class="text-sm text-amber-600 bg-amber-50 rounded-lg px-4 py-3">
        Upload at least {{ MIN_IMAGES }} images to start generation ({{ imageCount }}/{{ MIN_IMAGES }} uploaded).
      </p>
    </template>

    <!-- Queued -->
    <template v-else-if="latestJob.status === 'queued'">
      <div class="space-y-2">
        <div class="flex items-center gap-3 text-sm text-gray-600">
          <svg class="animate-spin h-4 w-4 text-slate-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Your 3D model is in the queue and will start generating shortly.</span>
        </div>
        <p class="text-xs text-gray-400 ml-7">This usually takes a few minutes. You can leave this page — we'll keep working in the background.</p>
      </div>
    </template>

    <!-- Processing -->
    <template v-else-if="latestJob.status === 'processing'">
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <p class="text-sm text-slate-700 font-medium">Generating 3D model&hellip;</p>
          <span class="text-sm font-semibold text-slate-700 tabular-nums">{{ latestJob.progress ?? 0 }}%</span>
        </div>
        <div class="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div
            class="h-2.5 bg-slate-600 rounded-full transition-all duration-500 ease-out"
            :style="{ width: `${latestJob.progress ?? 0}%` }"
          />
        </div>
        <p class="text-xs text-gray-400">This typically takes 2–5 minutes. You can leave this page.</p>
      </div>
    </template>

    <!-- Failed -->
    <template v-else-if="latestJob.status === 'failed'">
      <div class="space-y-3">
        <div class="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
          <p class="text-sm font-semibold text-red-700 mb-0.5">Generation failed</p>
          <p v-if="latestJob.errorMessage" class="text-sm text-red-600">{{ latestJob.errorMessage }}</p>
          <p v-else class="text-sm text-red-500">An unknown error occurred.</p>
        </div>
        <button
          :disabled="loading"
          class="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-400 text-white text-sm font-semibold rounded-lg transition-colors"
          @click="startGeneration"
        >
          {{ loading ? 'Starting…' : 'Retry Generation' }}
        </button>
      </div>
    </template>

    <!-- Ready -->
    <template v-else-if="latestJob.status === 'ready' || dishStatus === 'ready' || dishStatus === 'published'">
      <div class="space-y-3">
        <div class="flex items-center gap-2 text-green-700">
          <svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <p class="text-sm font-semibold">Generation complete!</p>
        </div>
        <button
          :disabled="loading"
          class="px-4 py-2 bg-white hover:bg-gray-50 disabled:opacity-50 text-slate-700 text-sm font-medium border border-gray-300 rounded-lg transition-colors"
          @click="startGeneration"
        >
          {{ loading ? 'Starting…' : 'Retry Generation' }}
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
  imageCount: number
  latestJob: GenerationJob | null
}>()

const emit = defineEmits<{
  jobCreated: [job: GenerationJob]
}>()

const loading = ref(false)
const error = ref('')

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
    error.value = e?.data?.message ?? e?.message ?? 'Failed to start generation.'
  } finally {
    loading.value = false
  }
}
</script>
