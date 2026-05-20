<script setup lang="ts">
import type { DishStatus } from '~/types/popplate'

defineProps<{
  items: Array<{
    status: DishStatus
    /** Plain text or HTML-safe — interpolated as-is via {{ }} */
    title: string
    detail: string
    time: string
  }>
}>()
</script>

<template>
  <div class="flex flex-col">
    <div
      v-for="(item, i) in items"
      :key="i"
      class="flex gap-3.5 py-3.5 items-center"
      :class="i < items.length - 1 && 'border-b border-line'"
    >
      <span class="w-2 h-2 rounded-full shrink-0" :class="`dot-${item.status}`" />
      <div class="flex-1 text-[13px] text-ink-soft min-w-0">
        <strong class="text-ink font-medium">{{ item.title }}</strong>
        · {{ item.detail }}
      </div>
      <span class="font-mono text-[11px] text-ink-faint whitespace-nowrap">{{ item.time }}</span>
    </div>
  </div>
</template>

<style scoped>
.dot-draft { background: theme('colors.status.draft'); }
.dot-ready { background: theme('colors.status.ready'); }
.dot-processing { background: theme('colors.status.processing'); }
.dot-published { background: theme('colors.status.published'); }
.dot-failed { background: theme('colors.status.failed'); }
</style>
