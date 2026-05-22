<template>
  <div data-screen-label="Edit dish">
    <TopBar :show-search="false" cta-label="Gem ændringer" cta-href="#save" />

    <!-- Loading -->
    <PageSkeleton v-if="pending" variant="detail" />

    <!-- Error loading -->
    <div v-else-if="fetchError" class="text-red-600 text-sm py-12 text-center">Failed to load dish.</div>

    <template v-else-if="dish">
      <PageHead back-href="/platform/dishes" back-label="Tilbage til retter">
        <template #title>
          <div class="flex items-center gap-4 flex-wrap">
            <h1 class="page-title !text-[44px]">{{ dish.name }}</h1>
            <StatusBadge :status="dish.status" />
          </div>
        </template>
        <template #actions>
          <NuxtLink v-if="dish.publicDishId" :to="`/d/${dish.publicDishId}`" target="_blank" rel="noopener" class="top-btn">
            <Icon name="arrow-up-right" :size="14" />
            <span>Vis live menu</span>
          </NuxtLink>
        </template>
      </PageHead>

      <div class="two-col">
        <!-- LEFT -->
        <div>
          <form class="max-w-none" @submit.prevent="handleSave">
            <!-- Detaljer -->
            <div class="p-card">
              <div class="mb-4">
                <h3 class="font-display font-normal text-[22px] tracking-[-0.015em]">Detaljer</h3>
              </div>
              <div class="mb-6">
                <label class="field-label">Navn <span class="text-[#a85a48]">*</span></label>
                <input v-model="form.name" type="text" required class="field-input">
              </div>
              <div class="mb-6">
                <label class="field-label">Kort beskrivelse</label>
                <textarea v-model="form.shortDescription" class="field-textarea" />
              </div>
              <div class="grid grid-cols-2 gap-4 max-[600px]:grid-cols-1">
                <div class="mb-6">
                  <label class="field-label">Pris</label>
                  <input v-model="form.priceText" type="text" class="field-input">
                </div>
                <div class="mb-6">
                  <label class="field-label">Tallerken-størrelse i AR (cm)</label>
                  <input v-model.number="form.scaleCm" type="number" min="1" max="200" step="0.1" placeholder="24" class="field-input">
                  <div class="field-hint">Brug tallerkenens faktiske diameter, fx 24 cm.</div>
                </div>
              </div>
              <div class="mb-6">
                <label class="field-label">Allergener</label>
                <input v-model="form.allergens" type="text" class="field-input">
                <div class="field-hint">Komma-separeret. Vises som chips på menuen.</div>
              </div>
              <div class="mb-6">
                <label class="field-label">Ingredienser</label>
                <textarea
                  v-model="form.ingredients"
                  class="field-textarea"
                  style="min-height: 80px;"
                />
                <div class="field-hint">Komma-separeret. Bruges af AI til at forstå retten.</div>
              </div>

              <ActionButton variant="primary" type="submit" :loading="saving" class="!py-3.5 !px-6 !text-sm">
                Gem ændringer
              </ActionButton>
            </div>

            <!-- Kildebilleder -->
            <div class="p-card mt-5">
              <div class="flex justify-between items-center mb-4">
                <h3 class="font-display font-normal text-[22px] tracking-[-0.015em]">Kildebilleder</h3>
                <span class="font-mono text-[11px] uppercase text-ink-faint" style="letter-spacing: 0.15em;">
                  {{ sourceImages.length }} BILLEDER
                </span>
              </div>
              <TipsPanel />
              <AdminImageUploader
                :dish-id="dish.id"
                :restaurant-id="dish.restaurantId"
                :existing-images="sourceImages"
                @uploaded="handleImageUploaded"
                @deleted="handleImageDeleted"
              />
            </div>

            <!-- 3D-generation -->
            <div class="p-card mt-5">
              <div class="mb-4">
                <h3 class="font-display font-normal text-[22px] tracking-[-0.015em]">3D-generation</h3>
              </div>
              <AdminGenerationStatus
                :dish-id="dish.id"
                :dish-status="dish.status"
                :has-model="!!dish.previewModelGlbUrl"
                :image-count="sourceImages.length"
                :latest-job="latestJob"
                :monthly-limit-reached="monthlyLimitReached"
                @job-created="handleJobCreated"
              />
            </div>
          </form>
        </div>

        <!-- RIGHT -->
        <aside class="sticky top-6">
          <!-- 3D Preview -->
          <div
            v-if="dish.previewModelGlbUrl"
            class="p-card relative overflow-hidden !p-0"
            style="background: linear-gradient(180deg, #1a1410 0%, #2b1f15 100%); color: #f3ede2; border: none;"
          >
            <div class="absolute inset-0" style="background: radial-gradient(circle at 50% 30%, rgba(184, 122, 78, 0.28), transparent 65%);" />
            <div class="relative flex justify-between items-center px-6 pt-5">
              <div class="mono-label !text-clay-soft flex items-center gap-2.5 font-medium">
                <span class="w-1.5 h-1.5 rounded-full" style="background: #6e8b5a;" />
                3D-forhåndsvisning
              </div>
              <div class="font-mono text-[10px]" style="color: rgba(243, 237, 226, 0.5); letter-spacing: 0.12em;">DRAG TO ROTATE</div>
            </div>
            <div class="relative px-8 pb-8 pt-2.5" style="min-height: 400px;">
              <ViewerDishViewer
                :glb-url="modelGlbUrl"
                :usdz-url="modelUsdzUrl"
                :poster-url="modelPosterUrl"
                :alt="dish.name"
                :scale="viewerScale"
                height="400px"
              />
            </div>
          </div>

          <!-- Publicering & QR -->
          <div class="p-card" :class="dish.previewModelGlbUrl ? 'mt-4' : ''">
            <div class="mb-4">
              <h3 class="font-display font-normal text-[22px] tracking-[-0.015em]">Publicering &amp; QR</h3>
            </div>
            <AdminPublishControls
              :dish="dish"
              :qr-code="qrCode"
              @published="handlePublished"
              @unpublished="handleUnpublished"
            />
          </div>

          <!-- Statistik -->
          <div v-if="analyticsData" class="p-card mt-4">
            <div class="flex justify-between items-center mb-4">
              <h3 class="font-display font-normal text-[22px] tracking-[-0.015em]">Statistik</h3>
              <span class="font-mono text-[10px] text-ink-faint" style="letter-spacing: 0.18em;">TOTAL</span>
            </div>
            <div class="grid grid-cols-3 border border-line rounded-md overflow-hidden">
              <div class="px-4 py-4.5 bg-card">
                <div class="font-mono text-[9px] uppercase text-ink-faint font-medium mb-2.5" style="letter-spacing: 0.15em;">
                  Side-visninger
                </div>
                <div class="font-body font-light text-[32px] leading-none tracking-[-0.03em] text-ink tabular-nums">
                  {{ analyticsData.page_open }}
                </div>
              </div>
              <div class="px-4 py-4.5 bg-card border-l border-line">
                <div class="font-mono text-[9px] uppercase text-ink-faint font-medium mb-2.5" style="letter-spacing: 0.15em;">
                  Viewer-loads
                </div>
                <div class="font-body font-light text-[32px] leading-none tracking-[-0.03em] text-ink tabular-nums">
                  {{ analyticsData.viewer_loaded }}
                </div>
              </div>
              <div class="px-4 py-4.5 bg-card border-l border-line">
                <div class="font-mono text-[9px] uppercase text-ink-faint font-medium mb-2.5" style="letter-spacing: 0.15em;">
                  AR-starter
                </div>
                <div class="font-body font-light text-[32px] leading-none tracking-[-0.03em] text-ink tabular-nums">
                  {{ analyticsData.ar_launch_clicked }}
                </div>
              </div>
            </div>
          </div>

          <!-- Danger zone -->
          <div class="p-card mt-4" style="border-color: rgba(168, 90, 72, 0.25); background: rgba(168, 90, 72, 0.04);">
            <div class="mb-4">
              <h3 class="font-display font-normal text-xl tracking-[-0.015em]" style="color: #8a4838;">Fjern ret</h3>
            </div>
            <p class="text-[13px] text-ink-mute mb-3.5 leading-[1.5]">
              Arkiver for at skjule retten uden at miste data -- eller slet permanent. Slettet ret kan ikke gendannes.
            </p>
            <p v-if="dish.status === 'archived'" class="text-sm text-ink-mute mb-3">This dish is archived.</p>
            <div class="flex gap-2">
              <ActionButton
                v-if="dish.status !== 'archived'"
                variant="ghost"
                :loading="archiving"
                :disabled="deleting"
                class="flex-1 !justify-center"
                @click="handleArchive"
              >
                Arkiver ret
              </ActionButton>
              <ActionButton
                v-if="isAdmin"
                variant="danger"
                :loading="deleting"
                :disabled="archiving"
                class="flex-1 !justify-center"
                @click="handlePermanentDelete"
              >
                Slet ret
              </ActionButton>
            </div>
          </div>
        </aside>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import TopBar from '~/components/platform/TopBar.vue'
