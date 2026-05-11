<template>
  <div class="p-6 max-w-2xl">
    <div class="mb-6">
      <NuxtLink to="/admin/dishes" class="text-sm text-gray-500 hover:text-gray-700">
        ← Back to Dishes
      </NuxtLink>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="text-gray-500 text-sm">Loading…</div>

    <!-- Error loading -->
    <div v-else-if="fetchError" class="text-red-600 text-sm">Failed to load dish.</div>

    <template v-else-if="dish">
      <!-- Title + status -->
      <div class="flex items-start gap-3 mb-6">
        <h1 class="text-2xl font-bold text-gray-900 leading-tight">{{ dish.name }}</h1>
        <AdminStatusBadge :status="dish.status" class="mt-1 flex-shrink-0" />
      </div>

      <!-- Edit form -->
      <form @submit.prevent="handleSave" class="space-y-5 mb-10">
        <!-- Name -->
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
            Name <span class="text-red-500">*</span>
          </label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          />
        </div>

        <!-- Short Description -->
        <div>
          <label for="shortDescription" class="block text-sm font-medium text-gray-700 mb-1">
            Short Description
          </label>
          <textarea
            id="shortDescription"
            v-model="form.shortDescription"
            rows="2"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none"
          />
        </div>

        <!-- Price -->
        <div>
          <label for="priceText" class="block text-sm font-medium text-gray-700 mb-1">
            Price
          </label>
          <input
            id="priceText"
            v-model="form.priceText"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          />
        </div>

        <!-- Allergens -->
        <div>
          <label for="allergens" class="block text-sm font-medium text-gray-700 mb-1">
            Allergens
          </label>
          <input
            id="allergens"
            v-model="form.allergens"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          />
        </div>

        <!-- Ingredients -->
        <div>
          <label for="ingredients" class="block text-sm font-medium text-gray-700 mb-1">
            Ingredients
          </label>
          <textarea
            id="ingredients"
            v-model="form.ingredients"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none"
          />
        </div>

        <!-- Save feedback -->
        <p v-if="saveError" class="text-red-600 text-sm">{{ saveError }}</p>
        <p v-if="saveSuccess" class="text-green-600 text-sm">Changes saved.</p>

        <button
          type="submit"
          :disabled="saving"
          class="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-400 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {{ saving ? 'Saving…' : 'Save Changes' }}
        </button>
      </form>

      <!-- Source Images -->
      <section class="mb-8">
        <h2 class="text-lg font-semibold text-gray-800 mb-3">Source Images</h2>
        <AdminImageGuide class="mb-3" />
        <AdminImageUploader
          :dish-id="dish.id"
          :restaurant-id="dish.restaurantId"
          :existing-images="sourceImages"
          @uploaded="handleImageUploaded"
          @deleted="handleImageDeleted"
        />
      </section>

      <!-- Generation Status (Task 9) -->
      <section class="mb-8">
        <h2 class="text-lg font-semibold text-gray-800 mb-3">3D Generation</h2>
        <AdminGenerationStatus
          :dish-id="dish.id"
          :dish-status="dish.status"
          :image-count="sourceImages.length"
          :latest-job="latestJob"
          @job-created="handleJobCreated"
        />
      </section>

      <!-- 3D Preview (Task 12) -->
      <section v-if="dish.previewModelGlbUrl" class="mb-8">
        <h2 class="text-lg font-semibold text-gray-800 mb-3">3D Preview</h2>
        <ViewerDishViewer
          :glb-url="modelGlbUrl"
          :poster-url="modelPosterUrl"
          :alt="dish.name"
          height="400px"
        />
      </section>

      <!-- Publish & QR Code (Task 10) -->
      <section class="mb-10">
        <h2 class="text-lg font-semibold text-gray-800 mb-3">Publish &amp; QR Code</h2>
        <AdminPublishControls
          :dish="dish"
          :qr-code="qrCode"
          @published="handlePublished"
          @unpublished="handleUnpublished"
        />
      </section>

      <!-- Analytics (Task 14) -->
      <section v-if="analyticsData" class="mb-8">
        <h2 class="text-lg font-semibold text-gray-800 mb-3">Analytics</h2>
        <div class="grid grid-cols-3 gap-4">
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <p class="text-2xl font-bold text-gray-900">{{ analyticsData.page_open }}</p>
            <p class="text-xs text-gray-500 mt-1">Page Opens</p>
          </div>
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <p class="text-2xl font-bold text-gray-900">{{ analyticsData.viewer_loaded }}</p>
            <p class="text-xs text-gray-500 mt-1">Viewer Loads</p>
          </div>
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <p class="text-2xl font-bold text-gray-900">{{ analyticsData.ar_launch_clicked }}</p>
            <p class="text-xs text-gray-500 mt-1">AR Launches</p>
          </div>
        </div>
      </section>

      <!-- Archive -->
      <div class="border-t border-gray-200 pt-6">
        <h2 class="text-sm font-semibold text-gray-700 mb-2">Danger Zone</h2>
        <button
          v-if="dish.status !== 'archived'"
          :disabled="archiving"
          class="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
          @click="handleArchive"
        >
          {{ archiving ? 'Archiving…' : 'Archive Dish' }}
        </button>
        <p v-else class="text-sm text-gray-500">This dish is archived.</p>
        <p v-if="archiveError" class="text-red-600 text-sm mt-2">{{ archiveError }}</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { DishStatus } from '~/types'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const id = route.params.id as string
const ssrHeaders = useAuthHeaders()

