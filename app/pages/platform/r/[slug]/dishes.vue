<script setup lang="ts">
import TopBar from '~/components/platform/TopBar.vue'
import PageHead from '~/components/platform/PageHead.vue'
import DishTable from '~/components/platform/DishTable.vue'
import Icon from '~/components/shared/Icon.vue'
import type { Dish as DesignDish, DishStatus } from '~/types/popplate'

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

const { data, pending, error } = useLazyFetch<RestaurantDishesResponse>(
  () => '/api/restaurants/' + slug.value + '/dishes',
  { headers: ssrHeaders },
)

useHead({ title: computed(() => data.value ? `Retter · ${data.value.restaurant.name} · popplate` : 'Retter · popplate') })

/** Map API dish to the design Dish shape */
function toDesignDish(d: DishItem): DesignDish {
  return {
    id: d.id,
    name: d.name,
    restaurant: data.value?.restaurant.name ?? '',
    status: d.status as DishStatus,
    price: d.priceText ?? '',
    views: 0,
    scans: 0,
    img: d.posterUrl ?? '',
    updated: '',
  }
}

const dishes = computed(() => (data.value?.dishes ?? []).map(toDesignDish))
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
</script>

<template>
  <div data-screen-label="RestaurantDishes">
    <TopBar v-model:search="search" search-placeholder="Søg i restaurantens retter..." />

    <!-- Loading -->
    <PageSkeleton v-if="pending" variant="list" />

    <!-- Error -->
    <div v-else-if="error" class="p-card py-16 text-center text-[#8a4838]">
      Kunne ikke indlaese retter.
    </div>

    <template v-else-if="data">
      <PageHead :back-href="`/platform/r/${data.restaurant.slug}`" :back-label="data.restaurant.name">
        <template #title>
          <h1 class="page-title">Retter pa <span class="accent">{{ data.restaurant.name }}</span></h1>
        </template>
        <template #sub>
          <p class="text-ink-mute mt-3 text-[15px] max-w-[480px]">
            Rediger retterne der hoerer til /r/{{ data.restaurant.slug }}.
          </p>
        </template>
        <template #actions>
          <NuxtLink
            :to="'/r/' + data.restaurant.slug"
            target="_blank"
            rel="noopener"
            class="top-btn"
          >
            <Icon name="arrow-up-right" :size="14" />
            <span>Aabn menu</span>
          </NuxtLink>
          <NuxtLink
            :to="{ path: '/platform/dishes/new', query: { restaurantId: data.restaurant.id } }"
            class="top-btn top-btn--primary"
          >
            <Icon name="plus" :size="14" /><span>Ny ret</span>
          </NuxtLink>
        </template>
      </PageHead>

      <div v-if="!dishes.length" class="p-card py-16 text-center text-ink-faint">
        <div class="font-display italic text-2xl text-ink mb-2">Ingen retter endnu</div>
        <p>Opret en ret fra denne restaurant for at tilknytte den korrekt.</p>
      </div>
      <div v-else-if="!filteredDishes.length" class="p-card py-16 text-center text-ink-faint">
        Ingen retter matcher din søgning.
      </div>

      <DishTable v-else :dishes="filteredDishes" />
    </template>
  </div>
</template>