import PageHead from '~/components/platform/PageHead.vue'
import StatusBadge from '~/components/platform/StatusBadge.vue'
import TipsPanel from '~/components/platform/TipsPanel.vue'
import Icon from '~/components/shared/Icon.vue'
import ActionButton from '~/components/shared/ActionButton.vue'
import PageSkeleton from '~/components/platform/PageSkeleton.vue'
import type { DishStatus } from '~/types'

definePageMeta({ layout: 'platform' })

const { toast } = useToast()
const route = useRoute()
const id = route.params.id as string
const ssrHeaders = useAuthHeaders()
const { user } = useAuth()
const isAdmin = computed(() => user.value?.role === 'admin')

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
  scaleCm: number | null
  createdAt: string
  updatedAt: string
}

const {
  data: dish,
  pending,
  error: fetchError,
  refresh,
} = useLazyFetch<DishDetail>(`/api/dishes/${id}`, { headers: ssrHeaders })

function resolveModelUrl(url: string | null, ext: string): string | undefined {
  if (!url) return undefined
  return `/api/dishes/${id}/model/${ext}`
}
const modelGlbUrl = computed(() => resolveModelUrl(dish.value?.previewModelGlbUrl ?? null, 'glb'))
const modelUsdzUrl = computed(() => resolveModelUrl(dish.value?.previewModelUsdzUrl ?? null, 'usdz'))
const modelPosterUrl = computed(() => resolveModelUrl(dish.value?.posterUrl ?? null, 'png'))
const viewerScale = computed(() => {
  const scaleCm = dish.value?.scaleCm
  return scaleCm && scaleCm > 0 ? scaleCm / 100 : 0.24
})

