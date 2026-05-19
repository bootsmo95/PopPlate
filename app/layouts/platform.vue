<template>
  <div class="min-h-screen flex flex-col bg-white">
    <!-- Top bar -->
    <header class="relative z-40 flex h-14 flex-shrink-0 items-center justify-between bg-slate-900 px-4 text-white">
      <div class="flex items-center gap-3">
        <!-- Hamburger (mobile only) -->
        <button
          class="lg:hidden p-1.5 rounded hover:bg-slate-700 transition-colors"
          aria-label="Toggle navigation"
          @click="sidebarOpen = !sidebarOpen"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path v-if="!sidebarOpen" stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <span class="font-semibold text-base tracking-wide">PopPlate Platform</span>
      </div>
      <div class="flex items-center gap-3">
        <span
          class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
          :class="{
            'bg-gray-600 text-gray-300': accountTier === 'free',
            'bg-blue-600 text-blue-100': accountTier === 'basic',
            'bg-amber-500 text-amber-950': accountTier === 'pro',
          }"
        >
          {{ accountTier }}
        </span>
        <button
          class="text-sm px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 transition-colors"
          @click="handleLogout"
        >
          Logout
        </button>
      </div>
    </header>

    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar overlay (mobile) -->
      <div
        v-if="sidebarOpen"
        class="fixed inset-x-0 bottom-0 top-14 z-20 bg-black/50 lg:hidden"
        @click="sidebarOpen = false"
      />

      <!-- Sidebar -->
      <nav
        :class="[
          'fixed bottom-0 left-0 top-14 z-30 flex w-56 transform flex-col bg-slate-800 text-slate-100 transition-transform duration-200 lg:static lg:top-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        ]"
      >
        <ul class="flex-1 py-4 space-y-1 px-2">
          <li>
            <NuxtLink
              to="/platform"
              class="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors hover:bg-slate-700"
              active-class="bg-slate-700 text-white"
              @click="sidebarOpen = false"
            >
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 5.5A1.5 1.5 0 015.5 4h4A1.5 1.5 0 0111 5.5v4A1.5 1.5 0 019.5 11h-4A1.5 1.5 0 014 9.5v-4zM13 5.5A1.5 1.5 0 0114.5 4h4A1.5 1.5 0 0120 5.5v4a1.5 1.5 0 01-1.5 1.5h-4A1.5 1.5 0 0113 9.5v-4zM4 14.5A1.5 1.5 0 015.5 13h4a1.5 1.5 0 011.5 1.5v4A1.5 1.5 0 019.5 20h-4A1.5 1.5 0 014 18.5v-4zM13 14.5a1.5 1.5 0 011.5-1.5h4a1.5 1.5 0 011.5 1.5v4a1.5 1.5 0 01-1.5 1.5h-4a1.5 1.5 0 01-1.5-1.5v-4z" />
              </svg>
              Overview
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/platform/dishes"
              class="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors hover:bg-slate-700"
              active-class="bg-slate-700 text-white"
              @click="sidebarOpen = false"
            >
              <!-- Plate/utensils icon -->
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" />
                <path stroke-linecap="round" d="M11 7v4l2.5 2.5" />
                <path stroke-linecap="round" d="M20 20l-2.5-2.5" />
              </svg>
              Dishes
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/platform/settings"
              class="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors hover:bg-slate-700"
              active-class="bg-slate-700 text-white"
              @click="sidebarOpen = false"
            >
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 9.5L12 4l9 5.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 21v-6h6v6" />
              </svg>
              Restaurants
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              :to="publicMenuPath"
              class="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors hover:bg-slate-700"
              active-class="bg-slate-700 text-white"
              @click="sidebarOpen = false"
            >
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 5.5A1.5 1.5 0 016.5 4h11A1.5 1.5 0 0119 5.5v13a.75.75 0 01-1.14.64L12 15.62l-5.86 3.52A.75.75 0 015 18.5v-13z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.5 8h7M8.5 11h5" />
              </svg>
              Menu
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/platform/dishes/new"
              class="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors hover:bg-slate-700"
              active-class="bg-slate-700 text-white"
              @click="sidebarOpen = false"
            >
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M5 12h14" />
              </svg>
              New dish
            </NuxtLink>
          </li>
        </ul>
        <div class="border-t border-slate-700 p-2">
          <NuxtLink
            to="/pricing"
            class="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
            @click="sidebarOpen = false"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M4 12h16M4 17h10" />
            </svg>
            Plans
          </NuxtLink>
          <NuxtLink
            to="/"
            class="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
            @click="sidebarOpen = false"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 10.5L12 4l9 6.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9.5z" />
            </svg>
            Public site
          </NuxtLink>
        </div>
      </nav>

      <!-- Main content -->
      <main class="flex-1 overflow-auto bg-gray-50 min-w-0">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const sidebarOpen = ref(false)
const { logout, accountTier } = useAuth()
const ssrHeaders = useAuthHeaders()

interface RestaurantNavItem {
  slug: string
}

const { data: navRestaurants } = await useFetch<RestaurantNavItem[]>('/api/restaurants', {
  headers: ssrHeaders,
})

const publicMenuPath = computed(() => {
  const firstRestaurant = navRestaurants.value?.[0]
  return firstRestaurant ? `/r/${firstRestaurant.slug}` : '/platform/settings'
})

async function handleLogout() {
  await logout()
}
</script>
