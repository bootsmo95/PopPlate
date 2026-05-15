<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    <div class="w-full max-w-sm bg-white rounded-xl shadow-md p-8">
      <div class="mb-8 text-center">
        <h1 class="text-2xl font-bold text-gray-900">Create Account</h1>
        <p class="mt-1 text-sm text-gray-500">Provision users through Authentik</p>
      </div>

      <div class="space-y-5">
        <div class="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          New users should be created through Authentik. Once they complete signup there, PopPlate will auto-provision their local profile on first login.
        </div>

        <div v-if="errorMessage" class="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
          <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          {{ errorMessage }}
        </div>

        <button
          type="button"
          :disabled="loading"
          class="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-400 text-white text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-600"
          @click="handleSignup"
        >
          <svg v-if="loading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ loading ? 'Redirecting…' : 'Continue to Authentik signup' }}
        </button>

        <div class="rounded-lg bg-gray-50 border border-gray-200 p-3 text-xs text-gray-600 space-y-1.5">
          <p class="font-semibold text-gray-700">Free plan includes:</p>
          <ul class="space-y-0.5">
            <li>1 restaurant</li>
            <li>5 menu items</li>
            <li>1 3D model generation per dish</li>
          </ul>
        </div>

        <p class="text-center text-sm text-gray-500">
          Already have an account?
          <NuxtLink to="/platform/login" class="text-slate-700 font-medium hover:underline">Sign in</NuxtLink>
        </p>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const route = useRoute()
const { signup } = useAuth()

const loading = ref(false)
const errorMessage = computed(() => {
  const error = route.query.error
  return typeof error === 'string' ? error : ''
})

async function handleSignup() {
  loading.value = true

  try {
    await signup('/platform/settings')
  } finally {
    loading.value = false
  }
}
</script>
