<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: 'Opret konto · popplate' })

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

<template>
  <main class="min-h-screen grid place-items-center px-5 pb-32 pt-20" data-screen-label="Signup">
    <div class="w-full max-w-[420px]">
      <NuxtLink to="/" class="inline-flex items-center gap-3 font-display italic font-medium text-[28px] text-ink mb-10 tracking-tight">
        <span class="w-8 h-8 inline-block">
          <svg viewBox="0 0 30 30" fill="none" class="w-full h-full">
            <ellipse cx="15" cy="18" rx="13" ry="4" fill="#b87a4e" opacity="0.35" />
            <ellipse cx="15" cy="15" rx="11" ry="3" fill="#8b4e2c" />
            <ellipse cx="15" cy="13" rx="9" ry="2.4" fill="#b87a4e" />
          </svg>
        </span>
        popplate
      </NuxtLink>

      <h1 class="font-display font-normal leading-[1.05] mb-3" style="font-size: clamp(36px, 5vw, 52px); letter-spacing: -0.025em;">
        Kom i gang med <span class="italic text-clay-deep">menu i 3D</span>.
      </h1>
      <p class="text-ink-mute mb-9">14 dages gratis prøve. Ingen binding.</p>

      <div v-if="errorMessage" class="mb-6 flex gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
        <svg class="mt-0.5 h-4 w-4 flex-none" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <span>{{ errorMessage }}</span>
      </div>

      <button
        type="button"
        :disabled="loading"
        class="mt-2 w-full inline-flex items-center justify-center gap-3.5 px-7 py-4 rounded-full bg-ink text-ink-inv font-medium text-[15px] transition hover:bg-clay-deep disabled:cursor-wait disabled:opacity-50"
        @click="handleSignup"
      >
        <svg v-if="loading" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span>{{ loading ? 'Åbner oprettelse...' : 'Opret konto' }}</span>
        <svg v-if="!loading" width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M1 7h12m0 0L8 2m5 5l-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </button>

      <p class="text-center mt-9 text-sm text-ink-mute">
        Har du allerede konto?
        <NuxtLink to="/platform/login" class="text-clay-deep font-medium ml-1">Log ind →</NuxtLink>
      </p>
    </div>
  </main>
</template>
