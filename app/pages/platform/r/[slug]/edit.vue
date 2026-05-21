<script setup lang="ts">
import TopBar from '~/components/platform/TopBar.vue'
import PageHead from '~/components/platform/PageHead.vue'
import Icon from '~/components/shared/Icon.vue'

definePageMeta({ layout: 'platform' })

interface RestaurantDetail {
  id: string
  name: string
  slug: string
  status: string
  tagline: string | null
  address: string | null
  city: string | null
  openingHours: string | null
}

const route = useRoute()
const slug = computed(() => String(route.params.slug))
const ssrHeaders = useAuthHeaders()

const { data: restaurant, pending, error } = useLazyFetch<RestaurantDetail>(
  () => '/api/restaurants/' + slug.value,
  { headers: ssrHeaders },
)

useHead({ title: computed(() => restaurant.value ? `Rediger ${restaurant.value.name} · popplate` : 'Rediger · popplate') })

const form = reactive({
  name: '',
  tagline: '',
  address: '',
  city: '',
  openingHours: '',
})

watch(restaurant, (r) => {
  if (r) {
    form.name = r.name
    form.tagline = r.tagline ?? ''
    form.address = r.address ?? ''
    form.city = r.city ?? ''
    form.openingHours = r.openingHours ?? ''
  }
}, { immediate: true })

const saving = ref(false)
const saveError = ref('')
const saved = ref(false)

async function handleSave() {
  if (!restaurant.value) return

  saving.value = true
  saveError.value = ''
  saved.value = false

  try {
    await $fetch('/api/restaurants/' + restaurant.value.slug, {
      method: 'PATCH',
      body: {
        name: form.name,
        tagline: form.tagline || null,
        address: form.address || null,
        city: form.city || null,
        openingHours: form.openingHours || null,
      },
    })
    saved.value = true
    setTimeout(() => { saved.value = false }, 3000)
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    saveError.value = e?.data?.message ?? e?.message ?? 'Kunne ikke gemme.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div data-screen-label="Rediger restaurant">
    <TopBar />

    <PageSkeleton v-if="pending" variant="dashboard" />

    <div v-else-if="error" class="p-card py-16 text-center text-[#8a4838]">
      Kunne ikke indlaese restaurant.
    </div>

    <template v-else-if="restaurant">
      <PageHead eyebrow="Rediger">
        <template #title>
          <h1 class="page-title"><span class="accent">{{ restaurant.name }}</span></h1>
        </template>
        <template #sub>
          <p class="text-ink-mute mt-3 text-[15px] max-w-[480px]">
            Opdater restaurantens info. Synligt pa den offentlige menu-side.
          </p>
        </template>
        <template #actions>
          <NuxtLink :to="`/platform/r/${restaurant.slug}`" class="top-btn">
            <Icon name="arrow-left" :size="14" />
            <span>Tilbage</span>
          </NuxtLink>
        </template>
      </PageHead>

      <form class="max-w-[640px] space-y-6" @submit.prevent="handleSave">
        <!-- Name -->
        <div>
          <label class="field-label" for="r-name">Navn</label>
          <input id="r-name" v-model="form.name" type="text" class="field-input" required />
        </div>

        <!-- Tagline -->
        <div>
          <label class="field-label" for="r-tagline">Kort beskrivelse</label>
          <input id="r-tagline" v-model="form.tagline" type="text" class="field-input" placeholder="Fx: Moderne nordisk kokken i hjertet af Kobenhavn" />
          <div class="field-hint">En kort teaser der vises pa menu-siden.</div>
        </div>

        <!-- Address -->
        <div>
          <label class="field-label" for="r-address">Adresse</label>
          <input id="r-address" v-model="form.address" type="text" class="field-input" placeholder="Fx: Nyhavn 42" />
        </div>

        <!-- City -->
        <div>
          <label class="field-label" for="r-city">By</label>
          <input id="r-city" v-model="form.city" type="text" class="field-input" placeholder="Fx: Kobenhavn K" />
        </div>

        <!-- Opening hours -->
        <div>
          <label class="field-label" for="r-hours">Abningstider</label>
          <textarea id="r-hours" v-model="form.openingHours" class="field-textarea" rows="3" placeholder="Fx: Man-Fre 11:30-22:00&#10;Lor-Son 10:00-23:00" />
          <div class="field-hint">Fritekst -- skriv abningstider som de skal vises.</div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-4 pt-2">
          <button type="submit" :disabled="saving || !form.name.trim()" class="top-btn top-btn--primary">
            {{ saving ? 'Gemmer...' : 'Gem aendringer' }}
          </button>
          <span v-if="saved" class="text-sm text-green-700 font-medium">Gemt!</span>
          <span v-if="saveError" class="text-sm text-[#8a4838]">{{ saveError }}</span>
        </div>
      </form>
    </template>
  </div>
</template>
