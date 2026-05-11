<template>
  <div>
    <!-- Count indicator -->
    <div class="flex items-center justify-between mb-3">
      <p class="text-sm text-gray-600">
        {{ totalCount }} / {{ MAX_IMAGES }} images
        <span v-if="totalCount < MIN_IMAGES" class="text-amber-600">
          (min {{ MIN_IMAGES }} required)
        </span>
      </p>
    </div>

    <!-- Drag-and-drop zone -->
    <div
      :class="[
        'border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer',
        isDragging ? 'border-slate-500 bg-slate-50' : 'border-gray-300 bg-gray-50 hover:border-slate-400 hover:bg-gray-100',
        isAtMax ? 'opacity-50 pointer-events-none' : '',
      ]"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="!isAtMax && fileInput?.click()"
    >
      <svg class="mx-auto mb-3 h-10 w-10 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
      <p class="text-sm font-medium text-gray-700">
        Drop images here or <span class="text-slate-600 underline">click to browse</span>
      </p>
      <p class="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — max 10 MB per file</p>
      <input
        ref="fileInput"
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        multiple
        class="hidden"
        @change="handleFileSelect"
      />
    </div>

    <!-- Validation error -->
    <p v-if="validationError" class="mt-2 text-sm text-red-600">{{ validationError }}</p>

    <!-- Thumbnails grid -->
    <div v-if="allImages.length > 0" class="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
      <!-- Existing uploaded images -->
      <div
        v-for="img in existingImages"
        :key="img.id"
        class="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200"
      >
        <img
          :src="img.imageUrl"
          :alt="`Source image`"
          class="w-full h-full object-cover"
        />
        <button
          type="button"
          class="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 focus:opacity-100"
          :disabled="deletingIds.has(img.id)"
          :title="deletingIds.has(img.id) ? 'Deleting…' : 'Remove image'"
          @click.stop="handleDelete(img)"
        >
          <svg v-if="!deletingIds.has(img.id)" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <!-- Queued / uploading files -->
      <div
        v-for="item in uploadQueue"
        :key="item.id"
        class="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200"
      >
        <img
          :src="item.previewUrl"
          :alt="item.file.name"
          class="w-full h-full object-cover"
        />
        <!-- Uploading overlay -->
        <div v-if="item.status === 'uploading'" class="absolute inset-0 bg-black/50 flex flex-col items-center justify-center p-2">
          <p class="text-white text-xs font-medium mb-1">{{ item.progress }}%</p>
          <div class="w-full bg-white/30 rounded-full h-1.5">
            <div
              class="bg-white rounded-full h-1.5 transition-all duration-200"
              :style="{ width: `${item.progress}%` }"
            />
          </div>
        </div>
        <!-- Error overlay -->
        <div v-else-if="item.status === 'error'" class="absolute inset-0 bg-red-900/60 flex items-center justify-center p-2">
          <p class="text-white text-xs text-center leading-tight">{{ item.error }}</p>
        </div>
        <!-- Queued overlay -->
        <div v-else-if="item.status === 'queued'" class="absolute inset-0 bg-black/30 flex items-center justify-center">
          <p class="text-white text-xs">Queued</p>
        </div>
        <!-- Remove button for queued/error items -->
        <button
          v-if="item.status !== 'uploading'"
          type="button"
          class="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 focus:opacity-100"
          title="Remove"
          @click.stop="removeFromQueue(item.id)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const MIN_IMAGES = 2
const MAX_IMAGES = 4
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

interface SourceImage {
  id: string
  dishId: string
  storageKey: string
  imageUrl: string
  sortOrder: number
  createdAt: string
}

interface QueueItem {
  id: string
  file: File
  previewUrl: string
  status: 'queued' | 'uploading' | 'done' | 'error'
  progress: number
  error?: string
}

const props = defineProps<{
  dishId: string
  restaurantId: string
  existingImages: SourceImage[]
}>()

