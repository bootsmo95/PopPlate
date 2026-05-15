<template>
  <main class="min-h-screen bg-stone-50 text-slate-950">
    <section class="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-5 py-10 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
      <div class="hidden lg:block">
        <NuxtLink to="/" class="text-lg font-black tracking-tight text-slate-950">
          PopPlate
        </NuxtLink>

        <div class="mt-16 max-w-xl">
          <p class="mb-5 inline-flex w-fit rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-orange-700">
            Start simple
          </p>
          <h1 class="text-6xl font-black leading-[0.95] tracking-tight">
            Create the first dish page.
          </h1>
          <p class="mt-6 text-lg leading-8 text-slate-600">
            Test PopPlate with one restaurant, one QR-ready dish page, and a clean 3D guest experience.
          </p>
        </div>

        <div class="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-slate-200 pt-6">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Restaurants</p>
            <p class="mt-1 text-2xl font-black">1</p>
          </div>
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Menu items</p>
            <p class="mt-1 text-2xl font-black">5</p>
          </div>
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Plan</p>
            <p class="mt-1 text-2xl font-black">Free</p>
          </div>
        </div>
      </div>

      <div class="mx-auto w-full max-w-md">
        <NuxtLink to="/" class="mb-8 block text-center text-lg font-black tracking-tight text-slate-950 lg:hidden">
          PopPlate
        </NuxtLink>

        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10 sm:p-8">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">Create account</p>
            <h1 class="mt-3 text-3xl font-black tracking-tight text-slate-950">Start with PopPlate</h1>
            <p class="mt-3 text-sm leading-6 text-slate-600">
              Create your account through the secure PopPlate identity page. Your workspace is provisioned after the first sign in.
            </p>
          </div>

          <div v-if="errorMessage" class="mt-6 flex gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
            <svg class="mt-0.5 h-4 w-4 flex-none" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <span>{{ errorMessage }}</span>
          </div>

          <button
            type="button"
            :disabled="loading"
            class="mt-8 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-wait disabled:bg-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:ring-offset-2"
            @click="handleSignup"
          >
            <svg v-if="loading" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ loading ? 'Opening signup...' : 'Continue to account setup' }}
          </button>

          <div class="mt-6 rounded-lg border border-slate-200 bg-stone-50 p-4">
            <p class="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Free plan includes</p>
            <ul class="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <li>1 restaurant workspace</li>
              <li>5 menu items</li>
              <li>1 3D model generation per dish</li>
            </ul>
          </div>

          <p class="mt-6 text-center text-sm text-slate-500">
            Already have an account?
            <NuxtLink to="/platform/login" class="font-bold text-slate-800 hover:underline">Sign in</NuxtLink>
          </p>
        </div>
      </div>
    </section>
  </main>
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
