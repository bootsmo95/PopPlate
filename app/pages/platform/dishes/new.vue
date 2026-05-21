<template>
  <div data-screen-label="Create dish">
    <TopBar :show-search="false" cta-label="Gem kladde" cta-href="#save" />

    <PageHead back-href="/platform/dishes" back-label="Tilbage til retter">
      <template #title>
        <h1 class="page-title">Ny <span class="accent">ret</span>.</h1>
      </template>
      <template #sub>
        <p class="text-ink-mute mt-3 text-[15px] max-w-[480px]">
          Udfyld detaljer og opret retten. Upload billeder og start 3D-generation bagefter.
        </p>
      </template>
    </PageHead>

    <!-- No restaurants guard -->
    <div v-if="!restaurantsPending && (!restaurants || restaurants.length === 0)" class="text-center py-12">
      <p class="text-ink-mute mb-3">You need a restaurant before creating dishes.</p>
      <NuxtLink
        to="/platform/settings"
        class="top-btn top-btn--primary !inline-flex"
      >
        Set up restaurant &rarr;
      </NuxtLink>
    </div>

    <div v-else class="two-col">
      <form class="max-w-none" @submit.prevent="handleSubmit">
        <!-- Detaljer -->
        <div class="p-card">
          <div class="mb-4">
            <h3 class="font-display font-normal text-[22px] tracking-[-0.015em]">Detaljer</h3>
          </div>

          <!-- Restaurant selector -->
          <div v-if="restaurants && restaurants.length > 1" class="mb-6">
            <label class="field-label">Restaurant <span class="text-[#a85a48]">*</span></label>
            <select v-model="form.restaurantId" class="field-select" required>
              <option v-for="r in restaurants" :key="r.id" :value="r.id">{{ r.name }}</option>
            </select>
          </div>

          <div class="mb-6">
            <label class="field-label">Navn på ret <span class="text-[#a85a48]">*</span></label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="Fx Grilled Salmon"
              class="field-input"
            >
            <div class="field-hint">Det er det navn gæsten ser på menukortet.</div>
          </div>
          <div class="mb-6">
            <label class="field-label">Kort beskrivelse</label>
            <textarea
              v-model="form.shortDescription"
              placeholder="Beskriv retten, dens råvarer og det der gør den særlig..."
              class="field-textarea"
            />
            <div class="field-hint">2-4 linjer. Vises i menumodalen og på enkelt-ret-siden.</div>
          </div>
          <div class="grid grid-cols-2 gap-4 max-[600px]:grid-cols-1">
            <div class="mb-6">
              <label class="field-label">Pris</label>
              <input v-model="form.priceText" type="text" placeholder="e.g. 245 kr" class="field-input">
            </div>
          </div>
          <div class="mb-6">
            <label class="field-label">Allergener</label>
            <input
              v-model="form.allergens"
              type="text"
              placeholder="e.g. Fish, Gluten"
              class="field-input"
            >
            <div class="field-hint">Komma-separeret. Vises som chips på menuen.</div>
          </div>
          <div class="mb-6">
            <label class="field-label">Ingredienser</label>
            <input
              v-model="form.ingredients"
              type="text"
              placeholder="e.g. Salmon, lemon, dill"
              class="field-input"
            >
            <div class="field-hint">Komma-separeret. Bruges af AI til at forstå retten.</div>
          </div>
        </div>

        <!-- Billeder placeholder -->
        <div class="p-card mt-5">
          <div class="mb-4">
            <h3 class="font-display font-normal text-[22px] tracking-[-0.015em]">Billeder</h3>
          </div>
          <div class="dropzone" style="pointer-events: none; opacity: 0.6;">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" class="mx-auto mb-4">
              <rect x="3" y="6" width="34" height="28" rx="2" stroke="#b87a4e" stroke-width="1.5" />
              <circle cx="12" cy="16" r="3" stroke="#b87a4e" stroke-width="1.5" />
              <path d="M3 28l8-8 6 6 5-5 10 10" stroke="#b87a4e" stroke-width="1.5" stroke-linejoin="round" />
            </svg>
            <h4 class="font-display font-normal text-[22px] tracking-[-0.015em] mb-2">
              Billeder tilføjes efter oprettelse
            </h4>
            <p class="text-[13px] text-ink-mute mb-3.5">Opret retten først, upload billeder bagefter på redigerings-siden.</p>
          </div>
        </div>

        <!-- Error -->
        <p v-if="errorMsg" class="text-red-600 text-sm mt-4">{{ errorMsg }}</p>

        <div class="flex gap-3 mt-6">
          <ActionButton variant="primary" type="submit" :loading="loading" class="flex-1 !justify-center !py-4 !text-[15px]">
            <span>Opret ret</span>
            <Icon name="arrow" :size="13" />
          </ActionButton>
          <NuxtLink to="/platform/dishes" class="top-btn !py-4 !px-6">Annuller</NuxtLink>
        </div>
      </form>

      <!-- Guidelines aside -->
      <aside class="sticky top-6">
        <div class="p-card relative overflow-hidden" style="background: #2b1f15; color: #f3ede2; border: none;">
          <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(circle at 80% 50%, rgba(184, 122, 78, 0.35), transparent 55%);" />
          <div class="relative">
            <div class="mono-label !text-clay-soft mb-3.5">Tips til billeder</div>
            <h3 class="font-display font-normal text-2xl tracking-[-0.015em] mb-4" style="color: #f3ede2;">
              Sådan får I de <span class="italic text-clay-soft">bedste</span> 3D-modeller.
            </h3>
            <ol class="m-0 p-0 list-none text-sm leading-[1.6]" style="color: rgba(243, 237, 226, 0.8);">
              <li
                v-for="(t, i) in TIPS" :key="t[0]"
                :class="i < TIPS.length - 1 && 'pb-3.5 mb-3.5 border-b'"
                style="border-color: rgba(243, 237, 226, 0.1);"
              >
                <strong class="block mb-1" style="color: #f3ede2;">{{ t[0] }} — {{ t[1] }}</strong>
                {{ t[2] }}
              </li>
            </ol>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import TopBar from '~/components/platform/TopBar.vue'
