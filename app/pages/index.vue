<script setup lang="ts">
// Route: / (landing)
definePageMeta({ layout: 'public' })
useHead({ title: 'popplate · Menu i 3D' })
</script>

<template>
  <main data-screen-label="Landing">
    <!-- HERO -->
    <section class="relative pt-20 pb-15 overflow-hidden">
      <!-- Texture / glow overlays -->
      <div class="absolute inset-0 pointer-events-none z-0 opacity-50"
           style="background: radial-gradient(ellipse 1200px 700px at 50% 20%, rgba(212, 168, 128, 0.35), transparent 65%), radial-gradient(ellipse 800px 600px at 20% 80%, rgba(139, 78, 44, 0.18), transparent 60%);" />

      <div class="relative z-[2] grid place-items-center pt-5" style="height: min(78vh, 720px);">
        <!-- Giant wordmark behind -->
        <div
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display italic font-medium text-ink whitespace-nowrap z-[2] pointer-events-none select-none"
          style="font-size: clamp(120px, 22vw, 360px); line-height: 1; letter-spacing: -0.04em;"
        >popplate<span class="text-clay-deep">.</span></div>

        <!-- Centerpiece "image" placeholder -->
        <div
          class="relative z-[3] overflow-hidden bg-deep"
          style="
            width: clamp(320px, 36vw, 500px);
            aspect-ratio: 1 / 1.15;
            box-shadow: 0 60px 120px rgba(26, 20, 16, 0.32), 0 20px 40px rgba(26, 20, 16, 0.18);
            background:
              radial-gradient(circle at 50% 35%, theme('colors.clay.soft') 0%, theme('colors.clay.DEFAULT') 30%, theme('colors.clay.deep') 75%, #1a1410 100%);
          "
        >
          <div
            class="absolute inset-0 z-[2]"
            style="background: radial-gradient(ellipse 80% 60% at 25% 20%, rgba(255, 240, 220, 0.45), transparent 60%), radial-gradient(ellipse 60% 50% at 85% 90%, rgba(0, 0, 0, 0.4), transparent 70%);"
          />
        </div>

        <!-- Editorial corner labels -->
        <div class="absolute top-8 left-10 z-[4] mono-label flex items-center gap-3 max-[900px]:text-[9px]">
          <span class="font-display italic text-[18px] text-clay-deep tracking-[-0.01em] normal-case">N° 01</span>
          <span class="w-6 h-px bg-clay-deep" />
          Studio Notes
        </div>
        <div class="absolute top-8 right-10 z-[4] mono-label flex items-center gap-3 max-[900px]:text-[9px]">
          A/W 2026
          <span class="font-display italic text-[18px] text-clay-deep tracking-[-0.01em] normal-case">— Folkér</span>
        </div>
      </div>

      <!-- Caption -->
      <div class="relative z-[5] text-center mx-auto mt-10" style="width: min(680px, 90vw);">
        <h1 class="font-display font-normal text-ink-soft max-w-[540px] mx-auto" style="font-size: clamp(26px, 2.8vw, 40px); letter-spacing: -0.015em; line-height: 1.15;">
          En menu der ikke <span class="italic text-clay-deep">står stille</span> — gæsten kan se hver ret i 3D, før den ankommer.
        </h1>
        <div class="flex justify-center gap-3.5 mt-8 flex-wrap">
          <NuxtLink to="/platform/signup" class="btn-primary">
            <span>Få demo til din restaurant</span>
            <span class="w-7 h-7 rounded-full grid place-items-center" style="background: rgba(255,255,255,0.12);">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M1 7h12m0 0L8 2m5 5l-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </span>
          </NuxtLink>
          <NuxtLink to="/r/folker" class="btn-ghost">Se eksempel-menu</NuxtLink>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.btn-primary {
  @apply font-body font-medium text-[15px] px-7 py-4.5 rounded-full bg-ink text-ink-inv inline-flex items-center gap-3.5 transition whitespace-nowrap;
}
.btn-primary:hover {
  @apply -translate-y-0.5 bg-clay-deep;
  box-shadow: 0 18px 40px rgba(139, 78, 44, 0.3);
}
.btn-ghost {
  @apply font-body font-medium text-[15px] px-7 py-4.5 rounded-full border border-line-strong text-ink inline-flex items-center gap-3 transition whitespace-nowrap;
}
.btn-ghost:hover { border-color: theme('colors.ink.DEFAULT'); background: rgba(26,20,16,0.04); }
</style>
