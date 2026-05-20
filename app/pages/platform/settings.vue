<script setup lang="ts">
import TopBar from '~/components/platform/TopBar.vue'
import PageHead from '~/components/platform/PageHead.vue'
import Icon from '~/components/shared/Icon.vue'

definePageMeta({ layout: 'platform' })
useHead({ title: 'Indstillinger · popplate' })

interface ApiRestaurant {
  id: string
  name: string
  slug: string
  status: string
}

const ssrHeaders = useAuthHeaders()
const { user } = useAuth()
const isAdmin = computed(() => user.value?.role === 'admin')

const { data: restaurants, pending, error, refresh } = await useFetch<ApiRestaurant[]>('/api/restaurants', { headers: ssrHeaders })

// Dish count for tier tab
const { data: apiDishes } = await useFetch<Array<{ id: string }>>('/api/dishes', { headers: ssrHeaders })
const apiDishCount = computed(() => apiDishes.value?.length ?? 0)

// Create restaurant form state
const name = ref('')
const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const deletingSlug = ref('')

const slugPreview = computed(() => {
  const slug = name.value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
  return slug || 'restaurant-name'
})

type Tab = 'restaurants' | 'tier' | 'team' | 'account' | 'api'
const tab = ref<Tab>('restaurants')

const TABS = computed<Array<{ key: Tab; label: string; count?: number }>>(() => [
  { key: 'restaurants', label: 'Restauranter', count: restaurants.value?.length ?? 0 },
  { key: 'tier',        label: 'Tier & fakturering' },
  { key: 'team',        label: 'Team' },
  { key: 'account',     label: 'Konto' },
  { key: 'api',         label: 'API & Webhooks' },
])

const INVOICES = [
  '20. maj 2026 · 499 kr',
  '20. april 2026 · 499 kr',
  '20. marts 2026 · 499 kr',
  '20. februar 2026 · 499 kr',
]

async function handleSubmit() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!name.value.trim()) {
    errorMessage.value = 'Indtast venligst et restaurantnavn.'
    return
  }

  submitting.value = true

  try {
    const created = await $fetch<ApiRestaurant>('/api/restaurants', {
      method: 'POST',
      body: { name: name.value },
    })
    successMessage.value = `${created.name} er oprettet.`
    name.value = ''
    await refresh()
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    errorMessage.value = e?.data?.message ?? e?.message ?? 'Kunne ikke oprette restaurant.'
  } finally {
    submitting.value = false
  }
}

async function handleDeleteRestaurant(restaurant: ApiRestaurant) {
  if (!confirm('Slet denne restaurant permanent? Dette sletter ogsa alle retter, QR-koder, analytics, jobs og billeddata.')) return

  deletingSlug.value = restaurant.slug
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await $fetch('/api/restaurants/' + restaurant.slug, {
      method: 'DELETE',
      query: { hard: 'true' },
    })
    successMessage.value = restaurant.name + ' er slettet.'
    await refresh()
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    errorMessage.value = e?.data?.message ?? e?.message ?? 'Kunne ikke slette restaurant.'
  } finally {
    deletingSlug.value = ''
  }
}
</script>

