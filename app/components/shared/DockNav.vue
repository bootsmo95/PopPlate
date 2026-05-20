<script setup lang="ts">
// Floating bottom dock nav — used on public pages (landing, pricing, etc.)
import LogoMark from './LogoMark.vue'

withDefaults(
  defineProps<{
    activeKey?: 'home' | 'menu' | 'pricing' | 'about' | null
    ctaLabel?: string
    ctaHref?: string
    showLogin?: boolean
  }>(),
  {
    activeKey: 'home',
    ctaLabel: 'Kom i gang',
    ctaHref: '/platform/signup',
    showLogin: true,
  },
)
</script>

<template>
  <nav
    class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 p-2
           rounded-full border border-line shadow-card max-w-[calc(100vw-32px)]"
    style="background: rgba(243, 237, 226, 0.72); backdrop-filter: blur(24px) saturate(180%); -webkit-backdrop-filter: blur(24px) saturate(180%);"
    aria-label="Hovedmenu"
  >
    <NuxtLink
      to="/"
      class="inline-flex items-center gap-2.5 px-[18px] py-2.5 pl-3.5 rounded-full bg-ink text-ink-inv font-display italic font-medium text-[18px] tracking-tight whitespace-nowrap shrink-0"
      aria-label="popplate"
    >
      <LogoMark :size="22" />
      <span>popplate</span>
    </NuxtLink>

    <div class="hidden md:flex items-center gap-1">
      <NuxtLink to="/" class="nav-link" :class="{ 'nav-link--active': activeKey === 'home' }">Hjem</NuxtLink>
      <NuxtLink to="/pricing" class="nav-link" :class="{ 'nav-link--active': activeKey === 'pricing' }">Pris</NuxtLink>
      <a href="#about" class="nav-link" :class="{ 'nav-link--active': activeKey === 'about' }">Om</a>
    </div>

    <span class="hidden md:block w-px h-[22px] mx-1.5" style="background: rgba(26, 20, 16, 0.12);" />

    <NuxtLink
      v-if="showLogin"
      to="/platform/login"
      class="font-body text-sm font-medium text-ink px-[18px] py-2.5 rounded-full bg-paper border border-line transition hover:bg-card-alt whitespace-nowrap"
    >
      Log ind
    </NuxtLink>
    <NuxtLink
      :to="ctaHref"
      class="font-body text-sm font-medium px-[18px] py-2.5 rounded-full bg-clay text-white inline-flex items-center gap-2 transition hover:-translate-y-px hover:bg-clay-deep whitespace-nowrap"
    >
      <span>{{ ctaLabel }}</span>
      <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
        <path d="M1 7h12m0 0L8 2m5 5l-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </NuxtLink>
  </nav>
</template>

<style scoped>
.nav-link {
  @apply font-body text-sm font-medium text-ink-soft px-[18px] py-2.5 rounded-full whitespace-nowrap transition-colors;
}
.nav-link:hover {
  background: rgba(26, 20, 16, 0.06);
  color: theme('colors.ink.DEFAULT');
}
.nav-link--active {
  background: theme('colors.paper');
  color: theme('colors.ink.DEFAULT');
  box-shadow: 0 4px 12px rgba(26, 20, 16, 0.08);
}
</style>
