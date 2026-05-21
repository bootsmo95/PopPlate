<script setup lang="ts">
import Sidebar from '~/components/platform/Sidebar.vue'
import type { SidebarKey } from '~/types/popplate'

const { logout, accountTier, user } = useAuth()
const ssrHeaders = useAuthHeaders()

interface RestaurantNavItem {
  slug: string
  name?: string
}

const { data: navRestaurants } = await useFetch<RestaurantNavItem[]>('/api/restaurants', {
  headers: ssrHeaders,
})

const publicMenuPath = computed(() => {
  const firstRestaurant = navRestaurants.value?.[0]
  return firstRestaurant ? `/r/${firstRestaurant.slug}` : '/platform/settings'
})

const restaurantPath = computed(() => {
  const firstRestaurant = navRestaurants.value?.[0]
  return firstRestaurant ? `/platform/r/${firstRestaurant.slug}` : '/platform/restaurants'
})

const restaurantName = computed(() => {
  return navRestaurants.value?.[0]?.name ?? 'Restaurant'
})

// Active sidebar key derived from route path
const route = useRoute()
const active = computed<SidebarKey>(() => {
  const p = route.path
  if (p.startsWith('/platform/dishes')) return 'dishes'
  if (p === '/platform/restaurants') return 'restaurants'
  if (p.startsWith('/platform/r')) return 'workspace'
  if (p.startsWith('/platform/settings')) return 'settings'
  if (p.startsWith('/platform/analytics')) return 'analytics'
  return 'home'
})

async function handleLogout() {
  await logout()
}
</script>

<template>
  <div class="platform-shell grid min-h-screen" style="grid-template-columns: 260px 1fr;">
    <Sidebar
      :active="active"
      :user-name="user?.displayName || user?.email || ''"
      :user-initials="(user?.displayName || user?.email)?.charAt(0)?.toUpperCase() ?? '?'"
      :user-email="user?.email ?? ''"
      :account-tier="accountTier"
      :restaurant-name="restaurantName"
      :restaurant-path="restaurantPath"
      :public-menu-path="publicMenuPath"
      @logout="handleLogout"
    />
    <main class="platform-main p-9 px-12 pb-20 max-w-platform w-full min-w-0
                 max-[1100px]:px-8 max-[720px]:p-[22px] max-[720px]:pb-16">
      <slot />
    </main>
  </div>
</template>

<style scoped>
@media (max-width: 900px) {
  .platform-shell { grid-template-columns: 1fr !important; }
}
</style>
