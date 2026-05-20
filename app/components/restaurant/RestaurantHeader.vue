<script setup lang="ts">
import type { Restaurant } from '~/types/popplate'

defineProps<{ restaurant: Restaurant }>()
</script>

<template>
  <header class="relative pt-10 pb-15 border-b border-line max-[720px]:pt-6 max-[720px]:pb-10">
    <div class="max-w-wrap mx-auto px-10 max-[720px]:px-5">
      <div class="eyebrow mb-6 flex items-center gap-3.5">
        <span class="block w-7 h-px bg-clay-deep" />
        {{ restaurant.tagline || 'Restaurant' }} · {{ restaurant.city || 'Odense' }}
      </div>
      <h1
        class="font-display italic font-normal text-ink mb-9 leading-[0.9]"
        style="font-size: clamp(72px, 11vw, 180px); letter-spacing: -0.04em;"
      >
        {{ restaurant.name }}
      </h1>
      <div class="grid grid-cols-4 gap-6 pt-8 border-t border-line max-[800px]:grid-cols-2 max-[800px]:gap-7">
        <div class="mono-label">
          Adresse
          <strong class="block mt-1.5 font-display italic text-base text-ink not-italic tracking-[-0.01em] normal-case font-normal">
            <span class="italic">{{ restaurant.address }}</span>
          </strong>
        </div>
        <div class="mono-label">
          Åbningstider
          <strong class="block mt-1.5 font-display italic text-base text-ink tracking-[-0.01em] normal-case font-normal">{{ restaurant.hours }}</strong>
        </div>
        <div class="mono-label">
          Reservation
          <strong class="block mt-1.5 font-display italic text-base text-ink tracking-[-0.01em] normal-case font-normal">{{ restaurant.phone }}</strong>
        </div>
        <div class="mono-label">
          Live menu
          <strong class="block mt-1.5 font-display italic text-base text-ink tracking-[-0.01em] normal-case font-normal">I AR via popplate</strong>
        </div>
      </div>
    </div>
  </header>
</template>
