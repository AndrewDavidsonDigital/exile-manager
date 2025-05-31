<script setup lang="ts">
import { useGameEngine } from '@/stores/game';

const gameEngine = useGameEngine();
const char = gameEngine.getCharacter;
</script>

<template>
  <div class="flex flex-col gap-4 p-4 bg-gray-800 rounded-lg">
    <template v-if="char !== -1">
      <div class="flex flex-col gap-2">
        <div class="text-xl font-bold text-white">
          {{ char.name }}
        </div>
        <div class="text-sm text-gray-300">
          Level {{ char.level }} {{ char.class }}
        </div>
      </div>

      <!-- Stats Section -->
      <div class="grid grid-cols-2 gap-2">
        <div class="text-sm">
          <span class="text-gray-400">Health:</span>
          <span class="text-green-400 ml-2">{{ char.stats.health }}</span>
        </div>
        <div class="text-sm">
          <span class="text-gray-400">Mana:</span>
          <span class="text-blue-400 ml-2">{{ char.stats.mana }}</span>
        </div>
        <div class="text-sm">
          <span class="text-gray-400">Fortitude:</span>
          <span class="text-yellow-400 ml-2">{{ char.stats.fortitude }}</span>
        </div>
        <div class="text-sm">
          <span class="text-gray-400">Fortune:</span>
          <span class="text-purple-400 ml-2">{{ char.stats.fortune }}</span>
        </div>
        <div class="text-sm">
          <span class="text-gray-400">Wrath:</span>
          <span class="text-red-400 ml-2">{{ char.stats.wrath }}</span>
        </div>
        <div class="text-sm">
          <span class="text-gray-400">Affinity:</span>
          <span class="text-cyan-400 ml-2">{{ char.stats.affinity }}</span>
        </div>
      </div>

      <!-- Gold and Experience -->
      <div class="flex justify-between text-sm">
        <div class="text-yellow-400">
          Gold: {{ char.gold }}
        </div>
        <div class="text-blue-400">
          XP: {{ char.experience }}/{{ char.level * 100 }}
        </div>
      </div>
    </template>
  </div>
</template> 