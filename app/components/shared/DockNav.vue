<script setup lang="ts">
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

const drawerOpen = ref(false)

function toggleDrawer() {
  drawerOpen.value = !drawerOpen.value
}
function closeDrawer() {
  drawerOpen.value = false
}

onMounted(() => {
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') closeDrawer()
  }
  window.addEventListener('keydown', onKey)
  onUnmounted(() => window.removeEventListener('keydown', onKey))
})

watch(drawerOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})
</script>

<template>
  <!-- ═══ MOBILE: top bar + burger drawer (< 768px) ═══ -->
  <header class="dock-mobile">
    <NuxtLink to="/" class="dock-mobile-logo" aria-label="popplate">
      <LogoMark :size="20" />
      <span>popplate</span>
    </NuxtLink>

    <div class="flex items-center gap-2">
      <NuxtLink
        :to="ctaHref"
        class="dock-mobile-cta"
      >
        {{ ctaLabel }}
      </NuxtLink>
      <button class="dock-mobile-burger" :aria-expanded="drawerOpen" aria-label="Åbn menu" @click="toggleDrawer">
        <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
          <path d="M1 1h16M1 7h16M1 13h16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        </svg>
      </button>
    </div>
  </header>

  <!-- Scrim -->
  <Transition name="scrim">
    <div v-if="drawerOpen" class="dock-scrim" @click="closeDrawer" />
  </Transition>

  <!-- Drawer -->
  <Transition name="drawer">
    <aside v-if="drawerOpen" class="dock-drawer" aria-label="Navigation">
      <div class="flex items-center justify-between mb-10">
        <NuxtLink to="/" class="dock-mobile-logo" @click="closeDrawer">
          <LogoMark :size="20" />
          <span>popplate</span>
        </NuxtLink>
        <button class="dock-mobile-burger" aria-label="Luk menu" @click="closeDrawer">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <nav class="dock-drawer-nav">
        <NuxtLink to="/" :class="{ active: activeKey === 'home' }" @click="closeDrawer">Hjem</NuxtLink>
        <NuxtLink to="/pricing" :class="{ active: activeKey === 'pricing' }" @click="closeDrawer">Pris</NuxtLink>
        <a href="#about" :class="{ active: activeKey === 'about' }" @click="closeDrawer">Om</a>
      </nav>

      <div class="mt-auto flex flex-col gap-3">
        <NuxtLink v-if="showLogin" to="/platform/login" class="dock-drawer-login" @click="closeDrawer">
          Log ind
        </NuxtLink>
        <NuxtLink :to="ctaHref" class="dock-drawer-cta" @click="closeDrawer">
          <span>{{ ctaLabel }}</span>
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <path d="M1 7h12m0 0L8 2m5 5l-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </NuxtLink>
      </div>
    </aside>
  </Transition>

  <!-- ═══ DESKTOP: floating bottom pill (≥ 768px) ═══ -->
  <nav
    class="dock-desktop"
    aria-label="Hovedmenu"
  >
    <NuxtLink
      to="/"
      class="dock-logo-pill"
      aria-label="popplate"
    >
      <LogoMark :size="22" />
      <span>popplate</span>
    </NuxtLink>

    <div class="flex items-center gap-1">
      <NuxtLink to="/" class="nav-link" :class="{ 'nav-link--active': activeKey === 'home' }">Hjem</NuxtLink>
      <NuxtLink to="/pricing" class="nav-link" :class="{ 'nav-link--active': activeKey === 'pricing' }">Pris</NuxtLink>
      <a href="#about" class="nav-link" :class="{ 'nav-link--active': activeKey === 'about' }">Om</a>
    </div>

    <span class="w-px h-[22px] mx-1.5" style="background: rgba(26, 20, 16, 0.12);" />

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
/* ── Mobile bottom bar ── */
.dock-mobile {
  @apply fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex items-center justify-between gap-3 px-3 py-2 rounded-full border border-line max-w-[calc(100vw-32px)];
  background: rgba(243, 237, 226, 0.72);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  box-shadow: 0 4px 24px rgba(26, 20, 16, 0.1);
}
@media (min-width: 768px) {
  .dock-mobile { display: none; }
}

.dock-mobile-logo {
  @apply inline-flex items-center gap-2 font-display italic font-medium text-[18px] tracking-tight text-ink;
}

.dock-mobile-cta {
  @apply font-body text-[13px] font-medium px-4 py-2 rounded-full bg-clay text-white whitespace-nowrap transition;
}
.dock-mobile-cta:hover { @apply bg-clay-deep; }

.dock-mobile-burger {
  @apply w-10 h-10 grid place-items-center rounded-full text-ink transition;
}
.dock-mobile-burger:hover { background: rgba(26, 20, 16, 0.06); }

/* ── Scrim ── */
.dock-scrim {
  @apply fixed inset-0 z-[200];
  background: rgba(26, 20, 16, 0.4);
}
@media (min-width: 768px) {
  .dock-scrim { display: none; }
}

/* ── Drawer ── */
.dock-drawer {
  @apply fixed top-0 right-0 bottom-0 z-[201] flex flex-col px-7 py-5;
  width: min(320px, 85vw);
  background: theme('colors.paper');
  box-shadow: -20px 0 60px rgba(26, 20, 16, 0.15);
}
@media (min-width: 768px) {
  .dock-drawer { display: none; }
}

.dock-drawer-nav {
  @apply flex flex-col gap-1;
}
.dock-drawer-nav a {
  @apply font-display text-[22px] font-normal text-ink-soft px-3 py-3 rounded-lg transition-colors;
  letter-spacing: -0.01em;
}
.dock-drawer-nav a:hover,
.dock-drawer-nav a.active {
  @apply text-ink;
  background: rgba(184, 122, 78, 0.08);
}

.dock-drawer-login {
  @apply font-body text-[15px] font-medium text-ink text-center py-3 rounded-full border border-line-strong transition;
}
.dock-drawer-login:hover { background: rgba(26, 20, 16, 0.04); }

.dock-drawer-cta {
  @apply font-body text-[15px] font-medium text-white text-center py-3 rounded-full bg-clay inline-flex items-center justify-center gap-2 transition;
}
.dock-drawer-cta:hover { @apply bg-clay-deep; }

/* ── Transitions ── */
.scrim-enter-active, .scrim-leave-active { transition: opacity 250ms ease; }
.scrim-enter-from, .scrim-leave-to { opacity: 0; }

.drawer-enter-active { transition: transform 300ms cubic-bezier(0.2, 0.9, 0.3, 1); }
.drawer-leave-active { transition: transform 200ms ease-in; }
.drawer-enter-from, .drawer-leave-to { transform: translateX(100%); }

/* ── Desktop floating pill ── */
.dock-desktop {
  @apply hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] items-center gap-2 p-2
         rounded-full border border-line shadow-card max-w-[calc(100vw-32px)];
  background: rgba(243, 237, 226, 0.72);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
}
@media (min-width: 768px) {
  .dock-desktop { display: flex; }
}

.dock-logo-pill {
  @apply inline-flex items-center gap-2.5 px-[18px] py-2.5 pl-3.5 rounded-full bg-ink text-ink-inv font-display italic font-medium text-[18px] tracking-tight whitespace-nowrap shrink-0;
}

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
