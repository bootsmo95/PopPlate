<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import type { Dish } from '~/types/popplate'
import Icon from '~/components/shared/Icon.vue'

const props = defineProps<{ dish: Dish | null }>()
const emit  = defineEmits<{ close: [] }>()

const open = computed(() => !!props.dish)

watch(open, (v) => {
  if (!import.meta.client) return
  document.body.style.overflow = v ? 'hidden' : ''
  if (v) window.addEventListener('keydown', onKey)
  else window.removeEventListener('keydown', onKey)
})

function onKey(e: KeyboardEvent) { if (e.key === 'Escape') emit('close') }
onBeforeUnmount(() => {
  if (!import.meta.client) return
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKey)
})

function splitItalic(d: Dish): [string, string, string] {
  if (!d.italic) return [d.name, '', '']
  const i = d.name.indexOf(d.italic)
  if (i < 0) return [d.name, '', '']
  return [d.name.slice(0, i), d.italic, d.name.slice(i + d.italic.length)]
}
</script>

<template>
  <div
    class="fixed inset-0 z-[200] transition-opacity duration-300"
    :class="open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'"
    style="background: rgba(26, 20, 16, 0.4); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);"
    aria-hidden="true"
    @click="emit('close')"
  />
  <aside
    class="fixed top-0 right-0 bottom-0 z-[201] overflow-y-auto transition-transform duration-500 ease-[cubic-bezier(0.2,0.9,0.3,1)]"
    :class="open ? 'translate-x-0' : 'translate-x-full'"
    style="width: min(640px, 100vw); background: #f3ede2; box-shadow: -20px 0 60px rgba(26, 20, 16, 0.15);"
    :aria-hidden="!open"
  >
    <button
      type="button"
      class="absolute top-6 right-6 w-11 h-11 rounded-full bg-card text-ink grid place-items-center z-[5] transition hover:bg-card-alt"
      aria-label="Luk"
      @click="emit('close')"
    >
      <Icon name="close" />
    </button>

    <template v-if="dish">
      <!-- Image -->
      <div class="w-full aspect-square relative overflow-hidden" style="background: #2b1f15;">
        <img :src="dish.img" :alt="dish.name" class="w-full h-full object-cover">
        <div
          class="absolute top-6 left-6 flex items-center gap-2.5 px-4 py-2.5 rounded-full font-mono text-[11px] uppercase font-medium text-ink"
          style="background: rgba(243, 237, 226, 0.95); backdrop-filter: blur(10px); letter-spacing: 0.15em;"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-clay animate-pulse-clay" />
          3D model klar
        </div>
      </div>

      <!-- Body -->
      <div class="px-8 pt-10 pb-32 max-[600px]:px-5 max-[600px]:pt-8 max-[600px]:pb-36">
        <h2
          class="font-display font-normal leading-none mb-6"
          style="font-size: clamp(32px, 6vw, 42px); letter-spacing: -0.025em;"
        >
          <template v-if="dish.italic">
            {{ splitItalic(dish)[0] }}<span class="italic text-clay-deep">{{ splitItalic(dish)[1] }}</span>{{ splitItalic(dish)[2] }}
          </template>
          <template v-else>{{ dish.name }}</template>
        </h2>
        <div class="flex justify-between items-baseline border-t border-b border-line py-5 mb-8">
          <span class="mono-label">{{ dish.category || 'Hovedret' }}</span>
          <span class="font-body text-[28px] font-medium text-ink">{{ dish.price }}</span>
        </div>
        <p class="text-base leading-[1.6] text-ink-soft mb-8">{{ dish.description }}</p>

        <div class="mb-7" v-if="dish.ingredients?.length">
          <h5 class="mono-label mb-3">Ingredienser</h5>
          <div class="flex flex-wrap gap-2">
            <span v-for="i in dish.ingredients" :key="i" class="font-body text-[13px] px-3.5 py-1.5 bg-card rounded-full text-ink-soft">{{ i }}</span>
          </div>
        </div>
        <div class="mb-7" v-if="dish.allergens?.length">
          <h5 class="mono-label mb-3">Allergener</h5>
          <div class="flex flex-wrap gap-2">
            <span v-for="a in dish.allergens" :key="a" class="font-body text-[13px] px-3.5 py-1.5 bg-card rounded-full text-ink-soft">{{ a }}</span>
          </div>
        </div>
      </div>

      <!-- Fixed CTA -->
      <div
        class="fixed bottom-0 right-0 z-[3] flex gap-3 px-8 pt-5 pb-8 max-[600px]:px-5"
        style="width: min(640px, 100vw); background: linear-gradient(to bottom, rgba(243, 237, 226, 0), #f3ede2 30%);"
      >
        <NuxtLink
          :to="`/d/${dish.id}`"
          class="flex-1 inline-flex items-center justify-center gap-3.5 px-7 py-4.5 rounded-full bg-ink text-ink-inv font-medium text-[15px] transition hover:bg-clay-deep hover:-translate-y-px"
        >
          <span>Se i AR</span>
          <span class="w-7 h-7 rounded-full grid place-items-center" style="background: rgba(255,255,255,0.12);">
            <Icon name="arrow" :size="13" />
          </span>
        </NuxtLink>
        <a
          href="#share"
          aria-label="Del"
          class="inline-flex items-center px-6 py-4.5 rounded-full border border-line-strong text-ink transition hover:border-ink hover:bg-[rgba(26,20,16,0.04)]"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M3 8l5-5m0 0l5 5M8 3v10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </a>
      </div>
    </template>
  </aside>
</template>
