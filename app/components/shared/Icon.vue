<script setup lang="ts">
// Single-file icon set. Use as <Icon name="home" />, <Icon name="arrow" size="16" />
const props = withDefaults(
  defineProps<{
    name:
      | 'home' | 'dish' | 'restaurant' | 'analytics' | 'settings'
      | 'plus' | 'search' | 'bell' | 'arrow' | 'arrow-up-right'
      | 'more' | 'qr' | 'edit' | 'check' | 'close' | 'menu'
      | 'download' | 'refresh' | 'copy' | 'ar' | 'image' | 'info'
    size?: number | string
    stroke?: number | string
  }>(),
  { size: 16, stroke: 1.4 },
)
</script>

<template>
  <svg
    :width="props.size"
    :height="props.size"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
    class="shrink-0 inline-block align-middle"
  >
    <!-- home -->
    <template v-if="name === 'home'">
      <path d="M2 7l6-5 6 5v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7z"
        stroke="currentColor" :stroke-width="stroke" stroke-linejoin="round" />
    </template>

    <!-- dish -->
    <template v-else-if="name === 'dish'">
      <circle cx="8" cy="8" r="6" stroke="currentColor" :stroke-width="stroke" />
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" :stroke-width="stroke" />
    </template>

    <!-- restaurant -->
    <template v-else-if="name === 'restaurant'">
      <path d="M2 2v6a2 2 0 0 0 2 2v4M4 2v6M6 2v6M14 2c-1 0-2 2-2 5s1 3 1 3v4"
        stroke="currentColor" :stroke-width="stroke" stroke-linecap="round" />
    </template>

    <!-- analytics -->
    <template v-else-if="name === 'analytics'">
      <path d="M2 14V2M2 14h12M5 11V8M8 11V5M11 11V7"
        stroke="currentColor" :stroke-width="stroke" stroke-linecap="round" />
    </template>

    <!-- settings -->
    <template v-else-if="name === 'settings'">
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" :stroke-width="stroke" />
      <path d="M8 2v2M8 12v2M2 8h2M12 8h2M3.7 3.7l1.5 1.5M10.8 10.8l1.5 1.5M3.7 12.3l1.5-1.5M10.8 5.2l1.5-1.5"
        stroke="currentColor" :stroke-width="stroke" stroke-linecap="round" />
    </template>

    <!-- plus -->
    <template v-else-if="name === 'plus'">
      <path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </template>

    <!-- search -->
    <template v-else-if="name === 'search'">
      <circle cx="6.8" cy="6.8" r="4.5" stroke="currentColor" :stroke-width="stroke" />
      <path d="M11 11l3 3" stroke="currentColor" :stroke-width="stroke" stroke-linecap="round" />
    </template>

    <!-- bell -->
    <template v-else-if="name === 'bell'">
      <path d="M3 6a5 5 0 0 1 10 0v3l1 2H2l1-2V6z" stroke="currentColor" :stroke-width="stroke" stroke-linejoin="round" />
      <path d="M6 13a2 2 0 0 0 4 0" stroke="currentColor" :stroke-width="stroke" />
    </template>

    <!-- arrow (→) -->
    <template v-else-if="name === 'arrow'">
      <path d="M2 8h12m0 0L9 3m5 5l-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </template>

    <!-- arrow-up-right (↗) -->
    <template v-else-if="name === 'arrow-up-right'">
      <path d="M5 11l6-6M11 5v6H5M5 2H2v12h12V9" stroke="currentColor" :stroke-width="stroke" stroke-linecap="round" stroke-linejoin="round" />
    </template>

    <!-- more (⋯) -->
    <template v-else-if="name === 'more'">
      <circle cx="3.5" cy="8" r="1.2" fill="currentColor" />
      <circle cx="8" cy="8" r="1.2" fill="currentColor" />
      <circle cx="12.5" cy="8" r="1.2" fill="currentColor" />
    </template>

    <!-- qr -->
    <template v-else-if="name === 'qr'">
      <rect x="2" y="2" width="5" height="5" stroke="currentColor" stroke-width="1.2" />
      <rect x="9" y="2" width="5" height="5" stroke="currentColor" stroke-width="1.2" />
      <rect x="2" y="9" width="5" height="5" stroke="currentColor" stroke-width="1.2" />
      <path d="M9 9h2v2M12 12h2M12 9v0M9 12v0" stroke="currentColor" stroke-width="1.2" />
    </template>

    <!-- edit (pencil) -->
    <template v-else-if="name === 'edit'">
      <path d="M10 2l4 4-8 8H2v-4l8-8z" stroke="currentColor" :stroke-width="stroke" stroke-linejoin="round" />
    </template>

    <!-- check -->
    <template v-else-if="name === 'check'">
      <path d="M3 8l3 3 7-7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
    </template>

    <!-- close (×) -->
    <template v-else-if="name === 'close'">
      <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </template>

    <!-- menu (hamburger) -->
    <template v-else-if="name === 'menu'">
      <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
    </template>

    <!-- download -->
    <template v-else-if="name === 'download'">
      <path d="M8 2v9M8 11l-3-3M8 11l3-3M3 14h10" stroke="currentColor" :stroke-width="stroke" stroke-linecap="round" stroke-linejoin="round" />
    </template>

    <!-- refresh -->
    <template v-else-if="name === 'refresh'">
      <path d="M13 8a5 5 0 1 1-1.5-3.6M13 2v3.5h-3.5" stroke="currentColor" :stroke-width="stroke" stroke-linecap="round" stroke-linejoin="round" />
    </template>

    <!-- copy -->
    <template v-else-if="name === 'copy'">
      <rect x="5" y="5" width="9" height="9" rx="1" stroke="currentColor" :stroke-width="stroke" />
      <path d="M11 5V2H2v9h3" stroke="currentColor" :stroke-width="stroke" />
    </template>

    <!-- ar (cube) -->
    <template v-else-if="name === 'ar'">
      <path d="M3 5l5-3 5 3M3 5v6l5 3m-5-9l5 3m0 0v6m0-6l5-3m0 0v6l-5 3"
        stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
    </template>

    <!-- image -->
    <template v-else-if="name === 'image'">
      <rect x="2" y="3" width="12" height="10" rx="1" stroke="currentColor" :stroke-width="stroke" />
      <circle cx="6" cy="6.5" r="1.2" stroke="currentColor" :stroke-width="stroke" />
      <path d="M2 11l3-3 2 2 3-3 4 4" stroke="currentColor" :stroke-width="stroke" stroke-linejoin="round" />
    </template>

    <!-- info -->
    <template v-else-if="name === 'info'">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" :stroke-width="stroke" />
      <path d="M8 5v.01M8 7v4" stroke="currentColor" :stroke-width="stroke" stroke-linecap="round" />
    </template>
  </svg>
</template>