<template>
  <div data-screen-label="Settings">
    <TopBar :show-search="false" cta-label="Ny restaurant" cta-href="#new-restaurant" />

    <PageHead :eyebrow="`Konto · ${user?.displayName ?? user?.email ?? ''}`">
      <template #title>
        <h1 class="page-title">Indstillinger</h1>
      </template>
      <template #sub>
        <p class="text-ink-mute mt-3 text-[15px] max-w-[480px]">
          Restauranter, tier og kontoindstillinger.
        </p>
      </template>
    </PageHead>

    <!-- Tabs -->
    <div class="flex gap-2 mb-6 flex-wrap">
      <button
        v-for="t in TABS" :key="t.key"
        type="button"
        class="filter-pill"
        :class="tab === t.key && 'filter-pill--active'"
        @click="tab = t.key"
      >
        {{ t.label }}
        <span v-if="t.count != null" class="count">{{ t.count }}</span>
      </button>
    </div>

    <!-- Restaurants tab -->
    <template v-if="tab === 'restaurants'">
      <!-- Loading -->
      <div v-if="pending" class="p-card py-16 text-center text-ink-faint">
        Indlaeser restauranter...
      </div>

      <!-- Error -->
      <div v-else-if="error" class="p-card py-16 text-center text-[#8a4838]">
        Kunne ikke indlaese restauranter.
      </div>

      <template v-else>
        <div class="p-table bg-paper border border-line rounded-md overflow-x-auto">
          <table class="w-full border-collapse" style="min-width: 640px;">
            <thead>
              <tr>
                <th>Restaurant</th>
                <th>Slug &middot; /r/</th>
                <th>Status</th>
                <th class="text-right">Handlinger</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in restaurants" :key="r.id">
                <td>
                  <div class="font-display text-[18px] font-normal tracking-[-0.01em]">{{ r.name }}</div>
                </td>
                <td><span class="font-mono text-[13px] tabular-nums">popplate.dk/r/{{ r.slug }}</span></td>
                <td>
                  <span
                    class="status-badge"
                    :class="r.status === 'active' ? 'status-badge--published' : 'status-badge--draft'"
                  >
                    {{ r.status === 'active' ? 'Aktiv' : r.status }}
                  </span>
                </td>
                <td>
                  <div class="flex gap-2 justify-end">
                    <NuxtLink :to="`/platform/r/${r.slug}`" class="icon-btn">
                      <Icon name="arrow-up-right" :size="14" />
                    </NuxtLink>
                    <button
                      v-if="isAdmin"
                      type="button"
                      class="icon-btn text-[#8a4838]"
                      :disabled="deletingSlug === r.slug"
                      @click="handleDeleteRestaurant(r)"
                    >
                      <Icon name="close" :size="14" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!restaurants?.length">
                <td colspan="4" class="text-center py-12 text-ink-faint">
                  Ingen restauranter endnu.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- New restaurant form -->
        <div id="new-restaurant" class="mt-6">
          <div class="p-card">
            <div class="mb-4">
              <h3 class="font-display font-normal text-[22px] tracking-[-0.015em]">Ny restaurant</h3>
            </div>

            <div v-if="errorMessage" class="mb-4 rounded-md border border-[#8a4838]/20 bg-[#8a4838]/5 px-4 py-3 text-sm text-[#8a4838]">
              {{ errorMessage }}
            </div>
            <div v-if="successMessage" class="mb-4 rounded-md border border-[#4a6240]/20 bg-[#4a6240]/5 px-4 py-3 text-sm text-[#4a6240]">
              {{ successMessage }}
            </div>

            <form class="max-w-none" @submit.prevent="handleSubmit">
              <div class="grid grid-cols-2 gap-4 max-[600px]:grid-cols-1">
                <div class="mb-6">
                  <label class="field-label">Navn</label>
                  <input
                    v-model="name"
                    type="text"
                    placeholder="Fx Cafe Solsikken"
                    class="field-input"
                    :disabled="submitting"
                  >
                </div>
                <div class="mb-6">
                  <label class="field-label">URL slug</label>
                  <input
                    type="text"
                    :value="slugPreview"
                    disabled
                    class="field-input"
                  >
                  <div class="field-hint">Bliver til popplate.dk/r/<strong>{{ slugPreview }}</strong></div>
                </div>
              </div>
              <button
                type="submit"
                :disabled="submitting"
                class="top-btn top-btn--primary"
              >
                <span>{{ submitting ? 'Opretter...' : 'Opret restaurant' }}</span>
                <Icon name="arrow" :size="13" />
              </button>
            </form>
          </div>
        </div>
      </template>
    </template>

    <!-- Tier tab -->
    <template v-if="tab === 'tier'">
      <div class="two-col">
        <div>
          <div class="p-card relative overflow-hidden mb-5" style="background: #2b1f15; color: #f3ede2; border: none;">
            <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(circle at 80% 50%, rgba(184, 122, 78, 0.35), transparent 55%);" />
            <div class="relative">
              <div class="mono-label !text-clay-soft mb-3">Nuvaerende tier</div>
              <h3 class="font-display font-normal text-[48px] tracking-[-0.025em]" style="color: #f3ede2;">
                <span class="italic text-clay-soft">Basic</span> &mdash; 499 kr/md
              </h3>
              <p class="mt-3" style="color: rgba(243, 237, 226, 0.7);">
                Op til 30 retter &middot; Eget brand &middot; Analytics &middot; Allergen-maerkning
              </p>
              <div class="mt-6 pt-5 grid grid-cols-3 gap-6 max-[600px]:grid-cols-1" style="border-top: 1px solid rgba(243, 237, 226, 0.12);">
                <div>
                  <div class="mono-label !text-[rgba(243,237,226,0.5)] mb-2">Retter brugt</div>
                  <div class="font-body text-[32px] font-light" style="color: #f3ede2;">
                    {{ apiDishCount }}<span class="text-sm ml-1" style="color: rgba(243, 237, 226, 0.5);">/30</span>
                  </div>
                </div>
                <div>
                  <div class="mono-label !text-[rgba(243,237,226,0.5)] mb-2">Restauranter</div>
                  <div class="font-body text-[32px] font-light" style="color: #f3ede2;">
                    {{ restaurants?.length ?? 0 }}<span class="text-sm ml-1" style="color: rgba(243, 237, 226, 0.5);">/1</span>
                  </div>
                </div>
                <div>
                  <div class="mono-label !text-[rgba(243,237,226,0.5)] mb-2">Naeste betaling</div>
                  <div class="font-body text-[18px] font-medium mt-2" style="color: #f3ede2;">--</div>
                </div>
              </div>
              <div class="flex gap-2.5 mt-5">
                <button type="button" class="top-btn top-btn--clay">Opgrader til Pro</button>
                <button type="button" class="top-btn" style="border-color: rgba(243, 237, 226, 0.3); color: #f3ede2;">Nedgrader</button>
              </div>
            </div>
          </div>

          <div class="p-card">
            <div class="flex justify-between items-center mb-4">
              <h3 class="font-display font-normal text-[22px] tracking-[-0.015em]">Fakturahistorik</h3>
            </div>
            <div class="flex flex-col">
              <div
                v-for="(it, i) in INVOICES" :key="i"
                class="flex gap-3.5 py-3.5 items-center"
                :class="i < INVOICES.length - 1 && 'border-b border-line'"
              >
                <span class="w-2 h-2 rounded-full shrink-0" style="background: #6e7d8b;" />
                <div class="flex-1 text-[13px] text-ink-soft">
                  <strong class="text-ink font-medium">{{ it.split(' · ')[0] }}</strong>
                  &middot; Basic tier &middot; {{ it.split(' · ')[1] }}
                </div>
                <a href="#dl" class="font-mono text-[11px] text-clay-deep">PDF &rarr;</a>
              </div>
            </div>
          </div>
        </div>

        <aside class="p-card">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-display font-normal text-[22px] tracking-[-0.015em]">Betaling</h3>
          </div>
          <div class="py-4 border-b border-line flex justify-between items-center">
            <div>
              <div class="font-mono text-[13px]">VISA &middot; &bull;&bull;&bull;&bull; 4242</div>
              <div class="text-xs text-ink-faint mt-1">Udloeber 09/27</div>
            </div>
            <button type="button" class="top-btn !py-2 !px-3.5 !text-xs">Aendr</button>
          </div>
          <div class="mt-4 text-xs text-ink-faint">
            Faktura sendes automatisk til <strong class="text-ink">{{ user?.email ?? '--' }}</strong> hver maaned.
          </div>
        </aside>
      </div>
    </template>

    <!-- Placeholder tabs -->
    <div v-if="tab !== 'restaurants' && tab !== 'tier'" class="p-card p-16 text-center text-ink-faint">
      <div class="font-display italic text-2xl text-ink mb-2">Kommer snart</div>
      <p>Denne sektion er ikke en del af MVP'en.</p>
    </div>
  </div>
</template>

<style scoped>
.p-table :deep(th),
.p-table :deep(td) {
  @apply text-left px-5 py-3.5 text-sm text-ink border-b border-line;
}
.p-table :deep(th) {
  @apply font-mono text-[10px] uppercase font-medium text-ink-faint bg-card;
  letter-spacing: 0.18em;
}
.p-table :deep(tr:last-child td) { border-bottom: none; }

.icon-btn {
  @apply w-[30px] h-[30px] grid place-items-center rounded-md text-ink-faint transition-colors;
}
.icon-btn:hover {
  background: rgba(26, 20, 16, 0.06);
  color: theme('colors.ink.DEFAULT');
}
</style>
