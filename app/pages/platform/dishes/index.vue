<script setup lang="ts">
import TopBar from '~/components/platform/TopBar.vue'
import PageHead from '~/components/platform/PageHead.vue'
import DishTable from '~/components/platform/DishTable.vue'
import Icon from '~/components/shared/Icon.vue'
import type { Dish as DesignDish, DishStatus } from '~/types/popplate'

definePageMeta({ layout: 'platform' })
useHead({ title: 'Retter · popplate' })

interface ApiDishItem {
  id: string
  name: string
  status: DishStatus
  createdAt: string
  posterUrl?: string | null
  updatedAt?: string
  publicDishId?: string | null
}

const ssrHeaders = useAuthHeaders()
const { user } = useAuth()
const isAdmin = computed(() => user.value?.role === 'admin')
const deletingId = ref('')

const { data: apiDishes, pending, error, refresh } = useLazyFetch<ApiDishItem[]>('/api/dishes', { headers: ssrHeaders })
const route = useRoute()

/** Map API dish to the design Dish shape */
function toDesignDish(d: ApiDishItem): DesignDish {
  return {
    id: d.id,
    name: d.name,
    restaurant: '',
    status: d.status as DishStatus,
    price: '',
    views: 0,
    scans: 0,
    img: d.posterUrl ?? '',
    updated: d.updatedAt
      ? new Date(d.updatedAt).toLocaleDateString('da-DK', { day: 'numeric', month: 'short' })
      : new Date(d.createdAt).toLocaleDateString('da-DK', { day: 'numeric', month: 'short' }),
    publicDishId: d.publicDishId ?? null,
  }
}

const dishes = computed(() => (apiDishes.value ?? []).map(toDesignDish))

const filter = ref<DishStatus | 'all'>('all')
const search = ref(typeof route.query.search === 'string' ? route.query.search : '')

watch(
  () => route.query.search,
  (value) => {
    search.value = typeof value === 'string' ? value : ''
  },
)

const filtered = computed(() =>
  dishes.value.filter((d) => {
    if (filter.value !== 'all' && d.status !== filter.value) return false
    if (search.value && !d.name.toLowerCase().includes(search.value.toLowerCase())) return false
    return true
  }),
)

const count = (s: DishStatus | 'all') =>
  dishes.value.filter((d) => s === 'all' || d.status === s).length

const FILTERS: Array<{ key: DishStatus | 'all'; label: string }> = [
  { key: 'all',        label: 'Alle' },
  { key: 'published',  label: 'Publiceret' },
  { key: 'ready',      label: 'Klar' },
  { key: 'processing', label: 'Genererer' },
  { key: 'draft',      label: 'Kladder' },
  { key: 'failed',     label: 'Fejlet' },
]

async function handleDeleteDish(dish: DesignDish) {
  if (!confirm('Permanently delete this dish? This removes its QR code, analytics, jobs, and source image records.')) return

  deletingId.value = String(dish.id)

  try {
    await $fetch('/api/dishes/' + dish.id, {
      method: 'DELETE',
      query: { hard: 'true' },
    })
    await refresh()
  } finally {
    deletingId.value = ''
  }
}
</script>

<template>
  <div data-screen-label="Dishes">
    <TopBar v-model:search="search" />

    <PageHead :eyebrow="`${dishes.length} retter`">
      <template #title>
        <h1 class="page-title">Alle <span class="accent">retter</span>.</h1>
      </template>
      <template #sub>
        <p class="text-ink-mute mt-3 text-[15px] max-w-[480px]">
          Filtrer pa status, soeg, og rediger individuelle retter.
        </p>
      </template>
      <template #actions>
        <NuxtLink to="/platform/dishes/new" class="top-btn top-btn--primary">
          <Icon name="plus" :size="14" /><span>Ny ret</span>
        </NuxtLink>
      </template>
    </PageHead>

    <!-- Loading -->
    <PageSkeleton v-if="pending" variant="list" />

    <!-- Error -->
    <div v-else-if="error" class="p-card py-16 text-center text-[#8a4838]">
      Kunne ikke indlaese retter.
    </div>

    <template v-else>
      <!-- Filter row -->
      <div class="flex justify-between items-center gap-4 mb-5 flex-wrap">
        <div class="filter-row flex gap-2 max-[600px]:overflow-x-auto max-[600px]:flex-nowrap">
          <button
            v-for="f in FILTERS" :key="f.key"
            type="button"
            class="filter-pill whitespace-nowrap shrink-0"
            :class="filter === f.key && 'filter-pill--active'"
            @click="filter = f.key"
          >
            {{ f.label }} <span class="count">{{ count(f.key) }}</span>
          </button>
        </div>
        <div class="flex items-center gap-2.5 bg-paper border border-line rounded-full px-[18px] py-2.5 min-w-[280px] max-[600px]:w-full">
          <Icon name="search" :size="14" />
          <input
            v-model="search" type="text" placeholder="Søg..."
            class="border-0 outline-none bg-transparent font-body text-sm text-ink flex-1 min-w-0"
          >
        </div>
      </div>

      <DishTable :dishes="filtered" />
    </template>
  </div>
</template>

<style scoped>
@media (max-width: 600px) {
  .filter-row {
    scrollbar-width: none;
    margin: 0 -18px;
    padding: 0 18px 4px;
  }
  .filter-row::-webkit-scrollbar { display: none; }
}
</style>
