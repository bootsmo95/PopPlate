<template>
  <span :class="badgeClass" class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium whitespace-nowrap">
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import type { DishStatus } from '~/types'

const props = defineProps<{
  status: DishStatus | string
}>()

const statusMap: Record<string, { label: string; cls: string }> = {
  draft:      { label: 'Draft',      cls: 'bg-gray-100 text-gray-600' },
  processing: { label: 'Processing', cls: 'bg-yellow-100 text-yellow-700' },
  failed:     { label: 'Failed',     cls: 'bg-red-100 text-red-700' },
  ready:      { label: 'Ready',      cls: 'bg-blue-100 text-blue-700' },
  published:  { label: 'Published',  cls: 'bg-green-100 text-green-700' },
  archived:   { label: 'Archived',   cls: 'bg-gray-100 text-gray-500' },
}

const entry = computed(() => statusMap[props.status] ?? { label: props.status, cls: 'bg-gray-100 text-gray-600' })
const label = computed(() => entry.value.label)
const badgeClass = computed(() => entry.value.cls)
</script>
