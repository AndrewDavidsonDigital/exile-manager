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

const experienceWidth = computed(() =>  char !== -1 ? `${ Math.round((char.experience / (char.level * 100)) * 100) }%` : '0%');

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
        <div class="text-right font-bold text-white capitalize">
          <h3 class="text-xl">
            Loot: {{ char.loot?.length }}
          </h3>
          <div class="text-yellow-400">
            Gold: {{ char.gold }}
          </div>
        </div>
      </div>

      <!-- Stats Section -->
      <div class="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span class="text-gray-400">Health:</span>
          <span class="text-green-400 ml-2">{{ char.stats.currentHealth }}/{{ char.stats.health }}</span>
        </div>
        <div>
          <span class="text-gray-400">Mana:</span>
          <span class="text-blue-400 ml-2">{{ char.stats.currentMana }}/{{ char.stats.mana }}</span>
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

      <div 
        class="
          w-full h-3.5
          bg-emerald-700/30
          self-end
          mx-auto 
          relative
          border border-slate-600/50 rounded-full
          
          after:bg-emerald-700
          after:bg-gradient-to-tr after:via-40%
          after:from-emerald-900 after:via-emerald-800/50 after:to-teal-500/50
          after:absolute
          after_w-dynamic after:h-full after:rounded-full after:transition-all after:duration-500 after:ease-in-out

          before:absolute before:size-full
          before_current-percent before:text-slate-300 before:z-10 
          before:text-center before:text-xs
        "
        :style="`--num:${Math.round((char.experience / (char.level * 100)) * 100)};`"
      >
      </div>
    </template>
  </div>
</template> 

<style lang="css" scoped>
  @property --num {
    syntax: "<integer>";
    initial-value: 0;
    inherits: false;
  }
  .before_current-percent {
    animation-fill-mode: forwards;
    animation-name: counter;
    animation-duration: 100ms;
    counter-reset: num var(--num);
  }

  .before_current-percent::before {
    content: counter(num) "%";
  }

  .after_w-dynamic::after {
    width: v-bind(experienceWidth);
  }
</style>