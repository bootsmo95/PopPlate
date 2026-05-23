<template>
  <div class="rounded-xl border border-gray-200 p-5 bg-white">

    <!-- Not ready to publish -->
    <template v-if="!canPublish && dish.status !== 'published'">
      <div class="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 space-y-1.5">
        <p class="text-sm font-semibold text-gray-700">Kan ikke publiceres endnu</p>
        <ul class="list-disc list-inside space-y-1">
          <li v-if="dish.status !== 'ready'" class="text-sm text-gray-500">
            Retten skal have status "klar" (nu: {{ statusLabel(dish.status) }})
          </li>
          <li v-if="!dish.name" class="text-sm text-gray-500">Retten skal have et navn</li>
          <li v-if="!dish.posterUrl" class="text-sm text-gray-500">Retten skal have et posterbillede (færdiggør generering først)</li>
          <li v-if="!dish.previewModelGlbUrl" class="text-sm text-gray-500">Retten skal have en 3D-model (færdiggør generering først)</li>
        </ul>
      </div>
    </template>

    <!-- Ready but not published -->
    <template v-else-if="dish.status === 'ready'">
      <div class="flex items-center gap-3">
        <p class="text-sm text-gray-600 flex-1">Retten er klar til at blive publiceret og delt med gæster.</p>
        <button
          :disabled="publishing"
          class="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-green-300 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
          @click="handlePublish"
        >
          {{ publishing ? 'Publicerer…' : 'Publicer ret' }}
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
            <span class="text-sm font-semibold">Retten er live!</span>
          </div>
          <button
            :disabled="unpublishing"
            class="px-4 py-2 bg-white hover:bg-gray-50 disabled:opacity-50 text-gray-700 text-sm font-medium border border-gray-300 rounded-lg transition-colors"
            @click="handleUnpublish"
          >
            {{ unpublishing ? 'Fjerner…' : 'Fjern publicering' }}
          </button>
        </div>

        <!-- Public URL -->
        <div>
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Offentlig URL</p>
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
              {{ copied ? 'Kopieret!' : 'Kopiér' }}
            </button>
          </div>
        </div>

        <!-- QR Code -->
        <div v-if="qrCode">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">QR-kode</p>
          <div class="flex items-start gap-4">
            <img
              :src="qrImageUrl"
              alt="QR-kode"
              class="w-[200px] h-[200px] border border-gray-200 rounded-lg bg-white p-1"
            />
            <div class="flex flex-col gap-2 pt-1">
              <button
                class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors"
                @click="downloadQr"
              >
                Hent QR
              </button>
            </div>
          </div>
        </div>
        <div v-else class="text-sm text-gray-400">QR-kode indlæses…</div>
      </div>
    </template>

    <p v-if="actionError" class="mt-3 text-red-600 text-sm">{{ actionError }}</p>
  </div>
</template>

<script setup lang="ts">
import QRCode from 'qrcode'

interface DishForPublish {
  id: string
  publicDishId: string
  name: string
  status: string
  posterUrl: string | null
  previewModelGlbUrl: string | null
  scaleCm: number | null
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

const config = useRuntimeConfig()
const generatedQrImageUrl = ref<string | null>(null)

const publicUrl = computed(() => {
  const clientUrl = getCanonicalClientUrl()
  const storedUrl = normalizeDishUrl(props.qrCode?.publicUrl)

  if (clientUrl) return clientUrl
  if (storedUrl && !isLegacyHost(storedUrl)) return storedUrl.href
  if (storedUrl) return `/d/${props.dish.publicDishId}`

  return `/d/${props.dish.publicDishId}`
})

const qrImageUrl = computed(() => generatedQrImageUrl.value ?? props.qrCode?.imageUrl)

watch(publicUrl, async (url) => {
  generatedQrImageUrl.value = await QRCode.toDataURL(url, {
    width: 512,
    margin: 2,
  })
}, { immediate: true })

function getCanonicalClientUrl(): string | null {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/d/${props.dish.publicDishId}`
  }

  const appUrl = normalizeOrigin(config.public.appUrl)
  if (!appUrl || isLegacyHost(appUrl)) return null
  return `${appUrl.origin}/d/${props.dish.publicDishId}`
}

function normalizeDishUrl(url?: string): URL | null {
  if (!url) return null
  try {
    return new URL(url)
  } catch {
    return null
  }
}

function normalizeOrigin(url?: unknown): URL | null {
  if (typeof url !== 'string' || !url) return null
  try {
    return new URL(url)
  } catch {
    return null
  }
}

function isLegacyHost(url: URL): boolean {
  return url.hostname === 'localhost'
    || url.hostname === '127.0.0.1'
    || url.hostname === 'api.popplate.dk'
    || url.hostname === 'app.popplate.dk'
    || url.hostname === 'www.popplate.dk'
    || url.hostname.endsWith('.sslip.io')
}

const canPublish = computed(() =>
  props.dish.status === 'ready' &&
  !!props.dish.name &&
  !!props.dish.posterUrl &&
  !!props.dish.previewModelGlbUrl,
)

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'kladde',
    processing: 'genererer',
    failed: 'fejlet',
    ready: 'klar',
    published: 'publiceret',
    archived: 'arkiveret',
  }
  return labels[status] ?? status
}

const publishing = ref(false)
const unpublishing = ref(false)
const actionError = ref('')
const copied = ref(false)

async function handlePublish() {
  const scale = props.dish.scaleCm
  if (scale === null || scale === 24) {
    const confirmed = confirm('Tallerken-størrelsen er sat til 24 cm — passer det til denne ret?')
    if (!confirmed) return
  }

  publishing.value = true
  actionError.value = ''
  try {
    await $fetch(`/api/dishes/${props.dish.id}/publish`, { method: 'POST' })
    emit('published')
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    actionError.value = e?.data?.message ?? e?.message ?? 'Kunne ikke publicere retten.'
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
    actionError.value = e?.data?.message ?? e?.message ?? 'Kunne ikke fjerne publiceringen.'
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
  const href = qrImageUrl.value
  if (!href) return
  const a = document.createElement('a')
  a.href = href
  a.download = `qr-${props.dish.publicDishId}.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
</script>