import PageHead from '~/components/platform/PageHead.vue'
import Icon from '~/components/shared/Icon.vue'
import ActionButton from '~/components/shared/ActionButton.vue'

definePageMeta({ layout: 'platform' })

const { toast } = useToast()

interface Restaurant {
  id: string
  name: string
}

const ssrHeaders = useAuthHeaders()
const { data: restaurants, pending: restaurantsPending } = useLazyFetch<Restaurant[]>('/api/restaurants', { headers: ssrHeaders })
const route = useRoute()

const form = reactive({
  restaurantId: '',
  name: '',
  shortDescription: '',
  priceText: '',
  allergens: '',
  ingredients: '',
})

// Auto-select first restaurant
watch(
  () => restaurants.value,
  (list) => {
    if (list?.length && !form.restaurantId) {
      const restaurantIdFromQuery = typeof route.query.restaurantId === 'string' ? route.query.restaurantId : ''
      const matchingRestaurant = list.find(restaurant => restaurant.id === restaurantIdFromQuery)
      form.restaurantId = matchingRestaurant?.id ?? list[0].id
    }
  },
  { immediate: true },
)

const loading = ref(false)
const errorMsg = ref('')

async function handleSubmit() {
  if (!form.name.trim()) {
    errorMsg.value = 'Name is required.'
    return
  }
  if (!form.restaurantId) {
    errorMsg.value = 'Please select a restaurant.'
    return
  }

  loading.value = true
  errorMsg.value = ''

  try {
    const dish = await $fetch<{ id: string }>('/api/dishes', {
      method: 'POST',
      body: {
        name: form.name.trim(),
        shortDescription: form.shortDescription.trim() || undefined,
        priceText: form.priceText.trim() || undefined,
        allergens: form.allergens.trim() || undefined,
        ingredients: form.ingredients.trim() || undefined,
        restaurantId: form.restaurantId,
      },
    })

    await navigateTo(`/platform/dishes/${dish.id}`)
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    toast.error(e?.data?.message ?? 'Noget gik galt — prøv igen')
  } finally {
    loading.value = false
  }
}

const TIPS = [
  ['01', 'Naturligt lys', 'Tag billeder i naturligt dagslys, ikke under varme spots.'],
  ['02', 'Flere vinkler', 'Top-down, 3/4 over, lige fra siden. Gerne tæt-på detaljer.'],
  ['03', 'Roligt baggrund', 'En ensfarvet dug eller en stenflise virker bedre end et travlt bord.'],
  ['04', 'Skarp fokus', 'Telefonkameraets billede skal være knivskarpt på selve retten.'],
] as const
</script>
