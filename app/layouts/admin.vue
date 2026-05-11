<template>
  <div class="min-h-screen flex flex-col bg-white">
    <!-- Top bar -->
    <header class="flex items-center justify-between h-14 px-4 bg-slate-900 text-white flex-shrink-0">
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
        <span class="font-semibold text-base tracking-wide">PopPlate Admin</span>
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
        class="fixed inset-0 z-20 bg-black/50 lg:hidden"
        @click="sidebarOpen = false"
      />

      <!-- Sidebar -->
      <nav
        :class="[
          'fixed lg:static inset-y-0 left-0 z-30 w-56 bg-slate-800 text-slate-100 flex flex-col pt-14 lg:pt-0 transform transition-transform duration-200',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        ]"
      >
        <ul class="flex-1 py-4 space-y-1 px-2">
          <li>
            <NuxtLink
              to="/admin/dishes"
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
              to="/admin/settings"
              class="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors hover:bg-slate-700"
              active-class="bg-slate-700 text-white"
              @click="sidebarOpen = false"
            >
              <!-- Gear icon -->
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Restaurant Setup
            </NuxtLink>
          </li>
        </ul>
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

async function handleLogout() {
  await logout()
}
</script>
