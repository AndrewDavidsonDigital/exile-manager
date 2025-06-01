<script setup lang="ts">
import { useGameEngine } from '@/stores/game';

const gameEngine = useGameEngine();
const char = gameEngine.getCharacter;

</script>

<template>
  <div class="flex flex-col gap-2">
    <template v-if="char !== -1">
      <!-- Armor -->
      <details class="group">
        <summary class="text-sm text-gray-400 cursor-pointer hover:text-gray-300 flex items-center justify-center gap-2">
          <span class="transform group-open:rotate-90 transition-transform text-gray-400">></span>
          Armor
        </summary>
        <div class="mt-2 grid grid-cols-3 gap-2">
          <div 
            v-for="(item, slot) in { 
              head: char.equipment.head, 
              shoulders: char.equipment.shoulders,
              arms: char.equipment.arms,
              chest: char.equipment.chest, 
              legs: char.equipment.legs, 
              feet: char.equipment.feet 
            }"
            :key="slot"
            class="bg-gray-800/80 rounded-lg border border-gray-600 p-2 text-center"
            :class="{ 'bg-emerald-900/80': item }"
          >
            <span class="text-sm text-gray-400">{{ item || slot.charAt(0).toUpperCase() + slot.slice(1) }}</span>
          </div>
        </div>
      </details>

      <!-- Weapons -->
      <details class="group">
        <summary class="text-sm text-gray-400 cursor-pointer hover:text-gray-300 flex items-center justify-center gap-2">
          <span class="transform group-open:rotate-90 transition-transform text-gray-400">></span>
          Weapons
        </summary>
        <div class="mt-2 grid grid-cols-1 gap-2">
          <div 
            v-for="(item, slot) in { weapon: char.equipment.weapon }"
            :key="slot"
            class="bg-gray-800/80 rounded-lg border border-gray-600 p-2 text-center"
            :class="{ 'bg-emerald-900/80': item }"
          >
            <span class="text-sm text-gray-400">{{ item || slot.charAt(0).toUpperCase() + slot.slice(1) }}</span>
          </div>
        </div>
      </details>

      <!-- Accessories -->
      <details class="group">
        <summary class="text-sm text-gray-400 cursor-pointer hover:text-gray-300 flex items-center justify-center gap-2">
          <span class="transform group-open:rotate-90 transition-transform text-gray-400">></span>
          Accessories
        </summary>
        <div class="mt-2 grid grid-cols-3 gap-2">
          <div 
            v-for="(item, slot) in { neck: char.equipment.neck, leftHand: char.equipment.leftHand, rightHand: char.equipment.rightHand }"
            :key="slot"
            class="bg-gray-800/80 rounded-lg border border-gray-600 p-2 text-center"
            :class="{ 'bg-emerald-900/80': item }"
          >
            <span class="text-sm text-gray-400">{{ item || slot.replace(/([A-Z])/g, ' $1').trim() }}</span>
          </div>
        </div>
      </details>
    </template>
  </div>
</template>

<style scoped>
.bg-emerald-900\/80 {
  background-color: rgba(16, 185, 129, 0.8);
}

details {
  border: 1px solid rgba(75, 85, 99, 0.4);
  border-radius: 0.5rem;
  padding: 0.5rem;
}

details summary {
  list-style: none;
}

details summary::-webkit-details-marker {
  display: none;
}

details[open] {
  background-color: rgba(31, 41, 55, 0.4);
}
</style> 