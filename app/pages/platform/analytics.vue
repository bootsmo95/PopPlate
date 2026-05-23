<script setup lang="ts">
import TopBar from '~/components/platform/TopBar.vue'
import PageHead from '~/components/platform/PageHead.vue'
import StatCard from '~/components/platform/StatCard.vue'
import AnalyticsTrendChart from '~/components/platform/AnalyticsTrendChart.vue'
import PageSkeleton from '~/components/platform/PageSkeleton.vue'

definePageMeta({ layout: 'platform' })
useHead({ title: 'Analyse · popplate' })

const { accountTier } = useAuth()
const isFreeTier = computed(() => accountTier.value === 'free')

interface ApiRestaurant {
  id: string
  name: string
  slug: string
  status: string
}

interface AnalyticsData {
  menuViews: number
  qrScans: number
  interactions: number
  topDish: string | null
  prev: { menuViews: number; qrScans: number; interactions: number }
  daily: Array<{ date: string; count: number }>
  dishRanking: Array<{
    dishId: string
    name: string
    posterUrl: string | null
    views: number
    interactions: number
  }>
}

const ssrHeaders = useAuthHeaders()

const {
  data: restaurants,
  pending: restaurantsPending,
  error: restaurantsError,
} = await useFetch<ApiRestaurant[]>('/api/restaurants', {
  headers: ssrHeaders,
  default: () => [],
})

const firstSlug = computed(() => restaurants.value?.[0]?.slug ?? '')

const period = ref<'7d' | '30d' | 'all'>('30d')

const {
  data: analytics,
  status: analyticsStatus,
  error: analyticsError,
  refresh,
} = useLazyFetch<AnalyticsData>(
  () => `/api/restaurants/${firstSlug.value}/analytics?period=${period.value}`,
  { headers: ssrHeaders, immediate: false },
)

watch([firstSlug, period], ([slug]) => { if (slug && !isFreeTier.value) refresh() }, { immediate: true })

const loading = computed(() => restaurantsPending.value || analyticsStatus.value === 'pending')
const hasRestaurants = computed(() => (restaurants.value?.length ?? 0) > 0)

const periodLabel = computed(() => {
  if (period.value === '7d') return '7 dage'
  if (period.value === '30d') return '30 dage'
  return 'Alt tid'
})

function deltaLabel(current?: number, prev?: number): string {
  if (current == null || prev == null || prev === 0) return 'ingen ændring'
  const pct = Math.round(((current - prev) / prev) * 100)
  if (pct === 0) return 'ingen ændring'
  return `${Math.abs(pct)}% vs. forrige periode`
}

function deltaDir(current?: number, prev?: number): 'up' | 'down' | 'neutral' {
  if (current == null || prev == null || prev === 0) return 'neutral'
  const diff = current - prev
  if (diff > 0) return 'up'
  if (diff < 0) return 'down'
  return 'neutral'
}
</script>