interface SourceImage {
  id: string
  dishId: string
  storageKey: string
  imageUrl: string
  sortOrder: number
  createdAt: string
}

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

interface QrCode {
  id: string
  dishId: string
  publicUrl: string
  imageUrl: string
  createdAt: string
}

interface DishDetail {
  id: string
  restaurantId: string
  name: string
  shortDescription: string | null
  priceText: string | null
  allergens: string | null
  ingredients: string | null
  status: DishStatus
  publicDishId: string
  posterUrl: string | null
  previewModelGlbUrl: string | null
  previewModelUsdzUrl: string | null
  createdAt: string
  updatedAt: string
}

const {
  data: dish,
  pending,
  error: fetchError,
  refresh,
} = await useFetch<DishDetail>(`/api/dishes/${id}`, { headers: ssrHeaders })

function resolveModelUrl(url: string | null, ext: string): string | undefined {
  if (!url) return undefined
  if (url.startsWith('data:')) return url
  return `/m/${id}.${ext}`
}
const modelGlbUrl = computed(() => resolveModelUrl(dish.value?.previewModelGlbUrl ?? null, 'glb')!)
const modelPosterUrl = computed(() => resolveModelUrl(dish.value?.posterUrl ?? null, 'png'))

// Source images
const { data: sourceImagesData, refresh: refreshImages } = await useFetch<SourceImage[]>(
  `/api/dishes/${id}/images`,
  { headers: ssrHeaders },
)
const sourceImages = computed(() => sourceImagesData.value ?? [])

// Latest generation job
const jobsData = ref<GenerationJob[]>([])

async function refreshJobs() {
  jobsData.value = await $fetch<GenerationJob[]>(`/api/dishes/${id}/jobs`, {
    query: { t: Date.now() },
    headers: ssrHeaders,
  })
}

await refreshJobs()

const latestJob = computed<GenerationJob | null>(() => jobsData.value?.[0] ?? null)

// QR code
const { data: qrCode, refresh: refreshQr } = await useFetch<QrCode | null>(
  `/api/dishes/${id}/qr`,
  { headers: ssrHeaders },
)

// Analytics counts
interface AnalyticsData {
  page_open: number
  viewer_loaded: number
  ar_launch_clicked: number
}
const { data: analyticsData, refresh: refreshAnalytics } = await useFetch<AnalyticsData>(
  `/api/dishes/${id}/analytics`,
  { headers: ssrHeaders },
)

// Auto-polling when job is queued or processing
let pollInterval: ReturnType<typeof setInterval> | null = null
let isPolling = false

function startPolling() {
  if (pollInterval) return
  pollInterval = setInterval(async () => {
    // Use $fetch directly to bypass useFetch cache and get fresh data
    const [freshDish, freshJobs] = await Promise.all([
      $fetch<DishDetail>(`/api/dishes/${id}`),
      $fetch<GenerationJob[]>(`/api/dishes/${id}/jobs`),
    ])
    dish.value = freshDish
    jobsData.value = freshJobs
    const status = latestJob.value?.status
    if (status !== 'queued' && status !== 'processing') {
      stopPolling()
    }
  }, 3000)
}

function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
}

watch(
  latestJob,
  (job) => {
    if (job && (job.status === 'queued' || job.status === 'processing')) {
      startPolling()
    } else {
      stopPolling()
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  stopPolling()
})

function handleImageUploaded(_image: SourceImage) {
  refreshImages()
}

function handleImageDeleted(_imageId: string) {
  refreshImages()
}

async function handleJobCreated(_job: GenerationJob) {
  await Promise.all([refreshJobs(), refresh()])
}

async function handlePublished() {
  await Promise.all([refresh(), refreshQr()])
}

async function handleUnpublished() {
  await refresh()
}

const form = reactive({
  name: dish.value?.name ?? '',
  shortDescription: dish.value?.shortDescription ?? '',
  priceText: dish.value?.priceText ?? '',
  allergens: dish.value?.allergens ?? '',
  ingredients: dish.value?.ingredients ?? '',
})

watch(
  () => dish.value,
  (d) => {
    if (d) {
      form.name = d.name
      form.shortDescription = d.shortDescription ?? ''
      form.priceText = d.priceText ?? ''
      form.allergens = d.allergens ?? ''
      form.ingredients = d.ingredients ?? ''
    }
  },
)

const saving = ref(false)
const saveError = ref('')
const saveSuccess = ref(false)

async function handleSave() {
  if (!form.name.trim()) {
    saveError.value = 'Name is required.'
    return
  }

  saving.value = true
  saveError.value = ''
  saveSuccess.value = false

  try {
    await $fetch(`/api/dishes/${id}`, {
      method: 'PUT',
      body: {
        name: form.name.trim(),
        shortDescription: form.shortDescription.trim() || null,
        priceText: form.priceText.trim() || null,
        allergens: form.allergens.trim() || null,
        ingredients: form.ingredients.trim() || null,
      },
    })

    saveSuccess.value = true
    await refresh()
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    saveError.value = e?.data?.message ?? e?.message ?? 'Failed to save changes.'
  } finally {
    saving.value = false
  }
}

const archiving = ref(false)
const archiveError = ref('')

async function handleArchive() {
  if (!confirm('Archive this dish? It will no longer be visible to guests.')) return

  archiving.value = true
  archiveError.value = ''

  try {
    await $fetch(`/api/dishes/${id}`, { method: 'DELETE' })
    await refresh()
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    archiveError.value = e?.data?.message ?? e?.message ?? 'Failed to archive dish.'
  } finally {
    archiving.value = false
  }
}
</script>
