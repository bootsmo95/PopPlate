<script setup lang="ts">
import TopBar from '~/components/platform/TopBar.vue'
import PageHead from '~/components/platform/PageHead.vue'
import StatCard from '~/components/platform/StatCard.vue'
import QuickActionCard from '~/components/platform/QuickActionCard.vue'
import ActivityList from '~/components/platform/ActivityList.vue'
import StatusBadge from '~/components/platform/StatusBadge.vue'
import Icon from '~/components/shared/Icon.vue'
import type { Dish as DesignDish, DishStatus } from '~/types/popplate'

definePageMeta({ layout: 'platform' })
useHead({ title: 'Dashboard · popplate' })

interface ApiDish {
  id: string
  name: string
  status: DishStatus
  createdAt: string
  posterUrl?: string | null
  updatedAt?: string
}

interface ApiRestaurant {
  id: string
  name: string
  slug: string
  status: string
}

const ssrHeaders = useAuthHeaders()
const { user } = useAuth()

const { data: apiDishes, status: dishesStatus } = useLazyFetch<ApiDish[]>('/api/dishes', { headers: ssrHeaders })
const { data: restaurants, status: restaurantsStatus } = useLazyFetch<ApiRestaurant[]>('/api/restaurants', { headers: ssrHeaders })

const loading = computed(() => dishesStatus.value === 'pending' || restaurantsStatus.value === 'pending')

const dishCount = computed(() => apiDishes.value?.length ?? 0)
const restaurantCount = computed(() => restaurants.value?.length ?? 0)
const firstSlug = computed(() => restaurants.value?.[0]?.slug ?? '')
const firstName = computed(() => restaurants.value?.[0]?.name ?? '')

/** Map API dish to the design Dish shape for display */
function toDesignDish(d: ApiDish): DesignDish {
  return {
    id: d.id,
    name: d.name,
    restaurant: firstName.value,
    status: d.status as DishStatus,
    price: '',
    views: 0,
    scans: 0,
    img: d.posterUrl ?? '',
    updated: d.updatedAt
      ? new Date(d.updatedAt).toLocaleDateString('da-DK', { day: 'numeric', month: 'short' })
      : '',
  }
}

const recent = computed(() => (apiDishes.value ?? []).slice(0, 6).map(toDesignDish))

function splitItalic(d: DesignDish): [string, string, string] {
  if (!d.italic) return [d.name, '', '']
  const idx = d.name.indexOf(d.italic)
  if (idx < 0) return [d.name, '', '']
  return [d.name.slice(0, idx), d.italic, d.name.slice(idx + d.italic.length)]
}

// Static activity mock (no activity API exists yet)
const activity: Array<{ status: DishStatus; title: string; detail: string; time: string }> = [
  { status: 'processing', title: 'Kammuslinger',          detail: '3D-generation 62%',           time: '3 min' },
  { status: 'failed',     title: 'Lille ostebord',        detail: 'generation fejlet',            time: '1 t' },
  { status: 'published',  title: 'Braendt porre',         detail: 'publiceret pa live menu',      time: '2 t' },
  { status: 'ready',      title: 'Torsk med jordskokker', detail: '3D klar til review',           time: '1 d' },
  { status: 'published',  title: 'Hindbaer & havtorn',    detail: '56 nye AR-visninger',          time: '4 t' },
  { status: 'draft',      title: 'Lammeryg fra Mors',     detail: 'oprettet som kladde',          time: '2 d' },
]

const today = new Date().toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const eyebrow = computed(() => `${today}${firstName.value ? ` · ${firstName.value}` : ''}`)
</script>

