<script setup lang="ts">
import TopBar from '~/components/platform/TopBar.vue'
import PageHead from '~/components/platform/PageHead.vue'
import StatCard from '~/components/platform/StatCard.vue'
import AnalyticsTrendChart from '~/components/platform/AnalyticsTrendChart.vue'

definePageMeta({ layout: 'platform' })
useHead({ title: 'Analyse · popplate' })

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

const { data: restaurants } = useLazyFetch<ApiRestaurant[]>('/api/restaurants', {
  headers: ssrHeaders,
})

const firstSlug = computed(() => restaurants.value?.[0]?.slug ?? '')

const period = ref<'7d' | '30d' | 'all'>('30d')

const {
  data: analytics,
  status: analyticsStatus,
  refresh,
} = useLazyFetch<AnalyticsData>(
  () => `/api/restaurants/${firstSlug.value}/analytics?period=${period.value}`,
  { headers: ssrHeaders, immediate: false },
)

watch(firstSlug, (slug) => { if (slug) refresh() }, { immediate: true })
watch(period, () => { if (firstSlug.value) refresh() })

const loading = computed(() => analyticsStatus.value === 'pending')

const periodLabel = computed(() => {
  if (period.value === '7d') return '7 dage'
  if (period.value === '30d') return '30 dage'
  return 'Alt tid'
})

function deltaLabel(current?: number, prev?: number): string {
  if (current == null || prev == null || prev === 0) return 'ingen aendring'
  const pct = Math.round(((current - prev) / prev) * 100)
  if (pct === 0) return 'ingen aendring'
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

    <PageSkeleton v-if="loading" variant="dashboard" />

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
      <div v-if="analyticsStatus === 'error'" class="py-12 text-center text-ink-faint">
        Kunne ikke hente analystal. Proev at genindlaese siden.
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
            label="Mest populaer"
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
          <p class="text-ink-faint text-[15px]">Statistik vises, nar dine gaester begynder at aabne menuen.</p>
        </div>
      </template>
    </div>
  </div>
</template>
