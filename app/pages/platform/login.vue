<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: 'Log ind · popplate' })

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

<template>
  <div class="auth-shell" data-screen-label="Login">
    <!-- Form side -->
    <div class="auth-form-side">
      <NuxtLink to="/" class="auth-logo">
        <span class="w-[26px] h-[26px] inline-block">
          <svg viewBox="0 0 30 30" fill="none" class="w-full h-full">
            <ellipse cx="15" cy="18" rx="13" ry="4" fill="#b87a4e" opacity="0.35" />
            <ellipse cx="15" cy="15" rx="11" ry="3" fill="#8b4e2c" />
            <ellipse cx="15" cy="13" rx="9" ry="2.4" fill="#b87a4e" />
          </svg>
        </span>
        popplate
      </NuxtLink>

      <div class="auth-card">
        <div class="auth-eyebrow">Log ind</div>
        <h1 class="auth-title">
          Velkommen <span class="italic text-clay-deep">tilbage</span>.
        </h1>
        <p class="auth-sub">Log ind via sikker single sign-on for at administrere jeres menu og 3D-modeller.</p>

        <div v-if="errorMessage" class="mb-6 flex gap-3 rounded-lg border border-[#a85a48]/20 bg-[#a85a48]/5 px-4 py-3 text-sm leading-6 text-[#8a4838]">
          <svg class="mt-0.5 h-4 w-4 flex-none" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <span>{{ errorMessage }}</span>
        </div>

        <button
          type="button"
          :disabled="loading"
          class="auth-sso"
          @click="handleLogin"
        >
          <svg v-if="loading" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>{{ loading ? 'Åbner sikkert login...' : 'Fortsæt til sikkert login' }}</span>
          <svg v-if="!loading" width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M1 7h12m0 0L8 2m5 5l-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </button>

        <p class="text-center mt-9 text-sm text-ink-mute">
          Ny på popplate?
          <NuxtLink to="/platform/signup" class="text-clay-deep font-medium ml-1">Opret konto →</NuxtLink>
        </p>
      </div>

      <div class="auth-foot">
        <span>&copy; 2026 popplate ApS</span>
        <a href="#">Vilkår</a>
      </div>
    </div>

    <!-- Visual side -->
    <div class="auth-visual">
      <div class="auth-visual-grid" />
      <div class="auth-visual-wordmark">popplate.</div>
      <div class="auth-model-frame">
        <div class="auth-model-orb" />
      </div>
      <div class="auth-credit">
        <div class="auth-credit-tag">popplate · 3D Menu</div>
        <div class="auth-credit-quote">
          Gæsten kan se retten i <span class="italic text-clay-soft">fuld størrelse</span> — før den ankommer.
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1.2fr;
}
@media (max-width: 900px) { .auth-shell { grid-template-columns: 1fr; } }

.auth-form-side {
  padding: 48px 60px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
@media (max-width: 720px) { .auth-form-side { padding: 32px 24px; } }

.auth-logo {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-family: theme('fontFamily.display');
  font-style: italic;
  font-weight: 500;
  font-size: 24px;
  letter-spacing: -0.02em;
  color: theme('colors.ink.DEFAULT');
  margin-bottom: 80px;
}

.auth-card {
  margin: auto 0;
  width: 100%;
  max-width: 440px;
}
.auth-eyebrow {
  @apply font-mono text-[11px] uppercase font-medium text-clay-deep mb-4;
  letter-spacing: 0.22em;
}
.auth-title {
  font-family: theme('fontFamily.display');
  font-weight: 400;
  font-size: 56px;
  letter-spacing: -0.03em;
  line-height: 0.96;
  margin-bottom: 18px;
}
.auth-sub {
  color: theme('colors.ink.mute');
  margin-bottom: 40px;
  font-size: 15px;
  line-height: 1.55;
}
.auth-sso {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding: 16px;
  background: theme('colors.ink.DEFAULT');
  color: theme('colors.ink.inv');
  border-radius: 999px;
  font-family: theme('fontFamily.body');
  font-weight: 500;
  font-size: 15px;
  transition: background 200ms;
  border: none;
  cursor: pointer;
}
.auth-sso:hover { background: theme('colors.clay.deep'); }
.auth-sso:disabled { cursor: wait; opacity: 0.5; }

.auth-foot {
  margin-top: auto;
  padding-top: 40px;
  font-size: 13px;
  color: theme('colors.ink.mute');
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}
.auth-foot a {
  color: theme('colors.ink.DEFAULT');
  text-decoration: underline;
  text-decoration-color: theme('colors.clay.DEFAULT');
  text-underline-offset: 4px;
}

/* Visual panel */
.auth-visual {
  position: relative;
  background: theme('colors.deep');
  overflow: hidden;
  display: grid;
  place-items: center;
}
@media (max-width: 900px) { .auth-visual { display: none; } }
.auth-visual::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 40%, rgba(184, 122, 78, 0.4), transparent 60%);
}
.auth-visual-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  mask: radial-gradient(circle at center, black 30%, transparent 80%);
  -webkit-mask: radial-gradient(circle at center, black 30%, transparent 80%);
}
.auth-visual-wordmark {
  font-family: theme('fontFamily.display');
  font-style: italic;
  font-weight: 500;
  font-size: 20vw;
  letter-spacing: -0.05em;
  color: rgba(243, 237, 226, 0.07);
  position: absolute;
  white-space: nowrap;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}
.auth-model-frame {
  position: relative;
  z-index: 2;
  width: min(300px, 50%);
  aspect-ratio: 1;
}
.auth-model-orb {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background:
    radial-gradient(circle at 30% 25%, rgba(255,255,255,0.3), transparent 50%),
    radial-gradient(circle at 60% 60%, theme('colors.clay.deep'), theme('colors.clay.DEFAULT') 60%, theme('colors.clay.soft'));
  box-shadow: 0 50px 100px rgba(0, 0, 0, 0.6), inset 0 6px 20px rgba(255, 255, 255, 0.1);
  animation: floatOrb 6s ease-in-out infinite;
}
@keyframes floatOrb {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-16px); }
}
.auth-credit {
  position: absolute;
  bottom: 40px;
  left: 40px;
  right: 40px;
  z-index: 3;
  color: rgba(243, 237, 226, 0.85);
}
.auth-credit-tag {
  @apply font-mono text-[10px] uppercase font-medium flex items-center gap-3 mb-3.5;
  letter-spacing: 0.22em;
  color: theme('colors.clay.soft');
}
.auth-credit-tag::before {
  content: "";
  width: 18px;
  height: 1px;
  background: theme('colors.clay.soft');
}
.auth-credit-quote {
  font-family: theme('fontFamily.display');
  font-size: 28px;
  font-weight: 400;
  letter-spacing: -0.01em;
  line-height: 1.25;
  max-width: 540px;
}
</style>
