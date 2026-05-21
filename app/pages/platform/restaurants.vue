<script setup lang="ts">
import TopBar from '~/components/platform/TopBar.vue'
import PageHead from '~/components/platform/PageHead.vue'
import Icon from '~/components/shared/Icon.vue'

definePageMeta({ layout: 'platform' })
useHead({ title: 'Restauranter · popplate' })

interface ApiRestaurant {
  id: string
  name: string
  slug: string
  status: string
  createdAt: string
}

const ssrHeaders = useAuthHeaders()
const { user } = useAuth()
const isAdmin = computed(() => user.value?.role === 'admin')

const { data: restaurants, pending, error, refresh } = useLazyFetch<ApiRestaurant[]>('/api/restaurants', { headers: ssrHeaders })

const search = ref('')

const filtered = computed(() =>
  (restaurants.value ?? []).filter((r) => {
    if (search.value && !r.name.toLowerCase().includes(search.value.toLowerCase())) return false
    return true
  }),
)

// Create form
const showCreate = ref(false)
const name = ref('')
const submitting = ref(false)
const errorMessage = ref('')
const deletingSlug = ref('')

const slugPreview = computed(() => {
  const slug = name.value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
  return slug || 'restaurant-name'
})

async function handleCreate() {
  errorMessage.value = ''

  if (!name.value.trim()) {
    errorMessage.value = 'Indtast venligst et restaurantnavn.'
    return
  }

  submitting.value = true

  try {
    await $fetch<ApiRestaurant>('/api/restaurants', {
      method: 'POST',
      body: { name: name.value },
    })
    name.value = ''
    showCreate.value = false
    await refresh()
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    errorMessage.value = e?.data?.message ?? e?.message ?? 'Kunne ikke oprette restaurant.'
  } finally {
    submitting.value = false
  }
}

async function handleDelete(restaurant: ApiRestaurant) {
  if (!confirm('Slet denne restaurant permanent? Dette sletter også alle retter, QR-koder, analytics, jobs og billeddata.')) return

  deletingSlug.value = restaurant.slug

  try {
    await $fetch('/api/restaurants/' + restaurant.slug, {
      method: 'DELETE',
      query: { hard: 'true' },
    })
    await refresh()
  } finally {
    deletingSlug.value = ''
  }
}
</script>

<template>
  <div data-screen-label="Restaurants">
    <TopBar v-model:search="search" cta-label="Ny restaurant" cta-href="#create" search-placeholder="Søg restauranter…" />

    <PageHead :eyebrow="`${restaurants?.length ?? 0} restauranter`">
      <template #title>
        <h1 class="page-title">Dine <span class="accent">restauranter</span>.</h1>
      </template>
      <template #sub>
        <p class="text-ink-mute mt-3 text-[15px] max-w-[480px]">
          Administrer restauranter, se menuer og tilføj nye.
        </p>
      </template>
      <template #actions>
        <button type="button" class="top-btn top-btn--primary" @click="showCreate = !showCreate">
          <Icon name="plus" :size="14" /><span>Ny restaurant</span>
        </button>
      </template>
    </PageHead>

    <!-- Create form (inline, like dishes/new) -->
    <Transition name="slide">
      <div v-if="showCreate" id="create" class="p-card mb-6">
        <div class="mb-4">
          <h3 class="font-display font-normal text-[22px] tracking-[-0.015em]">Ny restaurant</h3>
        </div>

        <div v-if="errorMessage" class="mb-4 rounded-md border border-[#8a4838]/20 bg-[#8a4838]/5 px-4 py-3 text-sm text-[#8a4838]">
          {{ errorMessage }}
        </div>

        <form class="max-w-none" @submit.prevent="handleCreate">
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
          <div class="flex gap-2.5">
            <button
              type="submit"
              :disabled="submitting"
              class="top-btn top-btn--primary"
            >
              <span>{{ submitting ? 'Opretter...' : 'Opret restaurant' }}</span>
              <Icon name="arrow" :size="13" />
            </button>
            <button type="button" class="top-btn" @click="showCreate = false">
              Annuller
            </button>
          </div>
        </form>
      </div>
    </Transition>

    <!-- Loading -->
    <PageSkeleton v-if="pending" variant="list" />

    <!-- Error -->
    <div v-else-if="error" class="p-card py-16 text-center text-[#8a4838]">
      Kunne ikke indlæse restauranter.
    </div>

    <template v-else>
      <!-- Empty state -->
      <div v-if="!restaurants?.length" class="p-card py-16 text-center">
        <h3 class="font-display font-normal text-[22px] tracking-[-0.015em] mb-2">Ingen restauranter endnu</h3>
        <p class="text-ink-mute text-[15px] mb-6">Opret din første restaurant for at komme i gang.</p>
        <button type="button" class="top-btn top-btn--primary" @click="showCreate = true">
          <Icon name="plus" :size="14" /><span>Ny restaurant</span>
        </button>
      </div>

      <!-- Restaurant list -->
      <div v-else class="rounded-md border border-line bg-paper overflow-hidden">
        <div
          v-for="r in filtered"
          :key="r.id"
          class="flex items-center gap-4 px-5 py-4 border-b border-line last:border-0 transition-colors hover:bg-card/50"
        >
          <!-- Icon -->
          <div class="w-10 h-10 rounded-md grid place-items-center shrink-0" style="background: linear-gradient(135deg, #2b1f15, #8b4e2c);">
            <Icon name="restaurant" :size="16" class="text-clay-soft" />
          </div>

          <!-- Info -->
          <NuxtLink :to="`/platform/r/${r.slug}`" class="flex-1 min-w-0">
            <div class="font-display text-[18px] font-normal tracking-[-0.01em] truncate">{{ r.name }}</div>
            <div class="font-mono text-[12px] text-ink-faint tabular-nums">popplate.dk/r/{{ r.slug }}</div>
          </NuxtLink>

          <!-- Status -->
          <span
            class="status-badge shrink-0"
            :class="r.status === 'active' ? 'status-badge--published' : 'status-badge--draft'"
          >
            {{ r.status === 'active' ? 'Aktiv' : r.status }}
          </span>

          <!-- Actions -->
          <div class="flex gap-1.5 shrink-0">
            <NuxtLink :to="`/platform/r/${r.slug}`" class="icon-btn" title="Åbn">
              <Icon name="arrow-up-right" :size="14" />
            </NuxtLink>
            <NuxtLink :to="`/r/${r.slug}`" target="_blank" class="icon-btn" title="Se menu">
              <Icon name="qr" :size="14" />
            </NuxtLink>
            <button
              v-if="isAdmin"
              type="button"
              class="icon-btn text-[#8a4838]"
              :disabled="deletingSlug === r.slug"
              title="Slet"
              @click="handleDelete(r)"
            >
              <Icon name="close" :size="14" />
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.icon-btn {
  @apply w-[30px] h-[30px] grid place-items-center rounded-md text-ink-faint transition-colors;
}
.icon-btn:hover {
  background: rgba(26, 20, 16, 0.06);
  color: theme('colors.ink.DEFAULT');
}

.slide-enter-active { transition: all 200ms ease-out; }
.slide-leave-active { transition: all 150ms ease-in; }
.slide-enter-from, .slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
