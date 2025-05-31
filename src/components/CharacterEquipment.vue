<script setup lang="ts">
import { useGameEngine } from '@/stores/game';

const gameEngine = useGameEngine();
const char = gameEngine.getCharacter;
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="text-sm font-semibold text-gray-300">
      Equipment
    </div>
    <template v-if="char !== -1">
      <div class="flex flex-col gap-1">
        <div
          v-if="char.equipment.weapon"
          class="text-sm text-gray-400"
        >
          <span class="text-gray-500">Weapon:</span>
          <span class="ml-2">{{ char.equipment.weapon }}</span>
        </div>
        <div
          v-if="char.equipment.armor"
          class="text-sm text-gray-400"
        >
          <span class="text-gray-500">Armor:</span>
          <span class="ml-2">{{ char.equipment.armor }}</span>
        </div>
        <div
          v-if="char.equipment.accessory"
          class="text-sm text-gray-400"
        >
          <span class="text-gray-500">Accessory:</span>
          <span class="ml-2">{{ char.equipment.accessory }}</span>
        </div>
        <div
          v-if="!char.equipment.weapon && !char.equipment.armor && !char.equipment.accessory" 
          class="text-sm text-gray-500 italic"
        >
          No equipment equipped
        </div>
      </div>
    </template>
  </div>
</template> 