<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Dishes</h1>
      <NuxtLink
        to="/platform/dishes/new"
        class="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Create New Dish
      </NuxtLink>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="text-gray-500 text-sm">Loading dishes…</div>

    <!-- Error -->
    <div v-else-if="error" class="text-red-600 text-sm">Failed to load dishes.</div>

    <!-- Empty state -->
    <div v-else-if="!dishes?.length" class="text-center py-16 text-gray-500">
      <p class="text-lg font-medium mb-2">No dishes yet</p>
      <p class="text-sm">Create your first dish to get started.</p>
    </div>

    <!-- Dish grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <NuxtLink
        v-for="dish in dishes"
        :key="dish.id"
        :to="`/platform/dishes/${dish.id}`"
        class="block bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-gray-300 transition-all"
      >
        <div class="flex items-start justify-between gap-3 mb-3">
          <h2 class="font-semibold text-gray-900 text-base leading-snug line-clamp-2">
            {{ dish.name }}
          </h2>
          <AdminStatusBadge :status="dish.status" />
        </div>
        <p class="text-xs text-gray-400">
          {{ formatDate(dish.createdAt) }}
        </p>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DishStatus } from '~/types'

definePageMeta({ layout: 'platform' })

interface DishItem {
  id: string
  name: string
  status: DishStatus
  createdAt: string
}

const ssrHeaders = useAuthHeaders()
const { data: dishes, pending, error } = await useFetch<DishItem[]>('/api/dishes', { headers: ssrHeaders })

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
</script>
