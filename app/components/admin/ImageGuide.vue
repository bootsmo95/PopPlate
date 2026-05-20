<template>
  <div class="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
    <button
      class="flex items-center gap-2 w-full text-left"
      @click="isOpen = !isOpen"
    >
      <svg class="h-4 w-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span class="text-sm font-medium text-blue-800">Tips til de bedste 3D-resultater</span>
      <svg
        class="h-4 w-4 text-blue-400 ml-auto transition-transform"
        :class="{ 'rotate-180': isOpen }"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div v-if="isOpen" class="mt-3 space-y-3 text-sm text-blue-900/80">
      <div>
        <p class="font-medium mb-1">Anbefalede vinkler (2-4 billeder):</p>
        <div class="grid grid-cols-2 gap-2">
          <div class="flex items-start gap-2">
            <span class="text-blue-500 font-bold text-xs mt-0.5">1</span>
            <span><strong>Forfra/oppefra</strong> - direkte over eller let vinklet, så hele retten ses</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-blue-500 font-bold text-xs mt-0.5">2</span>
            <span><strong>Sidevinkel (45°)</strong> - i øjenhøjde eller lidt oppefra, så dybde og højde ses</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-blue-500 font-bold text-xs mt-0.5">3</span>
            <span><strong>Modsatte side</strong> - fang detaljer som ikke ses forfra</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-blue-500 font-bold text-xs mt-0.5">4</span>
            <span><strong>Nærbillede</strong> - vis tekstur og toppings tættere på</span>
          </div>
        </div>
      </div>

      <div>
        <p class="font-medium mb-1">Gør:</p>
        <ul class="list-disc list-inside space-y-0.5 text-blue-900/70">
          <li>Brug jævnt, naturligt lys uden blitz</li>
          <li>Placer retten på en rolig, ryddelig flade</li>
          <li>Hold retten centreret og helt inden for billedet</li>
          <li>Sørg for skarp fokus uden slørede billeder</li>
        </ul>
      </div>

      <div>
        <p class="font-medium mb-1">Undgå:</p>
        <ul class="list-disc list-inside space-y-0.5 text-blue-900/70">
          <li>Hænder, bestik eller andre objekter i billedet</li>
          <li>Rodede baggrunde eller hårde skygger</li>
          <li>Filtre eller tung billedbehandling</li>
          <li>Meget lav opløsning</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const isOpen = ref(false)
</script>