// Source images
const { data: sourceImagesData, refresh: refreshImages } = useLazyFetch<SourceImage[]>(
  `/api/dishes/${id}/images`,
  { headers: ssrHeaders },
)
const sourceImages = computed(() => sourceImagesData.value ?? [])

// Generation usage
interface UsageData {
  used: number
  limit: number | null
  tierName: string
  cycleStart: string
  unlimited: boolean
}
const { data: usageData, refresh: refreshUsage } = useLazyFetch<UsageData>('/api/user/usage', { headers: ssrHeaders })

const monthlyLimitReached = computed(() => {
  if (!usageData.value || usageData.value.unlimited) return false
  return usageData.value.used >= (usageData.value.limit ?? Infinity)
})

// Latest generation job
const jobsData = ref<GenerationJob[]>([])

async function refreshJobs() {
  jobsData.value = await $fetch<GenerationJob[]>(`/api/dishes/${id}/jobs`, {
    query: { t: Date.now() },
    headers: ssrHeaders,
  })
}

refreshJobs()

const latestJob = computed<GenerationJob | null>(() => jobsData.value?.[0] ?? null)

// QR code
const { data: qrCode, refresh: refreshQr } = useLazyFetch<QrCode | null>(
  `/api/dishes/${id}/qr`,
  { headers: ssrHeaders },
)

// Analytics counts
interface AnalyticsData {
  page_open: number
  viewer_loaded: number
  ar_launch_clicked: number
}
const { data: analyticsData, refresh: refreshAnalytics } = useLazyFetch<AnalyticsData>(
  `/api/dishes/${id}/analytics`,
  { headers: ssrHeaders },
)

// Auto-polling when job is queued or processing
let pollInterval: ReturnType<typeof setInterval> | null = null
let isPolling = false

function startPolling() {
  if (pollInterval) return
  pollInterval = setInterval(async () => {
    try {
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
    } catch {
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
  toast.success('3D-model genereres nu')
  await Promise.all([refreshJobs(), refresh(), refreshUsage()])
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
  scaleCm: (dish.value?.scaleCm ?? null) as number | null,
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
      form.scaleCm = d.scaleCm ?? null
    }
  },
)

const saving = ref(false)

async function handleSave() {
  saving.value = true

  try {
    const normalizedScaleCm = typeof form.scaleCm === 'number' && Number.isFinite(form.scaleCm)
      ? form.scaleCm
      : null

    await $fetch(`/api/dishes/${id}`, {
      method: 'PUT',
      body: {
        name: form.name.trim(),
        shortDescription: form.shortDescription.trim() || null,
        priceText: form.priceText.trim() || null,
        allergens: form.allergens.trim() || null,
        ingredients: form.ingredients.trim() || null,
        scaleCm: normalizedScaleCm,
      },
    })

    toast.success('Ændringer gemt')
    await refresh()
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    toast.error(e?.data?.message ?? 'Noget gik galt — prøv igen')
  } finally {
    saving.value = false
  }
}

const archiving = ref(false)
const deleting = ref(false)

async function handleArchive() {
  if (!confirm('Archive this dish? It will no longer be visible to guests.')) return

  archiving.value = true

  try {
    await $fetch(`/api/dishes/${id}`, { method: 'DELETE' })
    toast.success('Ret arkiveret')
    await refresh()
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    toast.error(e?.data?.message ?? 'Noget gik galt — prøv igen')
  } finally {
    archiving.value = false
  }
}

async function handlePermanentDelete() {
  if (!confirm('Permanently delete this dish? This removes its QR code, analytics, jobs, and source image records.')) return

  deleting.value = true

  try {
    await $fetch(`/api/dishes/${id}`, {
      method: 'DELETE',
      query: { hard: 'true' },
    })
    await navigateTo('/platform/dishes')
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    toast.error(e?.data?.message ?? 'Noget gik galt — prøv igen')
  } finally {
    deleting.value = false
  }
}
</script>
