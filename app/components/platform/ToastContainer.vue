<script setup lang="ts">
import Icon from '~/components/shared/Icon.vue'

const { toasts, dismiss } = useToast()
</script>

<template>
  <div class="fixed bottom-8 right-8 z-50 flex flex-col-reverse gap-6 max-[480px]:bottom-6 max-[480px]:right-6">
    <TransitionGroup name="toast">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="w-[320px] max-w-[calc(100vw-48px)] bg-paper border border-line rounded-md shadow-[0_14px_30px_rgba(26,20,16,0.10)] px-4 py-4 flex items-start gap-3"
        :class="{
          'border-l-[3px] border-l-clay': t.type === 'success',
          'border-l-[3px] border-l-[#a85a48]': t.type === 'error' || t.type === 'undo',
        }"
      >
        <span class="text-[14px] text-ink leading-[1.4] flex-1">{{ t.message }}</span>
        <button
          v-if="t.type === 'undo' && t.onUndo"
          @click="t.onUndo?.(); dismiss(t.id)"
          class="text-[13px] font-medium text-clay-deep underline-offset-2 hover:underline shrink-0"
        >
          Fortryd
        </button>
        <button
          @click="dismiss(t.id)"
          class="text-ink-mute hover:text-ink shrink-0 mt-0.5"
          aria-label="Luk besked"
        >
          <Icon name="close" :size="14" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active { transition: all 200ms ease-out; }
.toast-leave-active { transition: all 150ms ease-in; }
.toast-enter-from { opacity: 0; transform: translateY(8px); }
.toast-leave-to { opacity: 0; }
</style>
