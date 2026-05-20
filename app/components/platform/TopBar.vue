<script setup lang="ts">
import Icon from '~/components/shared/Icon.vue'

withDefaults(
  defineProps<{
    showSearch?: boolean
    ctaLabel?: string
    ctaHref?: string
    searchPlaceholder?: string
  }>(),
  {
    showSearch: true,
    ctaLabel: 'Ny ret',
    ctaHref: '/platform/dishes/new',
    searchPlaceholder: 'Søg retter, restauranter, jobs…',
  },
)

const search = defineModel<string>('search', { default: '' })
</script>

<template>
  <div class="platform-topbar flex items-center justify-between mb-8 gap-3.5 flex-wrap">
    <div
      v-if="showSearch"
      class="flex items-center gap-2.5 bg-paper border border-line rounded-full px-[18px] py-2.5 flex-1 max-w-[420px] min-w-0 sm:min-w-[320px]"
    >
      <Icon name="search" :size="14" />
      <input
        v-model="search"
        type="text"
        :placeholder="searchPlaceholder"
        class="border-0 outline-none bg-transparent font-body text-sm text-ink flex-1 min-w-0"
      >
      <kbd class="font-mono text-[11px] px-1.5 py-0.5 bg-card rounded text-ink-faint">⌘K</kbd>
    </div>
    <div v-else class="flex-1" />

    <div class="flex gap-2.5 items-center">
      <button type="button" class="top-btn !px-[14px]" aria-label="Notifikationer">
        <Icon name="bell" />
      </button>
      <NuxtLink :to="ctaHref" class="top-btn top-btn--primary">
        <Icon name="plus" :size="14" />
        <span>{{ ctaLabel }}</span>
      </NuxtLink>
    </div>
  </div>
</template>
