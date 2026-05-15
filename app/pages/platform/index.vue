<template>
  <div class="p-6 md:p-8">
    <div class="mb-8 max-w-3xl">
      <p class="text-sm font-semibold uppercase tracking-wide text-slate-500">Platform overview</p>
      <h1 class="mt-2 text-3xl font-bold text-gray-900">Welcome to PopPlate Platform</h1>
      <p class="mt-3 text-gray-600">Set up the restaurant, create dishes, publish guest-facing 3D pages, and check plan options from one place.</p>
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <NuxtLink
        to="/platform/dishes"
        class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow"
      >
        <svg class="h-5 w-5 text-slate-700" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7" />
          <path stroke-linecap="round" d="M11 7v4l2.5 2.5" />
          <path stroke-linecap="round" d="M20 20l-2.5-2.5" />
        </svg>
        <h2 class="mt-4 font-semibold text-slate-950">Manage dishes</h2>
        <p class="mt-2 text-sm leading-6 text-slate-600">Edit existing dish pages and publishing state.</p>
      </NuxtLink>

      <NuxtLink
        to="/platform/dishes/new"
        class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow"
      >
        <svg class="h-5 w-5 text-slate-700" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16M4 12h16" />
        </svg>
        <h2 class="mt-4 font-semibold text-slate-950">Create dish</h2>
        <p class="mt-2 text-sm leading-6 text-slate-600">Add the next menu item and prepare its 3D preview.</p>
      </NuxtLink>

      <NuxtLink
        to="/platform/settings"
        class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow"
      >
        <svg class="h-5 w-5 text-slate-700" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12M6 12h12" />
        </svg>
        <h2 class="mt-4 font-semibold text-slate-950">Restaurant setup</h2>
        <p class="mt-2 text-sm leading-6 text-slate-600">Create or update the restaurant context used by dishes.</p>
      </NuxtLink>

      <NuxtLink
        to="/pricing"
        class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow"
      >
        <svg class="h-5 w-5 text-slate-700" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M4 12h16M4 17h10" />
        </svg>
        <h2 class="mt-4 font-semibold text-slate-950">Plans</h2>
        <p class="mt-2 text-sm leading-6 text-slate-600">Compare Free, Basic, and Pro before scaling the menu.</p>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'platform' })
</script>
