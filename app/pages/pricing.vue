<script setup lang="ts">
// Route: /pricing
definePageMeta({ layout: 'public' })
useHead({ title: 'Priser · popplate' })

const TIERS = [
  {
    name: 'Start',
    price: '249',
    suffix: 'kr/md',
    desc: 'Til den lille restaurant der vil prøve formatet af. 10 retter, full AR + analytics.',
    features: [
      'Op til 10 retter',
      'Eget brand & farver',
      'Allergen-mærkning',
      'Basic analytics',
      'Bordkort QR-print',
    ],
    cta: 'Start gratis',
    featured: false,
  },
  {
    name: 'Basic',
    price: '499',
    suffix: 'kr/md',
    tag: 'Mest populær',
    desc: 'Til den etablerede restaurant. 30 retter, multi-bruger, opdaterede modeller.',
    features: [
      'Op til 30 retter',
      'Multi-bruger (3 sæder)',
      'Avanceret analytics + heatmaps',
      'Quarterly model-refresh',
      'Priority support',
      'Custom domæne',
    ],
    cta: 'Vælg Basic',
    featured: true,
  },
  {
    name: 'Studio',
    price: '1.495',
    suffix: 'kr/md',
    desc: 'Til grupper med flere lokationer eller komplette menukort. Unlimited retter.',
    features: [
      'Ubegrænsede retter',
      'Ubegrænsede restauranter',
      'API + Webhooks',
      'Dedikeret onboarding',
      'White-label',
    ],
    cta: 'Tag kontakt',
    featured: false,
  },
] as const
</script>

<template>
  <main class="pt-25 pb-30 max-[720px]:pt-15" data-screen-label="Pricing">
    <div class="max-w-wrap mx-auto px-10 max-[720px]:px-5">
      <div class="text-center max-w-[680px] mx-auto mb-15">
        <div class="eyebrow mb-5 justify-center inline-flex">
          <span class="w-4 h-px bg-clay-deep" />
          Priser
        </div>
        <h1 class="font-display font-normal leading-[0.96] tracking-[-0.025em]" style="font-size: clamp(44px, 5.4vw, 88px);">
          Vælg en plan der <span class="italic text-clay-deep">passer</span>.
        </h1>
        <p class="text-ink-mute mt-6 text-[17px] leading-[1.55]">
          Alle planer inkluderer 3D-generation, AR-visning, og vores Scandi-template. Skift når som helst.
        </p>
      </div>

      <div class="grid grid-cols-3 gap-6 mt-16 max-[900px]:grid-cols-1">
        <div
          v-for="t in TIERS" :key="t.name"
          class="tier relative rounded p-10 border transition"
          :class="t.featured ? 'tier--featured' : 'border-line bg-paper hover:border-line-strong'"
        >
          <div class="flex justify-between items-start mb-6">
            <span class="font-display italic text-[28px] font-normal tracking-[-0.01em]" :class="t.featured && 'text-ink-inv'">
              {{ t.name }}
            </span>
            <span v-if="'tag' in t" class="font-mono text-[10px] uppercase font-medium px-2.5 py-1.5 rounded-full bg-clay text-white" style="letter-spacing: 0.15em;">
              {{ t.tag }}
            </span>
          </div>
          <div class="font-body font-light leading-none tabular-nums" :class="t.featured && 'text-ink-inv'" style="font-size: 76px; letter-spacing: -0.05em;">
            {{ t.price }}<span class="font-body text-[14px] font-normal ml-1" :class="t.featured ? 'text-[rgba(243,237,226,0.55)]' : 'text-ink-faint'">{{ t.suffix }}</span>
          </div>
          <p class="mt-2 text-sm leading-[1.55] mb-8" :class="t.featured ? 'text-[rgba(243,237,226,0.65)]' : 'text-ink-mute'">{{ t.desc }}</p>

          <ul class="list-none mb-8">
            <li
              v-for="(f, i) in t.features" :key="f"
              class="flex items-start gap-3 py-3.5 text-sm"
              :class="[
                i === 0 ? 'border-t-0' : 'border-t',
                t.featured ? 'text-[rgba(243,237,226,0.85)] border-[rgba(243,237,226,0.12)]' : 'text-ink-soft border-line',
              ]"
            >
              <span
                class="shrink-0 w-3.5 h-3.5 rounded-full grid place-items-center mt-1"
                :class="t.featured ? 'bg-clay-soft' : 'bg-clay'"
              >
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1 4l2 2 4-4" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
              {{ f }}
            </li>
          </ul>

          <NuxtLink
            to="/platform/signup"
            class="block w-full text-center py-4 rounded-full font-body font-medium text-sm border transition"
            :class="t.featured
              ? 'bg-clay text-white border-clay hover:bg-clay-deep hover:border-clay-deep'
              : 'border-line-strong text-ink hover:bg-[rgba(26,20,16,0.06)] hover:border-ink'"
          >
            {{ t.cta }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.tier--featured {
  background: theme('colors.deep');
  color: theme('colors.ink.inv');
  border-color: theme('colors.deep');
}
</style>
