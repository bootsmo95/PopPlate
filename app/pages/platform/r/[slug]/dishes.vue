<template>
  <div class="p-6 md:p-8">
    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <NuxtLink :to="'/platform/r/' + slug" class="text-sm text-gray-500 hover:text-gray-700">
        Back to restaurant
      </NuxtLink>
      <NuxtLink
        v-if="data?.restaurant"
        :to="{ path: '/platform/dishes/new', query: { restaurantId: data.restaurant.id } }"
        class="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Add dish
      </NuxtLink>
    </div>

    <div v-if="pending" class="text-sm text-gray-500">Loading dishes...</div>
    <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      Failed to load restaurant dishes.
    </div>

    <template v-else-if="data">
      <div class="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Restaurant dishes</p>
        <div class="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 class="text-3xl font-bold text-slate-950">{{ data.restaurant.name }}</h1>
            <p class="mt-1 text-sm text-slate-500">Edit the dishes that belong to /r/{{ data.restaurant.slug }}.</p>
          </div>
          <NuxtLink
            :to="'/r/' + data.restaurant.slug"
            class="inline-flex items-center justify-center rounded-lg border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-700 transition hover:bg-orange-50"
          >
            Open menu
          </NuxtLink>
        </div>
      </div>

      <div v-if="!data.dishes.length" class="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <p class="text-lg font-semibold text-slate-900">No dishes here yet</p>
        <p class="mt-2 text-sm text-slate-500">Create a dish from this restaurant workspace to attach it correctly.</p>
      </div>

      <div v-else class="grid gap-4 lg:grid-cols-2">
        <article
          v-for="dish in data.dishes"
          :key="dish.id"
          class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div class="flex gap-4 p-4">
            <div class="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
              <img
                v-if="dish.posterUrl"
                :src="dish.posterUrl"
                :alt="dish.name"
                class="h-full w-full object-cover"
              >
              <div v-else class="flex h-full w-full items-center justify-center text-xs font-semibold uppercase tracking-wide text-slate-400">
                No image
              </div>
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <h2 class="truncate text-lg font-semibold text-slate-950">{{ dish.name }}</h2>
                  <p class="mt-1 text-sm text-slate-500">{{ dish.priceText || 'No price' }}</p>
                </div>
                <AdminStatusBadge :status="dish.status" />
              </div>

              <p class="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                {{ dish.shortDescription || 'No description yet.' }}
              </p>
            </div>
          </div>

          <div class="flex flex-col gap-2 border-t border-slate-100 bg-slate-50 p-4 sm:flex-row sm:justify-end">
            <NuxtLink
              v-if="dish.publicDishId"
              :to="'/d/' + dish.publicDishId"
              class="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
            >
              Public dish
            </NuxtLink>
            <NuxtLink
              :to="'/platform/dishes/' + dish.id"
              class="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Edit dish
            </NuxtLink>
          </div>
        </article>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { DishStatus } from '~/types'

definePageMeta({ layout: 'platform' })

interface Restaurant {
  id: string
  name: string
  slug: string
  status: string
}

interface DishItem {
  id: string
  publicDishId: string
  name: string
  shortDescription: string | null
  priceText: string | null
  status: DishStatus
  posterUrl: string | null
}

interface RestaurantDishesResponse {
  restaurant: Restaurant
  dishes: DishItem[]
}

const route = useRoute()
const slug = computed(() => String(route.params.slug))
const ssrHeaders = useAuthHeaders()

const { data, pending, error } = await useFetch<RestaurantDishesResponse>(
  () => '/api/restaurants/' + slug.value + '/dishes',
  { headers: ssrHeaders },
)
</script>
