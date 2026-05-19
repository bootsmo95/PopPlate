<template>
  <div class="min-h-full bg-stone-100 text-slate-900">
    <div class="mx-auto max-w-6xl p-6 md:p-8">
      <section class="relative overflow-hidden rounded-[28px] border border-stone-200 bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.06),_transparent_38%),linear-gradient(135deg,_#fffdf8_0%,_#f5f1e8_100%)] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:p-8">
        <div class="absolute right-0 top-0 h-32 w-32 rounded-full bg-amber-300/20 blur-3xl" />
        <div class="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-emerald-400/10 blur-2xl" />

        <div class="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div class="max-w-2xl">
            <p class="mb-3 inline-flex items-center rounded-full border border-slate-300/70 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">
              Restaurant setup
            </p>
            <h1 class="font-serif text-3xl tracking-tight text-slate-900 md:text-5xl">
              Give PopPlate a restaurant to work with
            </h1>
            <p class="mt-4 max-w-xl text-sm leading-6 text-slate-600 md:text-base">
              Right now dishes are attached to the first restaurant in the database. Create one here,
              and the rest of the platform flow starts behaving like a real product instead of an MVP setup.
            </p>
          </div>

          <div class="grid grid-cols-2 gap-3 rounded-2xl border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur">
            <div>
              <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Restaurants</p>
              <p class="mt-1 text-2xl font-semibold text-slate-900">{{ restaurants?.length ?? 0 }}</p>
            </div>
            <div>
              <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Status</p>
              <p class="mt-1 text-sm font-medium text-slate-800">
                {{ restaurants?.length ? 'Ready for dishes' : 'Needs setup' }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div class="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section class="rounded-[24px] border border-stone-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Create restaurant</p>
              <h2 class="mt-2 font-serif text-2xl text-slate-900">New venue</h2>
            </div>
            <div class="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
              MVP setup
            </div>
          </div>

          <form class="mt-6 space-y-5" @submit.prevent="handleSubmit">
            <div>
              <label for="name" class="mb-2 block text-sm font-medium text-slate-700">Restaurant name</label>
              <input
                id="name"
                v-model="name"
                type="text"
                placeholder="e.g. Café Solsikken"
                class="w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:bg-white focus:ring-4 focus:ring-slate-200"
                :disabled="submitting"
              >
              <p class="mt-2 text-xs text-slate-500">
                Slug preview: <span class="font-medium text-slate-700">{{ slugPreview }}</span>
              </p>
            </div>

            <div v-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {{ errorMessage }}
            </div>

            <div v-if="successMessage" class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {{ successMessage }}
            </div>

            <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="submit"
                :disabled="submitting"
                class="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {{ submitting ? 'Creating…' : 'Create restaurant' }}
              </button>

              <NuxtLink
                to="/platform/dishes/new"
                class="inline-flex items-center justify-center rounded-2xl border border-stone-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-stone-50"
              >
                Continue to dishes
              </NuxtLink>
            </div>
          </form>
        </section>

        <section class="rounded-[24px] border border-stone-200 bg-[#161616] p-6 text-stone-100 shadow-[0_10px_35px_rgba(15,23,42,0.12)]">
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Existing restaurants</p>
              <h2 class="mt-2 font-serif text-2xl text-white">Current records</h2>
            </div>
            <div class="h-px flex-1 bg-gradient-to-r from-stone-700 to-transparent" />
          </div>

          <div v-if="pending" class="mt-6 text-sm text-stone-400">Loading restaurants…</div>
          <div v-else-if="error" class="mt-6 rounded-2xl border border-rose-900/60 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">
            Failed to load restaurants.
          </div>
          <div v-else-if="!restaurants?.length" class="mt-6 rounded-[22px] border border-dashed border-stone-700 bg-white/5 p-6 text-sm text-stone-300">
            No restaurants yet. Create the first one on the left and PopPlate can start attaching dishes correctly.
          </div>
          <div v-else class="mt-6 space-y-3">
            <article
              v-for="restaurant in restaurants"
              :key="restaurant.id"
              class="rounded-[22px] border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <h3 class="text-base font-semibold text-white">{{ restaurant.name }}</h3>
                  <p class="mt-1 text-xs uppercase tracking-[0.18em] text-stone-400">/{{ restaurant.slug }}</p>
                </div>
                <span class="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                  {{ restaurant.status }}
                </span>
              </div>

              <div class="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3">
                <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">Full menu</p>
                    <p class="mt-1 break-all text-sm text-stone-300">/r/{{ restaurant.slug }}</p>
                  </div>

                  <NuxtLink
                    :to="`/r/${restaurant.slug}`"
                    class="inline-flex items-center justify-center rounded-full bg-orange-400 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-orange-300"
                  >
                    Open menu
                  </NuxtLink>
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'platform' })

interface Restaurant {
  id: string
  name: string
  slug: string
  status: string
}

const name = ref('')
const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const ssrHeaders = useAuthHeaders()
const { data: restaurants, pending, error, refresh } = await useFetch<Restaurant[]>('/api/restaurants', { headers: ssrHeaders })

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

async function handleSubmit() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!name.value.trim()) {
    errorMessage.value = 'Please enter a restaurant name.'
    return
  }

  submitting.value = true

  try {
    const created = await $fetch<Restaurant>('/api/restaurants', {
      method: 'POST',
      body: { name: name.value },
    })

    successMessage.value = `Created ${created.name}. You can head straight to dishes now.`
    name.value = ''
    await refresh()
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    errorMessage.value = e?.data?.message ?? e?.message ?? 'Failed to create restaurant.'
  } finally {
    submitting.value = false
  }
}
</script>
