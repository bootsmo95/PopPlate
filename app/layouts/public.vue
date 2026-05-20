<script setup lang="ts">
import DockNav from '~/components/shared/DockNav.vue'

// Active key based on current route — used to highlight the right nav-link.
const route = useRoute()
const activeKey = computed<'home' | 'menu' | 'pricing' | 'about' | null>(() => {
  const p = route.path
  if (p === '/') return 'home'
  if (p.startsWith('/pricing')) return 'pricing'
  if (p.startsWith('/about')) return 'about'
  return null
})
</script>

<template>
  <div>
    <DockNav :active-key="activeKey" />
    <slot />
  </div>
</template>
