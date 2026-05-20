<script setup lang="ts">
import type { Dish } from '~/types/popplate'

const props = defineProps<{
  dish: Dish
  index: number
}>()
defineEmits<{ open: [Dish] }>()

const parts = computed<[string, string, string]>(() => {
  const d = props.dish
  if (!d.italic) return [d.name, '', '']
  const i = d.name.indexOf(d.italic)
  if (i < 0) return [d.name, '', '']
  return [d.name.slice(0, i), d.italic, d.name.slice(i + d.italic.length)]
})
</script>

<template>
  <article
    class="r-dish cursor-pointer relative grid items-center gap-15 py-10
           border-b border-line transition-colors first:border-t hover:bg-[rgba(184,122,78,0.04)]
           max-[800px]:gap-6 max-[800px]:py-8 max-[800px]:grid-cols-1"
    :class="dish.signature && 'signature'"
    style="grid-template-columns: 1.4fr 1fr;"
    @click="$emit('open', dish)"
  >
    <!-- Text -->
    <div class="pr-2">
      <div class="font-mono text-[11px] uppercase font-medium text-clay-deep mb-3.5 flex items-center gap-3" style="letter-spacing: 0.22em;">
        <span class="w-5 h-px bg-clay-deep" />
        <span>{{ String(index + 1).padStart(2, '0') }} {{ dish.signature ? '· Signatur' : '' }}</span>
      </div>

      <div class="flex justify-between gap-6 items-baseline mb-4.5 pb-4.5 border-b border-dashed border-line">
        <h3
          class="font-display font-normal leading-[1.1] flex-1 text-[clamp(28px,2.6vw,38px)]"
          style="letter-spacing: -0.02em;"
        >
          <template v-if="dish.italic">
            {{ parts[0] }}<span class="italic text-clay-deep">{{ parts[1] }}</span>{{ parts[2] }}
          </template>
          <template v-else>{{ dish.name }}</template>
        </h3>
        <span class="font-body text-xl font-medium text-ink tabular-nums whitespace-nowrap">{{ dish.price }}</span>
      </div>

      <p class="text-[15px] text-ink-mute leading-[1.6] mb-5 max-w-[540px]">{{ dish.description }}</p>

      <div class="flex gap-8 mb-7 flex-wrap">
        <div class="flex-1 min-w-[140px]">
          <h5 class="mono-label !text-[10px] mb-2">Ingredienser</h5>
          <p class="font-display italic text-base text-ink-soft leading-[1.35]">{{ (dish.ingredients || []).join(' · ') }}</p>
        </div>
        <div class="flex-1 min-w-[140px]">
          <h5 class="mono-label !text-[10px] mb-2">Allergener</h5>
          <p class="font-display italic text-base text-ink-soft leading-[1.35]">{{ (dish.allergens || []).join(' · ') }}</p>
        </div>
      </div>

      <button
        type="button"
        class="inline-flex items-center gap-3 px-5.5 py-3.5 bg-ink text-ink-inv rounded-full font-body font-medium text-sm transition whitespace-nowrap hover:bg-clay-deep hover:-translate-y-px"
        @click.stop="$emit('open', dish)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M3 7l9-4 9 4M3 7v10l9 4m-9-14l9 4m0 0v10m0-10l9-4m0 0v10l-9 4"
            stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span>Se ret på bordet</span>
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
          <path d="M1 7h12m0 0L8 2m5 5l-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>

    <!-- 3D preview -->
    <div
      class="r-3d relative aspect-square overflow-hidden rounded grid place-items-center"
      style="background: linear-gradient(180deg, #1a1410 0%, #2b1f15 100%); box-shadow: 0 30px 60px rgba(26, 20, 16, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.04);"
    >
      <div class="absolute inset-0 z-[1]" style="background: radial-gradient(circle at 50% 60%, rgba(184, 122, 78, 0.35), transparent 60%);" />
      <div
        class="absolute inset-0 z-[1] pointer-events-none"
        style="background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 30px 30px;"
      />
      <div
        class="relative z-[2] w-[70%] aspect-square rounded-full overflow-hidden animate-rotate-slow"
        style="box-shadow: 0 30px 50px rgba(0,0,0,0.5), inset 0 4px 12px rgba(255,255,255,0.1), inset 0 -20px 30px rgba(0,0,0,0.4);"
      >
        <img :src="dish.img" :alt="dish.name" class="w-full h-full object-cover" style="filter: brightness(1.05) contrast(1.05);" loading="lazy">
      </div>
      <div
        class="absolute inset-0 z-[3] pointer-events-none animate-shine"
        style="background: linear-gradient(115deg, transparent 30%, rgba(255, 255, 255, 0.08) 45%, transparent 60%);"
      />

      <!-- Corners -->
      <span class="r-corner top-3.5 left-3.5" style="border-right: none; border-bottom: none;" />
      <span class="r-corner top-3.5 right-3.5" style="border-left: none; border-bottom: none;" />
      <span class="r-corner bottom-3.5 left-3.5" style="border-right: none; border-top: none;" />
      <span class="r-corner bottom-3.5 right-3.5" style="border-left: none; border-top: none;" />

      <!-- Top label -->
      <div
        class="absolute top-3.5 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase font-medium text-clay-soft flex items-center gap-2 z-[4]"
        style="letter-spacing: 0.22em;"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-clay animate-pulse-clay" />
        3D · interaktiv
      </div>

      <!-- Foot controls -->
      <div
        class="absolute bottom-3.5 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase font-medium flex gap-3.5 z-[4]"
        style="color: rgba(243, 237, 226, 0.45); letter-spacing: 0.18em;"
      >
        <span class="flex items-center gap-1.5">
          <span class="w-3.5 h-3.5 border grid place-items-center text-[8px]" style="border-color: rgba(243, 237, 226, 0.35);">↻</span>
          drej
        </span>
        <span class="flex items-center gap-1.5">
          <span class="w-3.5 h-3.5 border grid place-items-center text-[8px]" style="border-color: rgba(243, 237, 226, 0.35);">+</span>
          zoom
        </span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.r-corner {
  position: absolute;
  width: 14px; height: 14px;
  border: 1px solid rgba(212, 168, 128, 0.55);
  z-index: 4;
  pointer-events: none;
}
/* Pause rotation when hovering the 3D panel */
.r-3d:hover :deep(.animate-rotate-slow) { animation-play-state: paused; }
.signature .r-dish-num { color: theme('colors.clay.deep'); }
</style>