const emit = defineEmits<{
  uploaded: [image: SourceImage]
  deleted: [imageId: string]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const validationError = ref('')
const uploadQueue = ref<QueueItem[]>([])
const deletingIds = ref<Set<string>>(new Set())

const totalCount = computed(() => props.existingImages.length + uploadQueue.value.filter(i => i.status === 'done').length)
const isAtMax = computed(() => totalCount.value >= MAX_IMAGES)
const allImages = computed(() => [...props.existingImages, ...uploadQueue.value])

function validateFile(file: File): string | null {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return `"${file.name}": unsupported format (use JPG, PNG, or WEBP)`
  }
  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
    return `"${file.name}": unsupported MIME type`
  }
  if (file.size > MAX_FILE_SIZE) {
    return `"${file.name}": exceeds 10 MB limit`
  }
  return null
}

function addFilesToQueue(files: FileList | File[]) {
  validationError.value = ''
  const fileArray = Array.from(files)
  const errors: string[] = []

  for (const file of fileArray) {
    const currentTotal = props.existingImages.length + uploadQueue.value.filter(i => i.status !== 'error').length
    if (currentTotal >= MAX_IMAGES) {
      errors.push(`Maximum ${MAX_IMAGES} images allowed — some files were skipped.`)
      break
    }

    const error = validateFile(file)
    if (error) {
      errors.push(error)
      continue
    }

    const item: QueueItem = {
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'queued',
      progress: 0,
    }
    uploadQueue.value.push(item)
  }

  if (errors.length > 0) {
    validationError.value = errors[0]
  }

  processQueue()
}

let isProcessing = false

async function processQueue() {
  if (isProcessing) return
  isProcessing = true

  try {
    while (true) {
      const next = uploadQueue.value.find(i => i.status === 'queued')
      if (!next) break

      next.status = 'uploading'
      next.progress = 0

      try {
        const formData = new FormData()
        formData.append('file', next.file)
        formData.append('dishId', props.dishId)
        formData.append('restaurantId', props.restaurantId)

        const progressInterval = setInterval(() => {
          if (next.progress < 85) {
            next.progress += 15
          }
        }, 200)

        try {
          const result = await $fetch<SourceImage>('/api/upload/image', {
            method: 'POST',
            body: formData,
          })

          next.progress = 100
          next.status = 'done'

          URL.revokeObjectURL(next.previewUrl)

          await nextTick()
          uploadQueue.value = uploadQueue.value.filter(i => i.id !== next.id)

          emit('uploaded', result)
        } catch (err: unknown) {
          const e = err as { data?: { message?: string }; message?: string }
          next.status = 'error'
          next.progress = 0
          next.error = e?.data?.message ?? e?.message ?? 'Upload failed'
        } finally {
          clearInterval(progressInterval)
        }
    }
  } finally {
    isProcessing = false
  }
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    addFilesToQueue(input.files)
  }
  // Reset input so same file can be re-added after error
  if (fileInput.value) fileInput.value.value = ''
}

function handleDrop(event: DragEvent) {
  isDragging.value = false
  if (isAtMax.value) return
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    addFilesToQueue(event.dataTransfer.files)
  }
}

function removeFromQueue(itemId: string) {
  const item = uploadQueue.value.find(i => i.id === itemId)
  if (item) {
    URL.revokeObjectURL(item.previewUrl)
    uploadQueue.value = uploadQueue.value.filter(i => i.id !== itemId)
  }
}

async function handleDelete(image: SourceImage) {
  if (deletingIds.value.has(image.id)) return

  deletingIds.value = new Set([...deletingIds.value, image.id])
  try {
    await $fetch(`/api/dishes/${image.dishId}/images/${image.id}`, {
      method: 'DELETE',
    })
    emit('deleted', image.id)
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    validationError.value = e?.data?.message ?? e?.message ?? 'Failed to delete image.'
  } finally {
    const next = new Set(deletingIds.value)
    next.delete(image.id)
    deletingIds.value = next
  }
}

onUnmounted(() => {
  uploadQueue.value.forEach(item => URL.revokeObjectURL(item.previewUrl))
})
</script>
