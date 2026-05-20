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
const router = useRouter()

function submitSearch() {
  const query = search.value.trim()
  if (!query) return

  router.push({
    path: '/platform/dishes',
    query: { search: query },
  })
}

function handleShortcut(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    const input = document.querySelector<HTMLInputElement>('[data-platform-search]')
    input?.focus()
  }
}

onMounted(() => window.addEventListener('keydown', handleShortcut))
onUnmounted(() => window.removeEventListener('keydown', handleShortcut))
</script>

<template>
  <div class="platform-topbar flex items-center justify-between mb-8 gap-3.5 flex-wrap">
    <form
      v-if="showSearch"
      class="flex items-center gap-2.5 bg-paper border border-line rounded-full px-[18px] py-2.5 flex-1 max-w-[420px] min-w-0 sm:min-w-[320px]"
      role="search"
      @submit.prevent="submitSearch"
    >
      <Icon name="search" :size="14" />
      <input
        v-model="search"
        data-platform-search
        type="text"
        :placeholder="searchPlaceholder"
        class="border-0 outline-none bg-transparent font-body text-sm text-ink flex-1 min-w-0"
      >
      <kbd class="font-mono text-[11px] px-1.5 py-0.5 bg-card rounded text-ink-faint">⌘K</kbd>
    </form>
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
