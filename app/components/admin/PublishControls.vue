<template>
  <div class="rounded-xl border border-gray-200 p-5 bg-white">

    <!-- Not ready to publish -->
    <template v-if="!canPublish && dish.status !== 'published'">
      <div class="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 space-y-1.5">
        <p class="text-sm font-semibold text-gray-700">Cannot publish yet</p>
        <ul class="list-disc list-inside space-y-1">
          <li v-if="dish.status !== 'ready'" class="text-sm text-gray-500">
            Dish must have status "ready" (current: {{ dish.status }})
          </li>
          <li v-if="!dish.name" class="text-sm text-gray-500">Dish must have a name</li>
          <li v-if="!dish.posterUrl" class="text-sm text-gray-500">Dish must have a poster image (complete generation first)</li>
          <li v-if="!dish.previewModelGlbUrl" class="text-sm text-gray-500">Dish must have a 3D model (complete generation first)</li>
        </ul>
      </div>
    </template>

    <!-- Ready but not published -->
    <template v-else-if="dish.status === 'ready'">
      <div class="flex items-center gap-3">
        <p class="text-sm text-gray-600 flex-1">Your dish is ready to publish and share with guests.</p>
        <button
          :disabled="publishing"
          class="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-green-300 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
          @click="handlePublish"
        >
          {{ publishing ? 'Publishing…' : 'Publish Dish' }}
        </button>
      </div>
    </template>

    <!-- Published -->
    <template v-else-if="dish.status === 'published'">
      <div class="space-y-5">
        <!-- Status + Unpublish -->
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 text-green-700 flex-1">
            <svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span class="text-sm font-semibold">Dish is live!</span>
          </div>
          <button
            :disabled="unpublishing"
            class="px-4 py-2 bg-white hover:bg-gray-50 disabled:opacity-50 text-gray-700 text-sm font-medium border border-gray-300 rounded-lg transition-colors"
            @click="handleUnpublish"
          >
            {{ unpublishing ? 'Unpublishing…' : 'Unpublish' }}
          </button>
        </div>

        <!-- Public URL -->
        <div>
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Public URL</p>
          <div class="flex items-center gap-2">
            <a
              :href="publicUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="flex-1 text-sm text-blue-600 hover:underline truncate bg-blue-50 rounded-lg px-3 py-2"
            >{{ publicUrl }}</a>
            <button
              class="px-3 py-2 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
              @click="copyUrl"
            >
              {{ copied ? 'Copied!' : 'Copy' }}
            </button>
          </div>
        </div>

        <!-- QR Code -->
        <div v-if="qrCode">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">QR Code</p>
          <div class="flex items-start gap-4">
            <img
              :src="qrCode.imageUrl"
              alt="QR code"
              class="w-[200px] h-[200px] border border-gray-200 rounded-lg bg-white p-1"
            />
            <div class="flex flex-col gap-2 pt-1">
              <button
                class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors"
                @click="downloadQr"
              >
                Download QR
              </button>
            </div>
          </div>
        </div>
        <div v-else class="text-sm text-gray-400">QR code loading…</div>
      </div>
    </template>

    <p v-if="actionError" class="mt-3 text-red-600 text-sm">{{ actionError }}</p>
  </div>
</template>

<script setup lang="ts">
interface DishForPublish {
  id: string
  publicDishId: string
  name: string
  status: string
  posterUrl: string | null
  previewModelGlbUrl: string | null
}

interface QrCode {
  id: string
  dishId: string
  publicUrl: string
  imageUrl: string
  createdAt: string
}

const props = defineProps<{
  dish: DishForPublish
  qrCode: QrCode | null
}>()

const emit = defineEmits<{
  published: []
  unpublished: []
}>()

// Use the QR code's stored publicUrl when available, otherwise construct from window.location
const publicUrl = computed(() => {
  if (props.qrCode?.publicUrl) return props.qrCode.publicUrl
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/d/${props.dish.publicDishId}`
  }
  return `/d/${props.dish.publicDishId}`
})

const canPublish = computed(() =>
  props.dish.status === 'ready' &&
  !!props.dish.name &&
  !!props.dish.posterUrl &&
  !!props.dish.previewModelGlbUrl,
)

const publishing = ref(false)
const unpublishing = ref(false)
const actionError = ref('')
const copied = ref(false)

async function handlePublish() {
  publishing.value = true
  actionError.value = ''
  try {
    await $fetch(`/api/dishes/${props.dish.id}/publish`, { method: 'POST' })
    emit('published')
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    actionError.value = e?.data?.message ?? e?.message ?? 'Failed to publish dish.'
  } finally {
    publishing.value = false
  }
}

async function handleUnpublish() {
  unpublishing.value = true
  actionError.value = ''
  try {
    await $fetch(`/api/dishes/${props.dish.id}/unpublish`, { method: 'POST' })
    emit('unpublished')
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    actionError.value = e?.data?.message ?? e?.message ?? 'Failed to unpublish dish.'
  } finally {
    unpublishing.value = false
  }
}

async function copyUrl() {
  try {
    await navigator.clipboard.writeText(publicUrl.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // fallback: do nothing
  }
}

function downloadQr() {
  if (!props.qrCode) return
  const a = document.createElement('a')
  a.href = props.qrCode.imageUrl
  a.download = `qr-${props.dish.publicDishId}.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
</script>
