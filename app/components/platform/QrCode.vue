<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    seed?: number
    inverted?: boolean
  }>(),
  { seed: 0, inverted: false },
)

const grid = 21
const cells = computed(() => {
  const out: Array<{ x: number; y: number; fill: string }> = []
  const fg = props.inverted ? '#f3ede2' : '#1a1410'
  for (let y = 0; y < grid; y++) {
    for (let x = 0; x < grid; x++) {
      const isCorner =
        (x < 7 && y < 7) || (x > grid - 8 && y < 7) || (x < 7 && y > grid - 8)
      const inCornerInner =
        (x >= 1 && x <= 5 && y >= 1 && y <= 5) ||
        (x >= grid - 6 && x <= grid - 2 && y >= 1 && y <= 5) ||
        (x >= 1 && x <= 5 && y >= grid - 6 && y <= grid - 2)
      const inCornerCore =
        (x >= 2 && x <= 4 && y >= 2 && y <= 4) ||
        (x >= grid - 5 && x <= grid - 3 && y >= 2 && y <= 4) ||
        (x >= 2 && x <= 4 && y >= grid - 5 && y <= grid - 3)

      let fill = 'transparent'
      if (isCorner) {
        if (inCornerCore) fill = fg
        else if (inCornerInner) fill = 'transparent'
        else fill = fg
      } else {
        const h = (((x * 73856093) ^ (y * 19349663)) >>> 0) + (((props.seed ?? 0) * 2654435761) >>> 0)
        if ((h % 7) < 3) fill = fg
      }
      out.push({ x, y, fill })
    }
  }
  return out
})
</script>

<template>
  <svg :viewBox="`0 0 ${grid * 9} ${grid * 9}`" class="w-full h-full block">
    <rect :width="grid * 9" :height="grid * 9" :fill="inverted ? '#1a1410' : '#f3ede2'" />
    <rect
      v-for="(c, i) in cells" :key="i"
      :x="c.x * 9" :y="c.y * 9"
      width="9" height="9"
      :fill="c.fill"
    />
    <circle cx="94.5" cy="94.5" r="20" :fill="inverted ? '#1a1410' : '#f3ede2'" />
    <ellipse cx="94.5" cy="96.5" rx="13" ry="3.5" fill="#8b4e2c" />
    <ellipse cx="94.5" cy="94" rx="11" ry="2.6" fill="#b87a4e" />
  </svg>
</template>
