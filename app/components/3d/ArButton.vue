<template>
  <button
    slot="ar-button"
    class="flex items-center gap-2 px-5 py-3 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold text-sm rounded-full shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
    @click="emit('ar-clicked')"
  >
    <!-- AR cube icon -->
    <svg
      class="w-5 h-5 flex-shrink-0"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
      />
    </svg>
    View on your table
  </button>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'ar-clicked'): void
}>()
</script>