<template>
  <div data-screen-label="Analyse">
    <TopBar />

    <!-- Free tier upgrade prompt -->
    <div v-if="isFreeTier">
      <PageHead eyebrow="Analyse">
        <template #title>
          <h1 class="page-title">Indsigter</h1>
        </template>
      </PageHead>

      <div class="p-card relative overflow-hidden p-16 text-center" style="background: #2b1f15; border: none">
        <div
          class="absolute inset-0 pointer-events-none"
          style="background: radial-gradient(circle at 50% 40%, rgba(184, 122, 78, 0.3), transparent 60%)"
        />
        <div class="relative">
          <div class="font-mono text-[11px] uppercase font-medium tracking-[0.18em] mb-4" style="color: #d4a880">
            Basic eller Pro
          </div>
          <h2
            class="font-display font-normal italic text-[28px] tracking-[-0.015em] mb-3"
            style="color: #f3ede2"
          >
            Analyse kræver en opgradering
          </h2>
          <p class="text-[15px] max-w-[420px] mx-auto mb-8" style="color: rgba(243, 237, 226, 0.6)">
            Se menuvisninger, QR-scans, interaktioner og retpopularitet. Opgrader til Basic eller Pro for at få adgang.
          </p>
          <NuxtLink to="/platform/settings?tab=tier" class="top-btn top-btn--clay">
            Se planer
          </NuxtLink>
        </div>
      </div>
    </div>

    <PageSkeleton v-else-if="loading" variant="dashboard" />

    <div v-else>
      <PageHead :eyebrow="`Analyse · ${periodLabel}`">
        <template #title>
          <h1 class="page-title">Indsigter</h1>
        </template>
        <template #sub>
          <p class="text-ink-mute mt-3 text-[15px] max-w-[480px]">
            Se hvordan dit menu performer og hvilke retter skaber mest engagement.
          </p>
        </template>
      </PageHead>

      <!-- Error state -->
      <div v-if="restaurantsError || analyticsError || analyticsStatus === 'error'" class="p-card py-12 text-center text-[#8a4838]">
        Kunne ikke hente analystal. Prøv at genindlæse siden.
      </div>

      <div v-else-if="!hasRestaurants" class="p-card py-12 text-center">
        <h3 class="font-display text-[22px] mb-2 text-ink">Ingen restaurant endnu</h3>
        <p class="text-ink-faint text-[15px] mb-5">Opret en restaurant, før analyse kan vises.</p>
        <NuxtLink to="/platform/restaurants" class="top-btn top-btn--primary">
          Opret restaurant
        </NuxtLink>
      </div>

      <template v-else>
        <!-- Time period tabs per D-04 -->
        <div class="flex gap-2 mb-6">
          <button
            v-for="p in (['7d', '30d', 'all'] as const)"
            :key="p"
            class="filter-pill"
            :class="period === p && 'filter-pill--active'"
            @click="period = p"
          >
            {{ p === '7d' ? '7 dage' : p === '30d' ? '30 dage' : 'Alt tid' }}
          </button>
        </div>

        <!-- Stat cards per D-03, D-05 -->
        <div class="grid grid-cols-4 gap-4 mb-8 max-[1100px]:grid-cols-2 max-[480px]:grid-cols-1">
          <StatCard
            label="Menuvisninger"
            :value="analytics?.menuViews?.toLocaleString('da-DK') ?? '—'"
            :sub="`/${periodLabel}`"
            :delta="deltaLabel(analytics?.menuViews, analytics?.prev?.menuViews)"
            :delta-direction="deltaDir(analytics?.menuViews, analytics?.prev?.menuViews)"
          />
          <StatCard
            label="QR-scans"
            :value="analytics?.qrScans?.toLocaleString('da-DK') ?? '—'"
            :sub="`/${periodLabel}`"
            :delta="deltaLabel(analytics?.qrScans, analytics?.prev?.qrScans)"
            :delta-direction="deltaDir(analytics?.qrScans, analytics?.prev?.qrScans)"
          />
          <StatCard
            label="Interaktioner"
            :value="analytics?.interactions?.toLocaleString('da-DK') ?? '—'"
            :sub="`/${periodLabel}`"
            :delta="deltaLabel(analytics?.interactions, analytics?.prev?.interactions)"
            :delta-direction="deltaDir(analytics?.interactions, analytics?.prev?.interactions)"
          />
          <StatCard
            label="Mest populær"
            :value="analytics?.topDish
              ? (analytics.topDish.length > 20 ? analytics.topDish.slice(0, 20) + '...' : analytics.topDish)
              : '—'"
            caption="flest visninger"
          />
        </div>

        <!-- Trend chart per D-06 -->
        <div v-if="analytics?.daily?.length" class="p-card mb-8">
          <h3 class="font-display font-normal text-[22px] tracking-[-0.015em] mb-4">Daglige begivenheder</h3>
          <AnalyticsTrendChart :daily="analytics.daily" />
        </div>

        <!-- Dish popularity table per D-07, D-08 -->
        <div class="p-card">
          <h3 class="font-display font-normal text-[22px] tracking-[-0.015em] mb-4">Popularitet pr. ret</h3>
          <div v-if="!analytics?.dishRanking?.length" class="py-12 text-center text-ink-faint">
            Ingen retter har visninger i denne periode.
          </div>
          <table v-else class="p-table w-full">
            <thead>
              <tr>
                <th class="text-left">#</th>
                <th class="text-left">Ret</th>
                <th class="text-right">Visninger</th>
                <th class="text-right">Interaktioner</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(dish, i) in analytics.dishRanking" :key="dish.dishId">
                <td class="font-mono text-ink-faint">{{ i + 1 }}</td>
                <td>
                  <div class="flex items-center gap-3">
                    <div
                      class="w-8 h-8 bg-card bg-cover bg-center rounded shrink-0"
                      :style="dish.posterUrl ? { backgroundImage: `url(${dish.posterUrl})` } : {}"
                    />
                    <span class="truncate">{{ dish.name }}</span>
                  </div>
                </td>
                <td class="text-right font-mono">{{ dish.views.toLocaleString('da-DK') }}</td>
                <td class="text-right font-mono">{{ dish.interactions.toLocaleString('da-DK') }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty state when no data at all -->
        <div
          v-if="analytics && !analytics.menuViews && !analytics.qrScans && !analytics.interactions && !analytics.dishRanking?.length"
          class="py-12 text-center"
        >
          <h3 class="font-display text-[22px] mb-2 text-ink">Ingen data endnu</h3>
          <p class="text-ink-faint text-[15px]">Statistik vises, når dine gæster begynder at åbne menuen.</p>
        </div>
      </template>
    </div>
  </div>
</template>
