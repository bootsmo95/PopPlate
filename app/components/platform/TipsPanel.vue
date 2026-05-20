<script setup lang="ts">
// Collapsible "Tips til de bedste 3D-resultater" panel used inside the edit-dish
// source-images card. Pure visual — no props.
const open = ref(false)

const ANGLES = [
  ['01', 'Forfra eller fra oven', 'direkte ovenfra eller let skråt — viser hele retten.'],
  ['02', 'Sidevinkel (45°)',     'i øjenhøjde eller lidt over — viser dybde og højde.'],
  ['03', 'Modsat side',          'den anden vinkel for at fange detaljer der ikke ses forfra.'],
  ['04', 'Detaljebillede',       'tæt på — fremhæver tekstur og topping.'],
] as const

const DOS = [
  'Brug naturligt lys (undgå flash)',
  'Placér retten på en rolig, ensfarvet flade',
  'Hold retten centreret og fuldt i billedet',
  'Skarpt fokus — ingen slørede skud',
]
const DONTS = [
  'Hænder, bestik eller andre objekter i billedet',
  'Travle baggrunde eller hårde skygger',
  'Filtre eller heavy efterbehandling',
  'Meget lav opløsning',
]
</script>

<template>
  <div class="border border-line rounded-md overflow-hidden mb-4.5">
    <button
      type="button"
      class="w-full flex items-center justify-between px-4.5 py-3.5 border-0 cursor-pointer font-body text-ink text-sm font-medium text-left transition-colors"
      :class="open ? 'bg-[rgba(184,122,78,0.06)]' : 'bg-card'"
      @click="open = !open"
    >
      <span class="flex items-center gap-2.5">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" stroke="#8b4e2c" stroke-width="1.4" />
          <path d="M8 4.5v.01M8 7v4" stroke="#8b4e2c" stroke-width="1.4" stroke-linecap="round" />
        </svg>
        Tips til de bedste 3D-resultater
      </span>
      <svg
        width="12" height="12" viewBox="0 0 12 12" fill="none"
        class="transition-transform" :class="open && 'rotate-180'"
      >
        <path d="M3 4.5l3 3 3-3" stroke="theme('colors.ink.mute')" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <div v-if="open" class="p-5 bg-paper border-t border-line">
      <div class="mono-label mb-3.5">Anbefalede vinkler · 2–4 fotos</div>
      <div class="grid grid-cols-2 gap-x-7 gap-y-4 mb-5.5 max-[600px]:grid-cols-1">
        <div v-for="a in ANGLES" :key="a[0]" class="flex gap-3">
          <span class="font-mono text-[11px] text-clay-deep font-medium shrink-0 pt-0.5" style="letter-spacing: 0.08em;">{{ a[0] }}</span>
          <div class="text-[13px] leading-[1.55] text-ink-soft">
            <strong class="text-ink font-medium">{{ a[1] }}</strong> — {{ a[2] }}
          </div>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-7 max-[600px]:grid-cols-1">
        <div>
          <div class="font-mono text-[10px] uppercase font-medium mb-2.5" style="color: #4a6240; letter-spacing: 0.18em;">Gør</div>
          <ul class="m-0 p-0 list-none text-[13px] leading-[1.7] text-ink-soft">
            <li v-for="d in DOS" :key="d">· {{ d }}</li>
          </ul>
        </div>
        <div>
          <div class="font-mono text-[10px] uppercase font-medium mb-2.5" style="color: #8a4838; letter-spacing: 0.18em;">Undgå</div>
          <ul class="m-0 p-0 list-none text-[13px] leading-[1.7] text-ink-soft">
            <li v-for="d in DONTS" :key="d">· {{ d }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
