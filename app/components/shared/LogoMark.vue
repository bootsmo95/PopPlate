<script setup lang="ts">
defineProps<{
  /** width/height in pixels */
  size?: number | string
}>()
</script>

<template>
  <span class="inline-block" :style="{ width: (size ?? 24) + 'px', height: (size ?? 24) + 'px' }">
    <svg viewBox="0 0 30 30" fill="none" class="w-full h-full">
      <ellipse cx="15" cy="18" rx="13" ry="4" fill="#b87a4e" opacity="0.35" />
      <ellipse cx="15" cy="15" rx="11" ry="3" fill="#8b4e2c" />
      <ellipse cx="15" cy="13" rx="9" ry="2.4" fill="#b87a4e" />
    </svg>
  </span>
</template>
