<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import LogoMark from '~/components/shared/LogoMark.vue'
import Icon from '~/components/shared/Icon.vue'
import type { SidebarKey } from '~/types/popplate'

const props = withDefaults(
  defineProps<{
    active?: SidebarKey
    userName?: string
    userInitials?: string
    userEmail?: string
    accountTier?: string
    restaurantName?: string
    restaurantPath?: string
    dishCount?: number
    publicMenuPath?: string
  }>(),
  {
    active: 'home',
    userName: '',
    userInitials: '',
    userEmail: '',
    accountTier: 'free',
    restaurantName: 'Restaurant',
    restaurantPath: '/platform/settings#restaurants',
    dishCount: 0,
    publicMenuPath: '/platform/settings',
  },
)

const emit = defineEmits<{
  logout: []
}>()

const open = ref(false)
const close = () => (open.value = false)

watch(open, (v) => {
  if (!import.meta.client) return
  document.body.style.overflow = v ? 'hidden' : ''
})

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <!-- Mobile top bar -->
  <div
    class="platform-mobile-top sticky top-0 z-40 hidden items-center justify-between
           border-b border-line px-5 py-3"
    style="background: rgba(248, 243, 233, 0.92); backdrop-filter: blur(14px) saturate(160%);
           -webkit-backdrop-filter: blur(14px) saturate(160%);"
  >
    <NuxtLink to="/" class="inline-flex items-center gap-3 font-display italic font-medium text-[19px] tracking-tight text-ink">
      <LogoMark :size="24" />
      <span>popplate</span>
    </NuxtLink>
    <button
      type="button"
      class="grid place-items-center w-10 h-10 rounded-md border border-line bg-paper text-ink transition hover:bg-card"
      :aria-expanded="open"
      aria-label="Open menu"
      @click="open = true"
    >
      <Icon name="menu" :size="18" />
    </button>
  </div>

  <!-- Scrim -->
  <div
    class="platform-scrim fixed inset-0 z-[49] hidden md:hidden transition-opacity duration-200"
    :class="open ? 'block opacity-100' : 'opacity-0 pointer-events-none'"
    style="background: rgba(26, 20, 16, 0.4); backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px);"
    aria-hidden="true"
    @click="close"
  />

  <aside
    class="platform-sidebar bg-paper border-r border-line p-7 px-[22px]
           flex flex-col sticky top-0 h-screen overflow-y-auto z-50"
    :class="open ? 'open' : ''"
    aria-label="Platform navigation"
  >
    <NuxtLink
      to="/"
      class="inline-flex items-center gap-3 font-display italic font-medium text-[22px] tracking-tight text-ink mb-8 px-2.5"
      @click="close"
    >
      <LogoMark :size="24" />
      <span>popplate</span>
    </NuxtLink>

    <div class="mono-label px-3 py-3 pt-3.5">Oversigt</div>
    <nav class="flex flex-col gap-0.5 mb-3.5">
      <NuxtLink
        to="/platform" class="nav-item" :class="active === 'home' && 'active'"
        :aria-current="active === 'home' ? 'page' : undefined" @click="close"
      >
        <Icon name="home" /> Dashboard
      </NuxtLink>
      <NuxtLink
        to="/platform/dishes" class="nav-item" :class="active === 'dishes' && 'active'"
        :aria-current="active === 'dishes' ? 'page' : undefined" @click="close"
      >
        <Icon name="dish" /> Retter
        <span v-if="dishCount" class="count">{{ dishCount }}</span>
      </NuxtLink>
      <NuxtLink
        :to="restaurantPath" class="nav-item" :class="active === 'workspace' && 'active'"
        :aria-current="active === 'workspace' ? 'page' : undefined" @click="close"
      >
        <Icon name="restaurant" /> {{ restaurantName }}
      </NuxtLink>
      <NuxtLink
        to="/platform/settings#restaurants" class="nav-item"
        @click="close"
      >
        <Icon name="restaurant" /> Restauranter
      </NuxtLink>
      <NuxtLink
        :to="publicMenuPath" class="nav-item"
        @click="close"
      >
        <Icon name="qr" /> Menu
      </NuxtLink>
    </nav>

    <div class="mono-label px-3 py-3 pt-3.5">Konto</div>
    <nav class="flex flex-col gap-0.5">
      <NuxtLink
        to="/platform/settings" class="nav-item" :class="active === 'settings' && 'active'"
        :aria-current="active === 'settings' ? 'page' : undefined" @click="close"
      >
        <Icon name="settings" /> Indstillinger
      </NuxtLink>
      <NuxtLink
        to="/pricing" class="nav-item" @click="close"
      >
        <Icon name="dish" /> Planer
      </NuxtLink>
    </nav>

    <div class="mt-auto pt-4 border-t border-line">
      <button
        type="button"
        class="flex w-full items-center gap-3 p-2.5 rounded-[10px] transition hover:bg-[rgba(26,20,16,0.05)]"
        @click="emit('logout')"
      >
        <span class="grid place-items-center w-9 h-9 rounded-full bg-clay text-white font-display italic text-base shrink-0">
          {{ userInitials || userName?.charAt(0) || '?' }}
        </span>
        <span class="flex-1 text-left min-w-0">
          <span class="block text-[13px] font-medium text-ink truncate">{{ userName || userEmail || 'User' }}</span>
          <span class="block text-[11px] text-ink-faint font-mono uppercase tracking-wider">{{ accountTier }}</span>
        </span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.platform-sidebar {
  width: 100%;
}
@media (max-width: 900px) {
  .platform-sidebar {
    position: fixed;
    top: 0; left: 0;
    height: 100vh;
    width: 280px;
    transform: translateX(-100%);
    transition: transform 280ms cubic-bezier(0.2, 0.9, 0.3, 1);
    box-shadow: 0 30px 60px rgba(26, 20, 16, 0.25);
  }
  .platform-sidebar.open { transform: translateX(0); }
  .platform-mobile-top { display: flex; }
  .platform-scrim:not([style*="pointer-events: none"]) { display: block; }
}

.nav-item {
  @apply flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm text-ink-soft transition-colors;
}
.nav-item:hover {
  background: rgba(26, 20, 16, 0.05);
  color: theme('colors.ink.DEFAULT');
}
.nav-item.active {
  background: theme('colors.ink.DEFAULT');
  color: theme('colors.ink.inv');
}
.nav-item :deep(svg) { opacity: 0.7; }
.nav-item.active :deep(svg) { opacity: 1; }
.nav-item .count {
  @apply ml-auto font-mono text-[11px] font-medium px-2 py-0.5 rounded-full;
  background: rgba(26, 20, 16, 0.08);
}
.nav-item.active .count {
  background: rgba(255, 255, 255, 0.15);
  color: theme('colors.ink.inv');
}
</style>
