<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    loading?: boolean
    disabled?: boolean
    variant?: 'primary' | 'ghost' | 'danger'
    type?: 'button' | 'submit'
    size?: 'md' | 'sm'
  }>(),
  {
    loading: false,
    disabled: false,
    variant: 'ghost',
    type: 'button',
    size: 'md',
  },
)

const variantClass = computed(() => {
  switch (props.variant) {
    case 'primary': return 'top-btn top-btn--primary'
    case 'danger': return 'top-btn text-[#a85a48] border-[rgba(168,90,72,0.30)] hover:bg-[rgba(168,90,72,0.06)]'
    default: return 'top-btn'
  }
})

const sizeClass = computed(() => {
  return props.size === 'sm' ? 'min-w-[80px]' : 'min-w-[100px]'
})
</script>

<template>
  <button
    :type="type"
    :disabled="loading || disabled"
    :class="[
      variantClass,
      sizeClass,
      {
        'opacity-70 cursor-not-allowed': loading,
        'opacity-50 cursor-not-allowed': disabled && !loading,
      }
    ]"
  >
    <template v-if="loading">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
           class="animate-[spin_0.7s_linear_infinite] shrink-0 mx-auto"
           aria-hidden="true">
        <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.6"
                stroke-dasharray="22" stroke-dashoffset="8" stroke-linecap="round"
                opacity="0.4" />
        <path d="M7 2a5 5 0 0 1 5 5" stroke="currentColor" stroke-width="1.6"
              stroke-linecap="round" />
      </svg>
    </template>
    <template v-else>
      <slot />
    </template>
  </button>
</template>
