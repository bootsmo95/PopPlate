<script setup lang="ts">
import Icon from '~/components/shared/Icon.vue'

defineProps<{
  number: string         // "01"
  label: string          // "Ny ret"
  title: string          // "Opret en ret"
  /** Substring of `title` to italicise (e.g. "ret") */
  italic?: string
  body: string
  ctaLabel: string       // "Start"
  to?: string
  href?: string
  /** Dark hero variant (used for the primary action) */
  dark?: boolean
}>()
</script>

<template>
  <component
    :is="to ? resolveComponent('NuxtLink') : 'a'"
    :to="to"
    :href="href || (to ? undefined : '#')"
    class="p-card p-5 block transition no-underline"
    :class="dark ? 'dark-card text-ink-inv' : 'bg-card'"
  >
    <div v-if="dark" class="absolute inset-0 pointer-events-none" style="background: radial-gradient(circle at 80% 60%, rgba(184, 122, 78, 0.4), transparent 55%);" />
    <div class="relative">
      <div
        class="mono-label mb-9 font-medium"
        :class="dark ? '!text-clay-soft' : '!text-clay-deep'"
      >
        {{ number }} — {{ label }}
      </div>
      <h4
        class="font-display font-normal text-[22px] tracking-[-0.015em] mb-1.5"
        :class="dark && 'text-ink-inv'"
      >
        <template v-if="italic && title.includes(italic)">
          {{ title.split(italic)[0] }}<span class="italic" :class="dark ? 'text-clay-soft' : 'text-clay-deep'">{{ italic }}</span>{{ title.split(italic)[1] || '' }}
        </template>
        <template v-else>{{ title }}</template>
      </h4>
      <p class="text-[13px] leading-[1.5] mb-5" :class="dark ? 'text-[rgba(243,237,226,0.65)]' : 'text-ink-mute'">{{ body }}</p>
      <span
        class="inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase"
        :class="dark ? 'text-clay-soft' : 'text-clay-deep'"
        style="letter-spacing: 0.15em;"
      >
        {{ ctaLabel }}
        <Icon name="arrow" :size="13" />
      </span>
    </div>
  </component>
</template>

<style scoped>
.dark-card {
  background: theme('colors.deep');
  position: relative;
  overflow: hidden;
}
</style>
