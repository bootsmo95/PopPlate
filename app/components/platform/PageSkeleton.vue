<template>
  <div class="animate-pulse space-y-6 py-6">
    <!-- Eyebrow + title -->
    <div v-if="variant !== 'settings'" class="px-1">
      <div class="h-3 w-32 rounded bg-ink-light/30 mb-4" />
      <div class="h-9 w-64 rounded bg-ink-light/20 mb-2" />
      <div class="h-4 w-48 rounded bg-ink-light/15" />
    </div>

    <!-- Stat cards row -->
    <div v-if="variant === 'dashboard'" class="grid grid-cols-3 gap-4 max-[700px]:grid-cols-1">
      <div v-for="i in 3" :key="i" class="h-28 rounded-md border border-line bg-paper" />
    </div>

    <!-- Content cards -->
    <div v-if="variant !== 'settings'" class="grid gap-4" :class="variant === 'detail' ? 'grid-cols-[1.4fr_1fr] max-[900px]:grid-cols-1' : ''">
      <div class="rounded-md border border-line bg-paper p-6 space-y-4">
        <div class="h-5 w-40 rounded bg-ink-light/20" />
        <div class="h-4 w-full rounded bg-ink-light/10" />
        <div class="h-4 w-3/4 rounded bg-ink-light/10" />
        <div class="h-4 w-1/2 rounded bg-ink-light/10" />
      </div>
      <div v-if="variant === 'detail'" class="rounded-md border border-line bg-paper p-6 space-y-4">
        <div class="h-5 w-32 rounded bg-ink-light/20" />
        <div class="h-32 w-full rounded bg-ink-light/10" />
      </div>
    </div>

    <!-- Table rows -->
    <div v-if="variant === 'list' || variant === 'dashboard'" class="rounded-md border border-line bg-paper overflow-hidden">
      <div v-for="i in rows" :key="i" class="flex items-center gap-4 px-5 py-4 border-b border-line last:border-0">
        <div class="h-10 w-10 rounded-md bg-ink-light/15 shrink-0" />
        <div class="flex-1 space-y-2">
          <div class="h-4 w-40 rounded bg-ink-light/20" />
          <div class="h-3 w-24 rounded bg-ink-light/10" />
        </div>
        <div class="h-5 w-16 rounded-full bg-ink-light/15" />
      </div>
    </div>

    <!-- Settings table skeleton -->
    <div v-if="variant === 'settings'" class="rounded-md border border-line bg-paper overflow-hidden">
      <!-- Table header -->
      <div class="flex items-center gap-4 px-5 py-3 bg-card border-b border-line">
        <div class="h-2.5 w-24 rounded bg-ink-light/15" />
        <div class="h-2.5 w-28 rounded bg-ink-light/15" />
        <div class="h-2.5 w-16 rounded bg-ink-light/15" />
        <div class="flex-1" />
        <div class="h-2.5 w-20 rounded bg-ink-light/15" />
      </div>
      <!-- Table rows -->
      <div v-for="i in rows" :key="'s'+i" class="flex items-center gap-4 px-5 py-4 border-b border-line last:border-0">
        <div class="h-5 w-36 rounded bg-ink-light/20" />
        <div class="h-4 w-44 rounded bg-ink-light/10" />
        <div class="h-5 w-14 rounded-full bg-ink-light/15" />
        <div class="flex-1" />
        <div class="h-7 w-7 rounded-md bg-ink-light/10" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'dashboard' | 'list' | 'detail' | 'settings'
  rows?: number
}>(), {
  variant: 'list',
  rows: 5,
})
</script>
