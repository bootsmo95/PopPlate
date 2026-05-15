<template>
  <div class="min-h-screen bg-stone-50 text-slate-950">
    <header class="border-b border-slate-200/80 bg-stone-50/90 backdrop-blur">
      <nav class="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
        <NuxtLink to="/" class="text-lg font-black tracking-tight text-slate-950">
          PopPlate
        </NuxtLink>

        <div class="flex items-center gap-2 text-sm font-semibold">
          <NuxtLink to="/pricing" class="rounded-lg px-3 py-2 text-slate-600 transition hover:bg-white hover:text-slate-950">
            Pricing
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
      <section class="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
        <div class="flex flex-col justify-center">
          <p class="mb-5 inline-flex w-fit rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-orange-700">
            3D menu previews
          </p>
          <h1 class="max-w-3xl text-5xl font-black leading-[0.95] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
            Let guests see the dish before they order.
          </h1>
          <p class="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            PopPlate turns menu photos into scan-ready 3D dish pages, so restaurants can show portions, plating, and texture directly from a QR code at the table.
          </p>

          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <NuxtLink to="/platform/signup" class="inline-flex items-center justify-center rounded-lg bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800">
              Create your first plate
            </NuxtLink>
            <NuxtLink to="/pricing" class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:border-slate-400">
              Compare plans
            </NuxtLink>
          </div>

          <dl class="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-slate-200 pt-6">
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-slate-500">Launch</dt>
              <dd class="mt-1 text-2xl font-black text-slate-950">Minutes</dd>
            </div>
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-slate-500">Viewing</dt>
              <dd class="mt-1 text-2xl font-black text-slate-950">3D + AR</dd>
            </div>
            <div>
              <dt class="text-xs font-semibold uppercase tracking-wide text-slate-500">Sharing</dt>
              <dd class="mt-1 text-2xl font-black text-slate-950">QR</dd>
            </div>
          </dl>
        </div>

        <div class="relative min-h-[520px] overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 p-4 shadow-2xl shadow-slate-900/20">
          <div class="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-orange-400/30 to-transparent" />
          <div class="relative flex h-full flex-col justify-between rounded-[1.5rem] bg-stone-100 p-5">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Table 12</p>
                <h2 class="mt-1 text-2xl font-black text-slate-950">Charred leek risotto</h2>
              </div>
              <span class="rounded-full bg-slate-950 px-3 py-1 text-sm font-bold text-white">146 kr</span>
            </div>

            <div class="my-8 flex flex-1 items-center justify-center">
              <div class="relative aspect-square w-full max-w-sm rounded-full bg-gradient-to-br from-stone-200 via-white to-orange-100 shadow-inner">
                <div class="absolute inset-8 rounded-full border border-stone-300 bg-white shadow-xl" />
                <div class="absolute left-[22%] top-[28%] h-[32%] w-[56%] rotate-[-18deg] rounded-full bg-emerald-900 shadow-lg" />
                <div class="absolute left-[28%] top-[33%] h-[30%] w-[48%] rotate-[-18deg] rounded-full bg-lime-600" />
                <div class="absolute left-[24%] top-[44%] h-[24%] w-[48%] rotate-[10deg] rounded-full bg-amber-200" />
                <div class="absolute left-[45%] top-[28%] h-16 w-16 rounded-full bg-orange-500 shadow-lg" />
                <div class="absolute bottom-[22%] right-[28%] h-10 w-16 rotate-12 rounded-full bg-slate-800" />
              </div>
            </div>

            <div class="grid gap-3 sm:grid-cols-2">
              <div class="rounded-xl border border-slate-200 bg-white p-4">
                <p class="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Guest view</p>
                <p class="mt-2 text-sm leading-6 text-slate-600">Open a dish from a QR code, inspect the 3D plate, then place it on the table in AR.</p>
              </div>
              <div class="rounded-xl border border-slate-200 bg-white p-4">
                <p class="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Kitchen ready</p>
                <p class="mt-2 text-sm leading-6 text-slate-600">Keep dish names, descriptions, prices, allergens, and model assets in one platform flow.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="border-y border-slate-200 bg-white">
        <div class="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div>
            <p class="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">How it works</p>
            <h2 class="mt-3 text-3xl font-black tracking-tight text-slate-950">A shorter path from upload to table.</h2>
          </div>
          <div class="space-y-3">
            <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-sm font-black text-white">1</span>
            <h3 class="text-xl font-black text-slate-950">Add the dish details</h3>
            <p class="leading-7 text-slate-600">Create each plate with guest-facing copy, pricing, allergens, and restaurant context.</p>
          </div>
          <div class="space-y-3">
            <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-sm font-black text-white">2</span>
            <h3 class="text-xl font-black text-slate-950">Publish a QR landing page</h3>
            <p class="leading-7 text-slate-600">Share one clean public URL per dish with a poster, 3D viewer, and mobile AR launch.</p>
          </div>
        </div>
      </section>

      <section class="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8">
        <div class="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p class="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">Built for service</p>
            <h2 class="mt-3 text-4xl font-black tracking-tight text-slate-950">The menu stays practical, not precious.</h2>
            <p class="mt-5 leading-8 text-slate-600">
              PopPlate is for restaurants that need a clearer way to sell signature dishes, tasting menus, specials, and premium add-ons without rebuilding their whole website.
            </p>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <article v-for="feature in features" :key="feature.title" class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p class="text-sm font-black text-slate-950">{{ feature.title }}</p>
              <p class="mt-2 text-sm leading-6 text-slate-600">{{ feature.copy }}</p>
            </article>
          </div>
        </div>
      </section>

      <section class="bg-slate-950 px-5 py-16 text-white sm:px-6 lg:px-8">
        <div class="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div>
            <p class="text-sm font-bold uppercase tracking-[0.2em] text-orange-300">Start simple</p>
            <h2 class="mt-3 max-w-2xl text-4xl font-black tracking-tight">Use the Free plan to validate the experience, then upgrade when the menu grows.</h2>
          </div>
          <div class="flex flex-col gap-3 sm:flex-row">
            <NuxtLink to="/platform/signup" class="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-stone-100">
              Start free
            </NuxtLink>
            <NuxtLink to="/pricing" class="inline-flex items-center justify-center rounded-lg border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10">
              View pricing
            </NuxtLink>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'public' })

useHead({
  title: 'PopPlate - 3D menu previews for restaurants',
  meta: [
    {
      name: 'description',
      content: 'Create scan-ready 3D dish pages with AR viewing for restaurant menus.',
    },
  ],
})

const features = [
  {
    title: 'QR-first dish pages',
    copy: 'Give every featured plate a public page that works from the table, menu board, or printed insert.',
  },
  {
    title: '3D and AR viewing',
    copy: 'Let guests rotate dishes on screen and open mobile AR when the device supports it.',
  },
  {
    title: 'Restaurant platform flow',
    copy: 'Manage dishes, media, descriptions, prices, allergens, and publishing from one workspace.',
  },
  {
    title: 'Lightweight rollout',
    copy: 'Start with a few high-impact dishes without replacing the existing menu or ordering system.',
  },
]
</script>
