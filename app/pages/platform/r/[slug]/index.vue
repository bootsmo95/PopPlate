<template>
  <div class="p-6 md:p-8">
    <div class="mb-6">
      <NuxtLink to="/platform/settings" class="text-sm text-gray-500 hover:text-gray-700">
        Back to restaurants
      </NuxtLink>
    </div>

    <div v-if="pending" class="text-sm text-gray-500">Loading restaurant...</div>
    <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      Failed to load restaurant.
    </div>

    <template v-else-if="restaurant">
      <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="border-b border-slate-200 bg-slate-950 px-5 py-6 text-white md:px-7">
          <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Restaurant workspace</p>
              <h1 class="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{{ restaurant.name }}</h1>
              <p class="mt-2 text-sm text-slate-300">/r/{{ restaurant.slug }}</p>
            </div>

            <div class="flex flex-col gap-2 sm:flex-row">
              <NuxtLink
                :to="publicMenuPath"
                class="inline-flex items-center justify-center rounded-lg bg-orange-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-orange-300"
              >
                Open public menu
              </NuxtLink>
              <NuxtLink
                :to="'/platform/r/' + restaurant.slug + '/dishes'"
                class="inline-flex items-center justify-center rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Manage dishes
              </NuxtLink>
            </div>
          </div>
        </div>

        <div class="grid gap-4 p-5 md:grid-cols-3 md:p-7">
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Total dishes</p>
            <p class="mt-2 text-3xl font-bold text-slate-950">{{ restaurant.dishCount }}</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Published</p>
            <p class="mt-2 text-3xl font-bold text-slate-950">{{ restaurant.publishedDishCount }}</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</p>
            <p class="mt-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-800">
              {{ restaurant.status }}
            </p>
          </div>
        </div>
      </section>

      <section class="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Latest dishes</p>
            <h2 class="mt-1 text-xl font-bold text-slate-950">Restaurant menu work</h2>
          </div>
          <NuxtLink
            :to="{ path: '/platform/dishes/new', query: { restaurantId: restaurant.id } }"
            class="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Add dish
          </NuxtLink>
        </div>

        <div v-if="!restaurant.latestDishes.length" class="mt-5 rounded-xl border border-dashed border-slate-300 p-8 text-center">
          <p class="font-medium text-slate-800">No dishes in this restaurant yet</p>
          <p class="mt-1 text-sm text-slate-500">Create the first dish and it will appear here.</p>
        </div>

        <div v-else class="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <NuxtLink
            v-for="dish in restaurant.latestDishes"
            :key="dish.id"
            :to="'/platform/dishes/' + dish.id"
            class="rounded-xl border border-slate-200 p-4 transition hover:border-slate-300 hover:shadow-sm"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <h3 class="font-semibold text-slate-950">{{ dish.name }}</h3>
                <p class="mt-1 text-sm text-slate-500">{{ dish.priceText || 'No price' }}</p>
              </div>
              <AdminStatusBadge :status="dish.status" />
            </div>
            <p class="mt-3 line-clamp-2 text-sm text-slate-600">
              {{ dish.shortDescription || 'No description yet.' }}
            </p>
          </NuxtLink>
        </div>

        <div class="mt-5 flex flex-col gap-2 sm:flex-row">
          <NuxtLink
            :to="'/platform/r/' + restaurant.slug + '/dishes'"
            class="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            View all restaurant dishes
          </NuxtLink>
          <NuxtLink
            :to="publicMenuPath"
            class="inline-flex items-center justify-center rounded-lg border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-700 transition hover:bg-orange-50"
          >
            View guest menu
          </NuxtLink>
        </div>
     </section>

      <section v-if="isAdmin" class="mt-6 rounded-2xl border border-red-200 bg-white p-5 shadow-sm md:p-7">
        <p class="text-xs font-semibold uppercase tracking-wide text-red-500">Danger zone</p>
        <div class="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-lg font-bold text-slate-950">Delete restaurant</h2>
            <p class="mt-1 text-sm text-slate-500">Permanently removes this restaurant and its dishes, QR codes, analytics, jobs, and source image records.</p>
          </div>
          <button
            type="button"
            :disabled="deleting"
            class="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            @click="handleDeleteRestaurant"
          >
            {{ deleting ? 'Deleting...' : 'Delete restaurant' }}
          </button>
        </div>
        <p v-if="deleteError" class="mt-3 text-sm text-red-600">{{ deleteError }}</p>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { DishStatus } from '~/types'

definePageMeta({ layout: 'platform' })

interface RestaurantDish {
  id: string
  name: string
  shortDescription: string | null
  priceText: string | null
  status: DishStatus
}

interface RestaurantDetail {
  id: string
  name: string
  slug: string
  status: string
  dishCount: number
  publishedDishCount: number
  latestDishes: RestaurantDish[]
}

const route = useRoute()
const slug = computed(() => String(route.params.slug))
const ssrHeaders = useAuthHeaders()
const { user } = useAuth()
const isAdmin = computed(() => user.value?.role === 'admin')
const deleting = ref(false)
const deleteError = ref('')

const { data: restaurant, pending, error } = await useFetch<RestaurantDetail>(
  () => '/api/restaurants/' + slug.value,
  { headers: ssrHeaders },
)

const publicMenuPath = computed(() => restaurant.value ? '/r/' + restaurant.value.slug : '/platform/settings')

async function handleDeleteRestaurant() {
  if (!restaurant.value) return
  if (!confirm('Permanently delete this restaurant? This also deletes its dishes, QR codes, analytics, jobs, and source image records.')) return

  deleting.value = true
  deleteError.value = ''

  try {
    await $fetch('/api/restaurants/' + restaurant.value.slug, {
      method: 'DELETE',
      query: { hard: 'true' },
    })
    await navigateTo('/platform/settings')
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    deleteError.value = e?.data?.message ?? e?.message ?? 'Failed to delete restaurant.'
  } finally {
    deleting.value = false
  }
}
</script>
