<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-2">Welcome to PopPlate Admin</h1>
    <p class="text-gray-600 mb-6">Manage your dishes and restaurant setup from the sidebar.</p>

    <div class="flex flex-wrap gap-3">
      <NuxtLink
        to="/admin/dishes"
        class="inline-flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7" />
          <path stroke-linecap="round" d="M11 7v4l2.5 2.5" />
          <path stroke-linecap="round" d="M20 20l-2.5-2.5" />
        </svg>
        Go to Dishes
      </NuxtLink>

      <NuxtLink
        to="/admin/settings"
        class="inline-flex items-center gap-2 px-5 py-3 border border-slate-300 hover:border-slate-400 text-slate-800 text-sm font-semibold rounded-lg transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12M6 12h12" />
        </svg>
        Set up Restaurant
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
</script>
