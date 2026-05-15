<template>
  <div class="min-h-screen bg-stone-50 text-slate-950">
    <header class="border-b border-slate-200/80 bg-stone-50/90 backdrop-blur">
      <nav class="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
        <NuxtLink to="/" class="text-lg font-black tracking-tight text-slate-950">
          PopPlate
        </NuxtLink>

        <div class="flex items-center gap-2 text-sm font-semibold">
          <NuxtLink to="/" class="rounded-lg px-3 py-2 text-slate-600 transition hover:bg-white hover:text-slate-950">
            Home
          </NuxtLink>
          <NuxtLink to="/platform/login" class="rounded-lg px-3 py-2 text-slate-600 transition hover:bg-white hover:text-slate-950">
            Sign in
          </NuxtLink>
          <NuxtLink to="/platform/signup" class="rounded-lg bg-slate-950 px-4 py-2 text-white transition hover:bg-slate-800">
            Start free
          </NuxtLink>
        </div>
      </nav>
    </header>

    <main>
      <section class="mx-auto max-w-6xl px-5 py-14 text-center sm:px-6 lg:px-8 lg:py-20">
        <p class="mx-auto mb-5 w-fit rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-orange-700">
          Pricing
        </p>
        <h1 class="mx-auto max-w-4xl text-5xl font-black leading-tight tracking-tight text-slate-950 sm:text-6xl">
          Start with one dish. Scale to the whole menu.
        </h1>
        <p class="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
          Choose the plan that matches how many 3D dish pages you want live, how much control you need, and how often the menu changes.
        </p>
      </section>

      <section class="mx-auto max-w-6xl px-5 pb-16 sm:px-6 lg:px-8">
        <div class="grid gap-5 lg:grid-cols-3">
          <article
            v-for="plan in plans"
            :key="plan.name"
            class="flex flex-col rounded-xl border bg-white p-6 shadow-sm"
            :class="plan.highlight ? 'border-orange-300 shadow-orange-100' : 'border-slate-200'"
          >
            <div class="flex items-start justify-between gap-4">
              <div>
                <h2 class="text-2xl font-black text-slate-950">{{ plan.name }}</h2>
                <p class="mt-2 text-sm leading-6 text-slate-600">{{ plan.description }}</p>
              </div>
              <span v-if="plan.badge" class="rounded-full bg-orange-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-orange-700">
                {{ plan.badge }}
              </span>
            </div>

            <div class="mt-6">
              <p class="flex items-end gap-2">
                <span class="text-4xl font-black tracking-tight text-slate-950">{{ plan.price }}</span>
                <span class="pb-1 text-sm font-semibold text-slate-500">{{ plan.period }}</span>
              </p>
              <p class="mt-2 text-sm text-slate-500">{{ plan.note }}</p>
            </div>

            <NuxtLink
              :to="plan.ctaHref"
              class="mt-6 inline-flex items-center justify-center rounded-lg px-4 py-3 text-sm font-bold transition"
              :class="plan.highlight ? 'bg-slate-950 text-white hover:bg-slate-800' : 'border border-slate-300 bg-white text-slate-900 hover:border-slate-400'"
            >
              {{ plan.cta }}
            </NuxtLink>

            <div class="mt-6 border-t border-slate-200 pt-6">
              <p class="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Includes</p>
              <ul class="mt-4 space-y-3">
                <li v-for="feature in plan.features" :key="feature" class="flex gap-3 text-sm leading-6 text-slate-700">
                  <span class="mt-1 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                    <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span>{{ feature }}</span>
                </li>
              </ul>
            </div>
          </article>
        </div>
      </section>

      <section class="border-y border-slate-200 bg-white">
        <div class="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p class="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">Plan fit</p>
            <h2 class="mt-3 text-3xl font-black tracking-tight text-slate-950">Pick by menu maturity.</h2>
          </div>

          <div class="grid gap-4 sm:grid-cols-3">
            <div v-for="guide in planGuides" :key="guide.title" class="rounded-xl border border-slate-200 bg-stone-50 p-5">
              <p class="text-sm font-black text-slate-950">{{ guide.title }}</p>
              <p class="mt-2 text-sm leading-6 text-slate-600">{{ guide.copy }}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
        <div>
          <p class="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">Questions</p>
          <h2 class="mt-3 text-3xl font-black tracking-tight text-slate-950">Straight answers before you roll it out.</h2>
        </div>

        <div class="divide-y divide-slate-200 border-y border-slate-200">
          <div v-for="item in faqs" :key="item.question" class="py-5">
            <h3 class="font-black text-slate-950">{{ item.question }}</h3>
            <p class="mt-2 leading-7 text-slate-600">{{ item.answer }}</p>
          </div>
        </div>
      </section>

      <section class="bg-slate-950 px-5 py-16 text-white sm:px-6 lg:px-8">
        <div class="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div>
            <p class="text-sm font-bold uppercase tracking-[0.2em] text-orange-300">No heavy rollout</p>
            <h2 class="mt-3 max-w-2xl text-4xl font-black tracking-tight">Create the first dish page and test it from a real table.</h2>
          </div>
          <NuxtLink to="/platform/signup" class="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-stone-100">
            Start free
          </NuxtLink>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'public' })

