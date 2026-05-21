<script setup lang="ts">
import TopBar from '~/components/platform/TopBar.vue'
import PageHead from '~/components/platform/PageHead.vue'
import StatCard from '~/components/platform/StatCard.vue'
import DishTable from '~/components/platform/DishTable.vue'
import Icon from '~/components/shared/Icon.vue'
import type { Dish as DesignDish, DishStatus } from '~/types/popplate'

definePageMeta({ layout: 'platform' })

interface RestaurantDish {
  id: string
  name: string
  shortDescription: string | null
  priceText: string | null
  status: DishStatus
  posterUrl?: string | null
  publicDishId?: string
}

interface RestaurantDetail {
  id: string
  name: string
  slug: string
  status: string
  tagline: string | null
  address: string | null
  city: string | null
  openingHours: string | null
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

const { data: restaurant, pending, error } = useLazyFetch<RestaurantDetail>(
  () => '/api/restaurants/' + slug.value,
  { headers: ssrHeaders },
)

useHead({ title: computed(() => restaurant.value ? `${restaurant.value.name} · popplate` : 'Workspace · popplate') })

const publicMenuPath = computed(() => restaurant.value ? '/r/' + restaurant.value.slug : '/platform/settings')

/** Map API dish to the design Dish shape */
function toDesignDish(d: RestaurantDish): DesignDish {
  return {
    id: d.id,
    name: d.name,
    restaurant: restaurant.value?.name ?? '',
    status: d.status as DishStatus,
    price: d.priceText ?? '',
    views: 0,
    scans: 0,
    img: d.posterUrl ?? '',
    updated: '',
  }
}

const dishes = computed(() => (restaurant.value?.latestDishes ?? []).map(toDesignDish))
const search = ref('')
const filteredDishes = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return dishes.value

  return dishes.value.filter((dish) =>
    [dish.name, dish.restaurant, dish.price, dish.status]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query)),
  )
})
const publishedCount = computed(() => restaurant.value?.publishedDishCount ?? 0)

const INFO = computed<Array<[string, string]>>(() => {
  if (!restaurant.value) return []
  const r = restaurant.value
  const items: Array<[string, string]> = [
    ['Navn', r.name],
    ['Live URL', `popplate.dk/r/${r.slug}`],
    ['Status', r.status === 'active' ? 'Aktiv' : r.status],
    ['Retter', String(r.dishCount)],
    ['Publiceret', String(r.publishedDishCount)],
  ]
  if (r.tagline) items.push(['Beskrivelse', r.tagline])
  if (r.address) items.push(['Adresse', r.address])
  if (r.city) items.push(['By', r.city])
  return items
})

