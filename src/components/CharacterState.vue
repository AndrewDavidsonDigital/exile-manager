<script setup lang="ts">
import { useGameEngine } from '@/stores/game';
import { CLASS_ALIGNED_STATS } from '@/lib/game';
import { computed } from 'vue';

const gameEngine = useGameEngine();
const char = gameEngine.getCharacter;

const orderedStats = computed(() => {
  if (char === -1) return [];
  
  const alignedStats = CLASS_ALIGNED_STATS[char.class];
  const allStats = ['fortitude', 'fortune', 'wrath', 'affinity'] as const;
  const nonAlignedStats = allStats.filter(stat => !alignedStats.includes(stat));
  
  return [...alignedStats, ...nonAlignedStats];
});

const getStatColor = (stat: string) => {
  switch (stat) {
    case 'fortitude': return 'text-yellow-400';
    case 'fortune': return 'text-purple-400';
    case 'wrath': return 'text-red-400';
    case 'affinity': return 'text-cyan-400';
    default: return 'text-gray-400';
  }
};
</script>

<template>
  <div class="flex flex-col gap-4 p-4 bg-gray-800 rounded-lg">
    <template v-if="char !== -1">
      <div class="flex justify-between">
        <div class="flex flex-col gap-2">
          <div class="text-xl font-bold text-white capitalize">
            {{ char.name }}
          </div>
          <div class="text-sm text-gray-300">
            Level {{ char.level }} {{ char.class }}
          </div>
        </div>
        <div class="text-xl font-bold text-white capitalize">
          Loot: {{ char.loot?.length }}
        </div>
      </div>

      <!-- Stats Section -->
      <div class="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span class="text-gray-400">Health:</span>
          <span class="text-green-400 ml-2">{{ char.stats.health }}</span>
        </div>
        <div>
          <span class="text-gray-400">Mana:</span>
          <span class="text-blue-400 ml-2">{{ char.stats.mana }}</span>
        </div>
        <template
          v-for="stat in orderedStats"
          :key="stat"
        >
          <div>
            <span class="text-gray-400">{{ stat.charAt(0).toUpperCase() + stat.slice(1) }}:</span>
            <span :class="[getStatColor(stat), 'ml-2']">{{ char.stats[stat] }}</span>
          </div>
        </template>
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