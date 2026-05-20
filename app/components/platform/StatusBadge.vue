<script setup lang="ts">
import type { DishStatus } from '~/types/popplate'

const props = defineProps<{
  status: DishStatus
  progress?: number
}>()

const label = computed(() => {
  switch (props.status) {
    case 'draft': return 'Kladde'
    case 'processing': return props.progress != null ? `Genererer ${props.progress}%` : 'Genererer'
    case 'ready': return 'Klar'
    case 'published': return 'Publiceret'
    case 'failed': return 'Fejlet'
  }
})
</script>

<template>
  <span class="status-badge" :class="`status-badge--${status}`">{{ label }}</span>
</template>
