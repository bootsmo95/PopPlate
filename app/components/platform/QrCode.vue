<script setup lang="ts">
// Deterministic decorative QR — same algorithm as the HTML prototype.
// Pass a `seed` to vary the pattern across dishes if needed.
const props = withDefaults(
  defineProps<{
    /** Optional integer seed to vary the pattern */
    seed?: number
    /** Light-on-dark variant */
    inverted?: boolean
  }>(),
  { seed: 0, inverted: false },
)

const cells = computed(() => {
  const out: Array<{ x: number; y: number; fill: boolean }> = []
  for (let y = 0; y < 17; y++) {
    for (let x = 0; x < 17; x++) {
      const isFinder =
        (x < 7 && y < 7) || (x > 9 && y < 7) || (x < 7 && y > 9)
      let fill = false
      if (isFinder) {
        const inFinder = (cx: number, cy: number) => {
          const dx = x - cx, dy = y - cy
          const m = Math.max(Math.abs(dx), Math.abs(dy))
          if (m > 3) return false
          if (m === 3) return true
          if (m === 2) return false
          return true
        }
        const c: [number, number] =
          x < 7 && y < 7 ? [3, 3] : x > 9 ? [13, 3] : [3, 13]
        fill = inFinder(c[0], c[1])
      } else {
        const h =
          (((x * 73856093) ^ (y * 19349663) ^ 0x9e3779b9) >>> 0) +
          (((props.seed ?? 0) * 2654435761) >>> 0)
        fill = (h % 10) < 4
      }
      out.push({ x, y, fill })
    }
  }
  return out
})
</script>

<template>
  <svg viewBox="0 0 153 153" class="w-full h-full block">
    <rect width="153" height="153" :fill="inverted ? '#1a1410' : '#f3ede2'" />
    <rect
      v-for="(c, i) in cells" :key="i"
      :x="c.x * 9" :y="c.y * 9"
      width="9" height="9"
      :fill="c.fill ? (inverted ? '#f3ede2' : '#1a1410') : 'transparent'"
    />
    <!-- Brand center mark -->
    <circle cx="76.5" cy="76.5" r="18" :fill="inverted ? '#1a1410' : '#f3ede2'" />
    <ellipse cx="76.5" cy="78.5" rx="12" ry="3.2" fill="#8b4e2c" />
    <ellipse cx="76.5" cy="76" rx="10" ry="2.4" fill="#b87a4e" />
  </svg>
</template>
