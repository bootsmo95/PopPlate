<script setup lang="ts">
defineProps<{
  label: string
  /** Pre-formatted main value, e.g. "1.213" */
  value: string | number
  /** Pre-formatted sub-unit, e.g. "/30d", "/30" */
  sub?: string
  delta?: string
  deltaDirection?: 'up' | 'down' | 'neutral'
  /** Optional caption replacing the delta */
  caption?: string
}>()
</script>

<template>
  <div class="p-card relative overflow-hidden max-[720px]:p-[18px]">
    <div class="mono-label mb-4 max-[720px]:mb-3">{{ label }}</div>
    <div class="font-body font-light text-[48px] leading-none tracking-[-0.04em] text-ink tabular-nums max-[720px]:text-[36px]">
      {{ value }}<span v-if="sub" class="text-[0.45em] text-ink-mute ml-1">{{ sub }}</span>
    </div>
    <div class="mt-3.5 text-xs text-ink-mute flex gap-1.5 items-center">
      <span v-if="delta" :class="{
        'text-[#4a6240]': deltaDirection === 'up',
        'text-[#8a4838]': deltaDirection === 'down',
      }">
        <template v-if="deltaDirection === 'up'">↑</template>
        <template v-else-if="deltaDirection === 'down'">↓</template>
        {{ delta }}
      </span>
      <span v-if="caption">{{ caption }}</span>
    </div>
  </div>
</template>
