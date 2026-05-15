<template>
  <main class="min-h-screen bg-stone-50 text-slate-950">
    <section class="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-5 py-10 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
      <div class="hidden lg:block">
        <NuxtLink to="/" class="text-lg font-black tracking-tight text-slate-950">
          PopPlate
        </NuxtLink>

        <div class="mt-16 max-w-xl">
          <p class="mb-5 inline-flex w-fit rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-orange-700">
            Restaurant platform
          </p>
          <h1 class="text-6xl font-black leading-[0.95] tracking-tight">
            Back to your dish pages.
          </h1>
          <p class="mt-6 text-lg leading-8 text-slate-600">
            Manage menu items, 3D previews, QR links, and restaurant details from one focused workspace.
          </p>
        </div>

        <div class="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-slate-200 pt-6">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Preview</p>
            <p class="mt-1 text-2xl font-black">3D</p>
          </div>
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Publish</p>
            <p class="mt-1 text-2xl font-black">QR</p>
          </div>
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Serve</p>
            <p class="mt-1 text-2xl font-black">AR</p>
          </div>
        </div>
      </div>

      <div class="mx-auto w-full max-w-md">
        <NuxtLink to="/" class="mb-8 block text-center text-lg font-black tracking-tight text-slate-950 lg:hidden">
          PopPlate
        </NuxtLink>

        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10 sm:p-8">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">Secure sign in</p>
            <h1 class="mt-3 text-3xl font-black tracking-tight text-slate-950">PopPlate Platform</h1>
            <p class="mt-3 text-sm leading-6 text-slate-600">
              Continue through the secure PopPlate identity page to access your restaurant workspace.
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
            @click="handleLogin"
          >
            <svg v-if="loading" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ loading ? 'Opening secure login...' : 'Continue to secure login' }}
          </button>

          <div class="mt-6 rounded-lg border border-slate-200 bg-stone-50 p-4">
            <p class="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Protected by</p>
            <p class="mt-2 text-sm leading-6 text-slate-600">
              Single sign-on, secure sessions, and account provisioning are handled outside the app.
            </p>
          </div>

          <p class="mt-6 text-center text-sm text-slate-500">
            Need an account?
            <NuxtLink to="/platform/signup" class="font-bold text-slate-800 hover:underline">Start free</NuxtLink>
          </p>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const route = useRoute()
const { login } = useAuth()

const loading = ref(false)
const errorMessage = computed(() => {
  const error = route.query.error
  return typeof error === 'string' ? error : ''
})

async function handleLogin() {
  loading.value = true

  try {
    await login('/platform/dishes')
  } finally {
    loading.value = false
  }
}
</script>