useHead({
  title: 'Pricing - PopPlate',
  meta: [
    {
      name: 'description',
      content: 'Compare PopPlate Free, Basic, and Pro plans for 3D restaurant menu previews.',
    },
  ],
})

const plans = [
  {
    name: 'Free',
    description: 'For testing PopPlate on one signature dish before committing to a larger rollout.',
    price: '0 kr',
    period: 'forever',
    note: 'A practical sandbox for one restaurant.',
    cta: 'Start free',
    ctaHref: '/platform/signup',
    badge: '',
    highlight: false,
    features: [
      '1 live 3D dish page',
      'QR-ready public dish link',
      'Basic dish details and allergens',
      '3D viewer with mobile AR launch',
    ],
  },
  {
    name: 'Basic',
    description: 'For small menus, specials, and restaurants that want a clean guest experience.',
    price: '149 kr',
    period: 'per month',
    note: 'Best for focused menus and rotating highlights.',
    cta: 'Choose Basic',
    ctaHref: '/platform/signup',
    badge: 'Popular',
    highlight: true,
    features: [
      'Up to 15 live 3D dish pages',
      'Restaurant profile and menu setup',
      'Poster images, prices, and descriptions',
      'QR publishing controls',
      'Usage-ready public dish pages',
    ],
  },
  {
    name: 'Pro',
    description: 'For restaurants that want broader coverage, richer updates, and room to grow.',
    price: '399 kr',
    period: 'per month',
    note: 'Built for full menus and multi-service operations.',
    cta: 'Choose Pro',
    ctaHref: '/platform/signup',
    badge: '',
    highlight: false,
    features: [
      'Up to 75 live 3D dish pages',
      'Priority generation queue',
      'Seasonal menu and campaign support',
      'Advanced publishing workflow',
      'Early access to new viewer features',
    ],
  },
]

const planGuides = [
  {
    title: 'Free',
    copy: 'Use this when you need proof that guests understand and value 3D dish previews.',
  },
  {
    title: 'Basic',
    copy: 'Use this for top sellers, tasting menus, lunch specials, and dishes that benefit from visual confidence.',
  },
  {
    title: 'Pro',
    copy: 'Use this when PopPlate becomes part of the regular menu workflow across teams or services.',
  },
]

const faqs = [
  {
    question: 'Do guests need an app?',
    answer: 'No. Dish pages open in the browser from a QR code, with AR available on supported mobile devices.',
  },
  {
    question: 'Can we keep our existing website and menu?',
    answer: 'Yes. PopPlate works as a focused companion to the existing menu, so you can roll it out dish by dish.',
  },
  {
    question: 'Can we change plans later?',
    answer: 'Yes. Start with Free or Basic, then upgrade when you need more live dish pages or a broader rollout.',
  },
]
</script>
