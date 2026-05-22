<script setup lang="ts">
import StatusBadge from './StatusBadge.vue'
import Icon from '~/components/shared/Icon.vue'
import type { Dish } from '~/types/popplate'

defineProps<{
  dishes: Dish[]
  /** Hide columns to compact the table (e.g. on workspace overview) */
  compact?: boolean
  /** Empty-state message */
  emptyLabel?: string
}>()

function splitItalic(d: Dish): [string, string, string] {
  if (!d.italic) return [d.name, '', '']
  const idx = d.name.indexOf(d.italic)
  if (idx < 0) return [d.name, '', '']
  return [d.name.slice(0, idx), d.italic, d.name.slice(idx + d.italic.length)]
}
</script>

<template>
  <div class="p-table bg-paper border border-line rounded-md overflow-x-auto" style="-webkit-overflow-scrolling: touch;">
    <table class="w-full border-collapse" style="min-width: 640px;">
      <thead>
        <tr>
          <th>Ret</th>
          <th>Status</th>
          <th>Pris</th>
          <th v-if="!compact">AR-visninger</th>
          <th>Scans</th>
          <th v-if="!compact">Opdateret</th>
          <th v-if="!compact" class="text-right">Handlinger</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="d in dishes" :key="d.id" class="group">
          <td>
            <div class="flex items-center gap-3.5">
              <div class="w-11 h-11 bg-card bg-cover bg-center shrink-0 rounded" :style="{ backgroundImage: `url(${d.img})` }" />
              <div class="min-w-0">
                <NuxtLink
                  :to="`/platform/dishes/${d.id}`"
                  class="font-display text-[17px] tracking-[-0.01em] block"
                >
                  <template v-if="d.italic">
                    <span>{{ splitItalic(d)[0] }}</span><span class="italic text-clay-deep">{{ splitItalic(d)[1] }}</span><span>{{ splitItalic(d)[2] }}</span>
                  </template>
                  <template v-else>{{ d.name }}</template>
                </NuxtLink>
                <div class="font-mono text-[11px] text-ink-faint mt-0.5">{{ d.restaurant }}</div>
              </div>
            </div>
          </td>
          <td>
            <StatusBadge :status="d.status" :progress="d.progress" />
            <div v-if="d.status === 'processing' && d.progress != null" class="progress mt-2" style="width: 140px;">
              <div class="progress-bar" :style="{ width: `${d.progress}%` }" />
            </div>
            <div v-if="d.status === 'failed' && d.error" class="text-[11px] mt-1.5" style="color: #8a4838;">{{ d.error }}</div>
          </td>
          <td><span class="num">{{ d.price }}</span></td>
          <td v-if="!compact"><span class="num">{{ d.views.toLocaleString('da-DK') }}</span></td>
          <td><span class="num">{{ d.scans || '—' }}</span></td>
          <td v-if="!compact"><span class="font-mono text-xs text-ink-faint">{{ d.updated }}</span></td>
          <td v-if="!compact">
            <div class="flex gap-2 justify-end">
              <NuxtLink :to="`/platform/dishes/${d.id}`" class="icon-btn" title="Redigér">
                <Icon name="edit" :size="14" />
              </NuxtLink>
              <NuxtLink
                v-if="d.publicDishId"
                :to="`/d/${d.publicDishId}`"
                target="_blank"
                rel="noopener"
                class="live-btn"
                title="Vis live menu"
              >
                <Icon name="arrow-up-right" :size="14" />
                <span>Vis live</span>
              </NuxtLink>
              <button class="icon-btn" title="Hent QR" type="button"><Icon name="qr" :size="14" /></button>
              <button class="icon-btn" title="Mere" type="button"><Icon name="more" :size="14" /></button>
            </div>
          </td>
        </tr>
        <tr v-if="dishes.length === 0">
          <td :colspan="compact ? 4 : 7" class="text-center py-16 text-ink-faint">
            {{ emptyLabel || 'Ingen retter matchede filtret.' }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.p-table :deep(th),
.p-table :deep(td) {
  @apply text-left px-5 py-3.5 text-sm text-ink border-b border-line;
}
.p-table :deep(th) {
  @apply font-mono text-[10px] uppercase font-medium text-ink-faint bg-card;
  letter-spacing: 0.18em;
}
.p-table :deep(tr:last-child td) { border-bottom: none; }
.p-table :deep(tr:hover td) { background: rgba(184, 122, 78, 0.04); }

.num { @apply tabular-nums font-mono text-[13px]; }

.icon-btn {
  @apply w-[30px] h-[30px] grid place-items-center rounded-md text-ink-faint transition-colors;
}
.icon-btn:hover {
  background: rgba(26, 20, 16, 0.06);
  color: theme('colors.ink.DEFAULT');
}

.live-btn {
  @apply inline-flex h-[30px] items-center gap-1.5 rounded-md px-2.5 text-[12px] font-medium text-ink-faint transition-colors whitespace-nowrap;
}
.live-btn:hover {
  background: rgba(26, 20, 16, 0.06);
  color: theme('colors.ink.DEFAULT');
}

@media (max-width: 720px) {
  .p-table :deep(th),
  .p-table :deep(td) { @apply px-3.5 py-3; }
}
</style>
