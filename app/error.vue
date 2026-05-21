<script setup lang="ts">
import LogoMark from '~/components/shared/LogoMark.vue'

useHead({ title: 'Fejl \u00b7 popplate' })

const props = defineProps<{
  error: { statusCode?: number; statusMessage?: string; message?: string }
}>()

const handleBack = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-bg">
    <div class="text-center max-w-[480px] px-6">
      <LogoMark :size="32" class="mx-auto mb-12" />
      <div
        v-if="error?.statusCode"
        class="font-mono text-[11px] uppercase font-medium text-ink-faint tracking-[0.22em] mb-4"
      >
        {{ error.statusCode }}
      </div>
      <h1 class="font-display font-normal text-[32px] tracking-[-0.025em] text-ink mb-3">
        Noget gik galt
      </h1>
      <p class="text-[15px] text-ink-mute leading-[1.5] mb-8">
        Siden kunne ikke indlæses. Prøv igen, eller gå tilbage til forsiden.
      </p>
      <button class="top-btn top-btn--primary" @click="handleBack">
        Tilbage til forsiden
      </button>
    </div>
  </div>
</template>