<template>
  <div data-screen-label="Dashboard">
    <TopBar />

    <PageSkeleton v-if="loading" variant="dashboard" />

    <div v-else>
    <PageHead :eyebrow="eyebrow">
      <template #title>
        <h1 class="page-title">
          Velkommen tilbage, <span class="accent">{{ user?.displayName ?? user?.email ?? 'der' }}</span>.
        </h1>
      </template>
      <template #sub>
        <p class="text-ink-mute mt-3 text-[15px] max-w-[480px]">
          <template v-if="firstName">
            Her er status pa {{ firstName }}. Hold oje med generationer der venter pa review.
          </template>
          <template v-else>
            Opret en restaurant under indstillinger for at komme i gang.
          </template>
        </p>
      </template>
    </PageHead>

    <!-- Stats -->
    <div class="grid grid-cols-4 gap-4 mb-8 max-[1100px]:grid-cols-2 max-[480px]:grid-cols-1">
      <StatCard label="Retter i alt" :value="dishCount" caption="alle retter" />
      <StatCard label="Restauranter" :value="restaurantCount" caption="oprettet" />
      <StatCard label="AR-visninger" value="--" sub="/30d" caption="kommer snart" />
      <StatCard label="QR-scans" value="--" sub="/30d" caption="kommer snart" />
    </div>

    <!-- Quick actions + Activity -->
    <div class="two-col mb-6">
      <div class="p-card">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-display font-normal text-[22px] tracking-[-0.015em]">Hurtige handlinger</h3>
        </div>
        <div class="grid gap-3" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));">
          <QuickActionCard
            number="01" label="Ny ret" title="Opret en ret" italic="ret"
            body="Upload 3-8 fotos. Vi bygger 3D-modellen pa 92 sekunder."
            cta-label="Start" to="/platform/dishes/new" dark
          />
          <QuickActionCard
            number="02" label="Administrer" title="Alle retter" italic="retter"
            body="Filtrer, soeg, publish/unpublish, download QR-koder."
            cta-label="Aabn liste" to="/platform/dishes"
          />
          <QuickActionCard
            number="03" label="Forhaandsvis" title="Live menu" italic="menu"
            :body="`Se ${firstName || 'restaurantens'} offentlige menuside.`"
            cta-label="Aabn"
            :to="firstSlug ? `/r/${firstSlug}` : '/platform/settings'"
          />
          <QuickActionCard
            number="04" label="Print" title="QR-pakke til print" italic="til print"
            body="Download alle QR-koder som PDF."
            cta-label="Hent" href="#qr"
          />
        </div>
      </div>

      <aside class="p-card">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-display font-normal text-[22px] tracking-[-0.015em]">Seneste aktivitet</h3>
          <a href="#all" class="font-mono text-[11px] uppercase font-medium text-clay-deep tracking-[0.15em]">Se alle</a>
        </div>
        <ActivityList :items="activity" />
      </aside>
    </div>

    <!-- Recent dishes -->
    <div class="p-card">
      <div class="flex justify-between items-center mb-4">
        <h3 class="font-display font-normal text-[22px] tracking-[-0.015em]">Seneste retter</h3>
        <NuxtLink to="/platform/dishes" class="font-mono text-[11px] uppercase font-medium text-clay-deep tracking-[0.15em]">
          Se alle {{ dishCount }} &rarr;
        </NuxtLink>
      </div>

      <div v-if="!recent.length" class="py-12 text-center text-ink-faint">
        Ingen retter endnu. Opret din foerste ret for at komme i gang.
      </div>

      <div v-else class="grid gap-3.5" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
        <NuxtLink
          v-for="d in recent" :key="d.id"
          :to="`/platform/dishes/${d.id}`"
          class="flex gap-3 p-3 rounded-md transition-colors hover:bg-[rgba(184,122,78,0.06)] no-underline text-inherit"
        >
          <div
            class="w-14 h-14 bg-card bg-cover bg-center shrink-0 rounded"
            :style="d.img ? { backgroundImage: `url(${d.img})` } : {}"
          />
          <div class="flex-1 min-w-0">
            <div class="font-display text-base font-normal tracking-[-0.01em] mb-1.5 truncate">
              <template v-if="d.italic">
                {{ splitItalic(d)[0] }}<span class="italic text-clay-deep">{{ splitItalic(d)[1] }}</span>{{ splitItalic(d)[2] }}
              </template>
              <template v-else>{{ d.name }}</template>
            </div>
            <div class="flex justify-between items-center gap-2">
              <StatusBadge :status="d.status" :progress="d.progress" />
              <span class="font-mono text-[11px] text-ink-faint">{{ d.updated }}</span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
    </div>
  </div>
</template>
