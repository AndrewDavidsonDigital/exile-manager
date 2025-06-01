<script setup lang="ts">
import { useGameEngine } from '@/stores/game';
import { CLASS_ALIGNED_STATS } from '@/lib/game';
import { computed, ref, watch } from 'vue';

const gameEngine = useGameEngine();
const char = gameEngine.getCharacter;
const isLootPulsing = ref(false);
const isHealthPulsing = ref(false);
const isManaPulsing = ref(false);
const isGoldPulsing = ref(false);
const isLevelingUp = ref(false);
const healthPulseType = ref<'damage' | 'heal'>('damage');
const manaPulseType = ref<'gain' | 'loss'>('gain');

const PULSE_DURATION = 500;
const LEVEL_UP_DURATION = 2000;

const pulseDurationMs = computed(() => `${PULSE_DURATION}ms`);

// Watch for loot changes
watch(() => char !== -1 ? char.loot?.length : 0, () => {
  isLootPulsing.value = true;
  setTimeout(() => {
    isLootPulsing.value = false;
  }, PULSE_DURATION);
});

// Watch for health changes
watch(() => char !== -1 ? char.stats.currentHealth : 0, (newHealth, oldHealth) => {
  if (char === -1 || oldHealth === undefined) return;
  
  isHealthPulsing.value = true;
  healthPulseType.value = newHealth < oldHealth ? 'damage' : 'heal';
  
  setTimeout(() => {
    isHealthPulsing.value = false;
  }, PULSE_DURATION);
});

// Watch for mana changes
watch(() => char !== -1 ? char.stats.currentMana : 0, (newMana, oldMana) => {
  if (char === -1 || oldMana === undefined) return;
  
  isManaPulsing.value = true;
  manaPulseType.value = newMana < oldMana ? 'loss' : 'gain';
  
  setTimeout(() => {
    isManaPulsing.value = false;
  }, PULSE_DURATION);
});

// Watch for gold changes
watch(() => char !== -1 ? char.gold : 0, () => {
  isGoldPulsing.value = true;
  setTimeout(() => {
    isGoldPulsing.value = false;
  }, PULSE_DURATION);
});

// Watch for level changes
watch(() => char !== -1 ? char.level : 0, (newLevel, oldLevel) => {
  if (char === -1 || oldLevel === undefined) return;
  
  isLevelingUp.value = true;
  setTimeout(() => {
    isLevelingUp.value = false;
  }, LEVEL_UP_DURATION);
});

const orderedStats = computed(() => {
  if (char === -1) return [];
  
  const allStats = CLASS_ALIGNED_STATS[char.class];
  const baseStats = ['fortitude', 'fortune', 'wrath', 'affinity'] as const;
  const alignedStats = baseStats.filter(stat => allStats.includes(stat));
  const nonAlignedStats = baseStats.filter(stat => !allStats.includes(stat));
  
  return [...alignedStats, ...nonAlignedStats];
});

const experienceWidth = computed(() =>  char !== -1 ? `${ Math.round((char.experience / (char.level * 100)) * 100) }%` : '0%');

const healthColorClass = computed(() => {
  if (char === -1) return '';
  const healthPercent = (char.stats.currentHealth / char.stats.health) * 100;
  return {
    '--health-percent': Math.min(Math.max(Math.round(healthPercent), 0), 100)
  };
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
  <div 
    class="flex flex-col gap-4 p-4 bg-gray-800 rounded-lg border-4 relative border-transparent"
    :class="[
      isLevelingUp ? 'animate-snake-border' : ''
    ]"
  >
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
          <h3
            class="text-xl px-2 py-1"
            :class="{ 'pulse-dynamic': isLootPulsing }"
            style="--pulse-color: var(--pulse-color-loot)"
          >
            Loot: {{ char.loot?.length }}
          </h3>
          <div 
            class="text-yellow-400 px-2 py-1"
            :class="{ 'pulse-dynamic': isGoldPulsing }"
            style="--pulse-color: var(--pulse-color-loot)"
          >
            Gold: {{ char.gold }}
          </div>
        </div>
      </div>

      <!-- Stats Section -->
      <div class="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span class="text-gray-400">Health:</span>
          <span 
            class="ml-2 px-2 py-1" 
            :class="{ 'pulse-dynamic': isHealthPulsing }"
            :style="[
              { '--pulse-color': healthPulseType === 'damage' ? 'var(--pulse-color-damage)' : 'var(--pulse-color-heal)' },
            ]"
          >
            <span
              class="health-color"
              :style="healthColorClass"
            >{{ char.stats.currentHealth }}</span>/<span>{{ char.stats.health }}</span>
          </span>
        </div>
        <div>
          <span class="text-gray-400">Mana:</span>
          <span 
            class="text-blue-400 ml-2 px-2 py-1"
            :class="{ 'pulse-dynamic': isManaPulsing }"
            :style="{ '--pulse-color': manaPulseType === 'loss' ? 'var(--pulse-color-damage)' : 'var(--pulse-color-heal)' }"
          >
            {{ char.stats.currentMana }}/{{ char.stats.mana }}
          </span>
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
        :style="`--num:${Math.min(100, Math.round((char.experience / (char.level * 100)) * 100))};`"
      >
      </div>
    </template>
  </div>
</template> 

<style lang="css" scoped>
* {
  --pulse-color-loot: rgba(255, 215, 0, 0.1);
  --pulse-color-damage: rgba(255, 0, 0, 0.1);
  --pulse-color-heal: rgba(0, 255, 255, 0.1);
  --level-up-color: rgb(255, 213, 0);
}

@property --num {
  syntax: "<integer>";
  initial-value: 0;
  inherits: false;
}

.health-color {
  transition: color 0.3s ease, opacity 0.3s ease;
  color: color-mix(in srgb, rgb(74, 222, 128) var(--health-percent), rgb(163, 163, 163));
  opacity: calc(0.5 + (var(--health-percent) * 0.5 / 100));
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
  max-width: 100%;
}

.pulse-dynamic {
  position: relative;
  animation: pulse-dynamic v-bind(pulseDurationMs) ease-in-out;
}

.pulse-dynamic::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: inherit;
  background: radial-gradient(
    var(--pulse-color, rgba(255, 215, 0, 0.2)),
    transparent 70%,
    transparent 100%
  );
  opacity: 0;
  animation: pulse-dynamic-bg v-bind(pulseDurationMs) ease-in-out;
  z-index: -1;
}

@keyframes pulse-dynamic {
  0% {
    transform: scale(1);
  }
  30%, 70% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes pulse-dynamic-bg {
  0% {
    opacity: 0;
  }
  30%, 70% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes snake-border {
  0% {
    background-position: 0% 0;
  }
  100% {
    background-position: 150% 0;
  }
}

.animate-snake-border {
  position: relative;
  border: 4px solid transparent;
}

.animate-snake-border::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: inherit;
  padding: 4px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    transparent 25%,
    color-mix(in srgb, var(--level-up-color) 20%, transparent) 30%,
    var(--level-up-color) 40%,
    var(--level-up-color) 60%,
    color-mix(in srgb, var(--level-up-color) 20%, transparent) 70%,
    transparent 75%,
    transparent 100%
  );
  background-size: 200% 100%;
  -webkit-mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: snake-border v-bind(LEVEL_UP_DURATION + 'ms') linear forwards;
}
</style>