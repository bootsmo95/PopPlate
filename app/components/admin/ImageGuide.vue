<template>
  <div class="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
    <button
      class="flex items-center gap-2 w-full text-left"
      @click="isOpen = !isOpen"
    >
      <svg class="h-4 w-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span class="text-sm font-medium text-blue-800">Tips for best 3D results</span>
      <svg
        class="h-4 w-4 text-blue-400 ml-auto transition-transform"
        :class="{ 'rotate-180': isOpen }"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div v-if="isOpen" class="mt-3 space-y-3 text-sm text-blue-900/80">
      <div>
        <p class="font-medium mb-1">Recommended angles (2–4 photos):</p>
        <div class="grid grid-cols-2 gap-2">
          <div class="flex items-start gap-2">
            <span class="text-blue-500 font-bold text-xs mt-0.5">1</span>
            <span><strong>Front/top-down</strong> — directly above or slightly angled, showing the full dish</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-blue-500 font-bold text-xs mt-0.5">2</span>
            <span><strong>Side angle (45°)</strong> — eye-level or slightly above, showing depth and height</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-blue-500 font-bold text-xs mt-0.5">3</span>
            <span><strong>Opposite side</strong> — the other angle to capture details not visible from the front</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-blue-500 font-bold text-xs mt-0.5">4</span>
            <span><strong>Close-up detail</strong> — a closer shot highlighting texture and toppings</span>
          </div>
        </div>
      </div>

      <div>
        <p class="font-medium mb-1">Do:</p>
        <ul class="list-disc list-inside space-y-0.5 text-blue-900/70">
          <li>Use even, natural lighting (avoid flash)</li>
          <li>Place dish on a plain, uncluttered surface</li>
          <li>Keep the dish centered and fully in frame</li>
          <li>Use sharp focus — no blurry shots</li>
        </ul>
      </div>

      <div>
        <p class="font-medium mb-1">Avoid:</p>
        <ul class="list-disc list-inside space-y-0.5 text-blue-900/70">
          <li>Hands, utensils, or other objects in the shot</li>
          <li>Busy backgrounds or heavy shadows</li>
          <li>Filters or heavy post-processing</li>
          <li>Very low resolution images</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const isOpen = ref(false)
</script>
