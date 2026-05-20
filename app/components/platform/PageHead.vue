<script setup lang="ts">
// Lightweight header used on every platform page.
// Slot `actions` for buttons on the right.
defineProps<{
  eyebrow?: string
  backHref?: string
  backLabel?: string
}>()
</script>

<template>
  <div class="flex items-end justify-between gap-10 mb-9 pb-6 border-b border-line flex-wrap
              max-[720px]:gap-5 max-[720px]:mb-7 max-[720px]:pb-5 max-[720px]:items-start">
    <div class="min-w-0">
      <div v-if="backHref" class="eyebrow mb-2.5">
        <NuxtLink :to="backHref" class="text-clay-deep">← {{ backLabel || 'Tilbage' }}</NuxtLink>
      </div>
      <div v-else-if="eyebrow" class="eyebrow mb-2.5">{{ eyebrow }}</div>
      <slot name="title" />
      <slot name="sub" />
    </div>
    <div class="flex gap-2.5 items-center flex-wrap max-[720px]:w-full">
      <slot name="actions" />
    </div>
  </div>
</template>
