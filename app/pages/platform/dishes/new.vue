<template>
  <div class="p-6 max-w-2xl">
    <div class="mb-6">
      <NuxtLink to="/platform/dishes" class="text-sm text-gray-500 hover:text-gray-700">
        ← Back to Dishes
      </NuxtLink>
    </div>

    <h1 class="text-2xl font-bold text-gray-900 mb-6">Create New Dish</h1>

    <!-- No restaurants -->
    <div v-if="!restaurantsPending && (!restaurants || restaurants.length === 0)" class="text-center py-12">
      <p class="text-gray-600 mb-3">You need a restaurant before creating dishes.</p>
      <NuxtLink
        to="/platform/settings"
        class="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-700"
      >
        Set up restaurant →
      </NuxtLink>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-5">
      <!-- Restaurant selector (if multiple) -->
      <div v-if="restaurants && restaurants.length > 1">
        <label for="restaurantId" class="block text-sm font-medium text-gray-700 mb-1">
          Restaurant <span class="text-red-500">*</span>
        </label>
        <select
          id="restaurantId"
          v-model="form.restaurantId"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
        >
          <option v-for="r in restaurants" :key="r.id" :value="r.id">{{ r.name }}</option>
        </select>
      </div>

      <!-- Name -->
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
          Name <span class="text-red-500">*</span>
        </label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          required
          placeholder="e.g. Grilled Salmon"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
        />
      </div>

      <!-- Short Description -->
      <div>
        <label for="shortDescription" class="block text-sm font-medium text-gray-700 mb-1">
          Short Description
        </label>
        <textarea
          id="shortDescription"
          v-model="form.shortDescription"
          rows="2"
          placeholder="A brief description shown to guests"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none"
        />
      </div>

      <!-- Price -->
      <div>
        <label for="priceText" class="block text-sm font-medium text-gray-700 mb-1">
          Price
        </label>
        <input
          id="priceText"
          v-model="form.priceText"
          type="text"
          placeholder="e.g. £18.50"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
        />
      </div>

      <!-- Allergens -->
      <div>
        <label for="allergens" class="block text-sm font-medium text-gray-700 mb-1">
          Allergens
        </label>
        <input
          id="allergens"
          v-model="form.allergens"
          type="text"
          placeholder="e.g. Fish, Gluten"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
        />
      </div>

      <!-- Ingredients -->
      <div>
        <label for="ingredients" class="block text-sm font-medium text-gray-700 mb-1">
          Ingredients
        </label>
        <textarea
          id="ingredients"
          v-model="form.ingredients"
          rows="3"
          placeholder="List of ingredients"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none"
        />
      </div>

      <!-- Error -->
      <p v-if="errorMsg" class="text-red-600 text-sm">{{ errorMsg }}</p>

      <!-- Submit -->
      <button
        type="submit"
        :disabled="loading"
        class="w-full sm:w-auto px-6 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-400 text-white text-sm font-semibold rounded-lg transition-colors"
      >
        {{ loading ? 'Creating…' : 'Create Dish' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'platform' })

interface Restaurant {
  id: string
  name: string
}

const ssrHeaders = useAuthHeaders()
const { data: restaurants, pending: restaurantsPending } = await useFetch<Restaurant[]>('/api/restaurants', { headers: ssrHeaders })
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
    errorMsg.value = e?.data?.message ?? e?.message ?? 'Failed to create dish.'
  } finally {
    loading.value = false
  }
}
</script>
