<script setup lang="ts">
import type { MenuSection } from '~/types/popplate'

defineProps<{
  sections: MenuSection[]
  modelValue: number
}>()
const emit = defineEmits<{ 'update:modelValue': [number] }>()

function go(i: number) {
  emit('update:modelValue', i)
  if (!import.meta.client) return
  const el = document.getElementById(`cat-${i}`)
  if (el) window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' })
}
</script>

<template>
  <div
    class="sticky z-50 flex justify-center my-15 mb-20 max-[720px]:my-9 max-[720px]:mb-12 max-[720px]:justify-start"
    style="top: 24px;"
  >
    <div
      class="inline-flex gap-1 p-1.5 border border-line rounded-full shadow-card max-w-full overflow-x-auto"
      style="background: rgba(243, 237, 226, 0.85); backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%); scrollbar-width: none;"
    >
      <button
        v-for="(s, i) in sections" :key="s.cat"
        type="button"
        class="cat-pill"
        :class="modelValue === i && 'cat-pill--active'"
        @click="go(i)"
      >
        {{ s.cat }} <span class="count">{{ s.dishes.length }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.cat-pill {
  @apply font-body text-sm font-medium text-ink-soft px-5 py-2.5 rounded-full whitespace-nowrap transition-colors cursor-pointer;
}
.cat-pill:hover {
  background: rgba(26, 20, 16, 0.06);
  color: theme('colors.ink.DEFAULT');
}
.cat-pill--active {
  background: theme('colors.ink.DEFAULT');
  color: theme('colors.ink.inv');
}
.cat-pill .count {
  @apply font-mono text-[11px] opacity-60 ml-1.5;
}
</style>