async function handleDeleteRestaurant() {
  if (!restaurant.value) return
  if (!confirm('Slet denne restaurant permanent? Dette sletter ogsa alle retter, QR-koder, analytics, jobs og billeddata.')) return

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
    deleteError.value = e?.data?.message ?? e?.message ?? 'Kunne ikke slette restaurant.'
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div data-screen-label="Workspace">
    <TopBar v-model:search="search" search-placeholder="Søg i restaurantens retter..." />

    <!-- Loading -->
    <PageSkeleton v-if="pending" variant="dashboard" />

    <!-- Error -->
    <div v-else-if="error" class="p-card py-16 text-center text-[#8a4838]">
      Kunne ikke indlaese restaurant.
    </div>

    <template v-else-if="restaurant">
      <PageHead :eyebrow="`${restaurant.status === 'active' ? 'Aktiv' : restaurant.status}`">
        <template #title>
          <h1 class="page-title"><span class="accent">{{ restaurant.name }}</span></h1>
        </template>
        <template #sub>
          <p class="text-ink-mute mt-3 text-[15px] max-w-[480px]">
            Restaurant-overblik. Alle retter scopet til denne adresse.
          </p>
        </template>
        <template #actions>
          <NuxtLink :to="publicMenuPath" target="_blank" rel="noopener" class="top-btn">
            <Icon name="arrow-up-right" :size="14" />
            <span>Live menu</span>
          </NuxtLink>
          <NuxtLink :to="{ path: '/platform/dishes/new', query: { restaurantId: restaurant.id } }" class="top-btn top-btn--primary">
            <Icon name="plus" :size="14" /><span>Ny ret</span>
          </NuxtLink>
        </template>
      </PageHead>

      <!-- Stats -->
      <div class="grid grid-cols-4 gap-4 mb-8 max-[1100px]:grid-cols-2 max-[480px]:grid-cols-1">
        <StatCard label="Retter" :value="restaurant.dishCount" caption="i alt" />
        <StatCard label="Publiceret" :value="publishedCount" caption="live pa menu" />
        <StatCard label="AR-visninger" value="--" sub="/30d" caption="kommer snart" />
        <StatCard label="QR-scans" value="--" sub="/30d" caption="kommer snart" />
      </div>

      <!-- Info panel + top performers placeholder -->
      <div class="two-col mb-6">
        <div class="p-card">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-display font-normal text-[22px] tracking-[-0.015em]">Seneste retter</h3>
            <NuxtLink :to="`/platform/r/${restaurant.slug}/dishes`" class="font-mono text-[11px] uppercase font-medium text-clay-deep tracking-[0.15em]">
              Se alle &rarr;
            </NuxtLink>
          </div>
          <div v-if="!dishes.length" class="p-card py-16 text-center">
            <Icon name="dish" :size="32" class="text-ink-faint mx-auto mb-3" />
            <h3 class="font-display font-normal text-[18px] tracking-[-0.015em] mb-2">Ingen retter endnu</h3>
            <p class="text-ink-mute text-[13px] mb-5">Tilføj din første ret for at komme i gang.</p>
            <NuxtLink to="/platform/dishes/new" class="top-btn top-btn--primary !inline-flex">
              <Icon name="plus" :size="14" /><span>Tilføj ret</span>
            </NuxtLink>
          </div>
          <div v-else-if="filteredDishes.length" class="flex flex-col">
            <NuxtLink
              v-for="(d, i) in filteredDishes.slice(0, 5)" :key="d.id"
              :to="`/platform/dishes/${d.id}`"
              class="flex gap-3 py-3.5 items-center no-underline text-inherit"
              :class="i < Math.min(filteredDishes.length, 5) - 1 && 'border-b border-line'"
            >
              <span class="font-mono text-[11px] text-ink-faint">{{ String(i + 1).padStart(2, '0') }}</span>
              <div
                class="w-11 h-11 bg-card bg-cover bg-center rounded shrink-0"
                :style="d.img ? { backgroundImage: `url(${d.img})` } : {}"
              />
              <div class="min-w-0 flex-1">
                <div class="font-display text-[17px] font-normal tracking-[-0.01em] truncate">{{ d.name }}</div>
              </div>
              <span class="status-badge" :class="`status-badge--${d.status}`">{{ d.status }}</span>
            </NuxtLink>
          </div>
          <div v-else class="py-12 text-center text-ink-faint">
            Ingen retter matcher din søgning.
          </div>
        </div>

        <aside class="p-card">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-display font-normal text-[22px] tracking-[-0.015em]">Restaurant-info</h3>
          </div>
          <dl class="m-0">
            <div v-for="[k, v] in INFO" :key="k" class="flex justify-between py-3 border-b border-line text-sm">
              <dt class="mono-label">{{ k }}</dt>
              <dd class="font-display italic text-base">{{ v }}</dd>
            </div>
          </dl>
          <div class="flex gap-2.5 mt-4">
            <NuxtLink :to="`/platform/r/${restaurant.slug}/edit`" class="top-btn flex-1 !justify-center">Rediger info</NuxtLink>
          </div>
        </aside>
      </div>

      <!-- Full dish table -->
      <div class="p-card">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-display font-normal text-[22px] tracking-[-0.015em]">Alle retter pa {{ restaurant.name }}</h3>
          <NuxtLink :to="`/platform/r/${restaurant.slug}/dishes`" class="font-mono text-[11px] uppercase font-medium text-clay-deep tracking-[0.15em]">
            Aabn fuld liste &rarr;
          </NuxtLink>
        </div>
        <DishTable :dishes="filteredDishes" compact />
      </div>

      <!-- Admin danger zone -->
      <div v-if="isAdmin" class="mt-6 p-card border-[#8a4838]/20">
        <div class="mono-label !text-[#8a4838] mb-3">Farezone</div>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 class="font-display font-normal text-[22px] tracking-[-0.015em]">Slet restaurant</h3>
            <p class="text-sm text-ink-mute mt-1">Sletter permanent denne restaurant og alle tilhoerende retter, QR-koder, analytics, jobs og billeder.</p>
          </div>
          <button
            type="button"
            :disabled="deleting"
            class="top-btn !border-[#8a4838]/40 !text-[#8a4838] hover:!bg-[#8a4838]/5 shrink-0"
            @click="handleDeleteRestaurant"
          >
            {{ deleting ? 'Sletter...' : 'Slet restaurant' }}
          </button>
        </div>
        <p v-if="deleteError" class="mt-3 text-sm text-[#8a4838]">{{ deleteError }}</p>
      </div>
    </template>
  </div>
</template>
