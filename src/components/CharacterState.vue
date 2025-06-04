<script setup lang="ts">
import { useGameEngine } from '@/stores/game';
import { CLASS_ALIGNED_STATS, formatConsolidatedAffix } from '@/lib/game';
import { computed, ref, watch } from 'vue';
import { allAffixes, isAffixRange, type AffixValue } from '@/lib/affixTypes';
import { _cloneDeep } from '@/lib/object';
import FluidElement from './FluidElement.vue';

const gameEngine = useGameEngine();
const char = gameEngine.getCharacter;
const isLootPulsing = ref(false);
const isHealthPulsing = ref(false);
const isManaPulsing = ref(false);
const isGoldPulsing = ref(false);
const isLevelingUp = ref(false);
const healthPulseType = ref<'damage' | 'heal'>('damage');
const manaPulseType = ref<'gain' | 'loss'>('gain');
const showDetailedStats = ref(false);
const showStats = ref(false);

const hasEquippedItems = computed(() => {
  if (char === -1) return false;
  return Object.values(char.equipment).some(item => item !== undefined);
});

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

function combineAffixes( existingValue:AffixValue ,newValue: AffixValue){
  if (existingValue.type !== newValue.type){
    return existingValue;
  }

  switch (existingValue.type) {
    case 'range':
      if(isAffixRange(existingValue) && isAffixRange(newValue)){
        existingValue.minValue += newValue.minValue
        existingValue.maxValue += newValue.maxValue
      }
      break;
  
    default:
      if(!isAffixRange(existingValue) && !isAffixRange(newValue)){
        existingValue.value += newValue.value
      }
      break;
  }

  return existingValue;
}

const consolidateAffixes = (affixes: Array<{ id: string; category: string; value: AffixValue }>) => {
  const consolidated = new Map<string, {
    value: AffixValue;
    originalAffix: typeof allAffixes[0];
  }>();
  
  affixes.forEach(affix => {
    const key = affix.id.split('_')[1]; // Get the category part of the ID
    const originalAffix = allAffixes.find(a => a.id === affix.id);
    if (!originalAffix) return;

    if (consolidated.has(key)) {
      consolidated.get(key)!.value = combineAffixes(_cloneDeep(consolidated.get(key)!.value), affix.value);
    } else {
      consolidated.set(key, {
        value: affix.value,
        originalAffix
      });
    }
  });

  return Array.from(consolidated.entries()).map(([category, { value, originalAffix }]) => ({
    ...originalAffix,
    id: `${originalAffix.type}_${category}_-1`, // Create new ID with tier -1
    value
  }));
};

const groupedAffixes = computed(() => {
  if (char === -1) return { embedded: [], prefix: [], suffix: [] };
  
  const affixes = {
    embedded: [] as Array<{ id: string; category: string; value: AffixValue }>,
    prefix: [] as Array<{ id: string; category: string; value: AffixValue }>,
    suffix: [] as Array<{ id: string; category: string; value: AffixValue }>
  };

  // Collect all affixes from equipped items
  Object.values(char.equipment).forEach(item => {
    if (item?.itemDetails?.affixes) {
      affixes.embedded.push(...item.itemDetails.affixes.embedded);
      affixes.prefix.push(...item.itemDetails.affixes.prefix);
      affixes.suffix.push(...item.itemDetails.affixes.suffix);
    }
  });

  // console.log(affixes);

  // Consolidate affixes by category
  return {
    embedded: consolidateAffixes(affixes.embedded),
    prefix: consolidateAffixes(affixes.prefix),
    suffix: consolidateAffixes(affixes.suffix)
  };
});

</script>

<template>
  <FluidElement class="!p-0 md:!p-5 !border-0 md:!border-2">
    <div 
      class="
      flex flex-col 
      gap-3 p-4 
      bg-gray-800 
      relative
      rounded-lg border-4 
      border-slate-900      
      md:border-transparent
    "
      :class="[
        isLevelingUp ? 'animate-snake-border' : ''
      ]"
    >
      <template v-if="char !== -1 && gameEngine.getCombatStats !== -1">
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


        <div
          class="
          grid grid-cols-1 md:grid-cols-2 
          gap-2 items-center
          text-sm

          [&>div]:grid [&>div]:grid-cols-[2fr_3fr]
          [&>div]:text-center md:[&>div]:text-left
        "
        >
          <div class="ml-2 px-2">
            <span class="text-gray-400">Health:</span>
            <span 
              class="ml-2 px-2 py-1  place-self-center md:place-self-start" 
              :class="{ 'pulse-dynamic': isHealthPulsing }"
              :style="[
                { '--pulse-color': healthPulseType === 'damage' ? 'var(--pulse-color-damage)' : 'var(--pulse-color-heal)' },
              ]"
            >
              <span
                class="health-color"
                :style="healthColorClass"
              >{{ gameEngine.getCombatStats.health }}</span>/<span>{{ gameEngine.getCombatStats.maxHealth }}</span>
            </span>
          </div>
          <div class="ml-2 px-2">
            <span class="text-gray-400">Mana:</span>
            <span 
              class="text-blue-400 ml-2 px-2 py-1 place-self-center md:place-self-start"
              :class="{ 'pulse-dynamic': isManaPulsing }"
              :style="{ '--pulse-color': manaPulseType === 'loss' ? 'var(--pulse-color-damage)' : 'var(--pulse-color-heal)' }"
            ><span>{{ gameEngine.getCombatStats.mana }}</span>/<span>{{ gameEngine.getCombatStats.maxMana }}</span>
            </span>
          </div>
        </div>

        <!-- Stats Section -->
        <div class="relative">
          <button 
            class="md:hidden flex items-center gap-2 text-gray-400 hover:text-gray-300 mb-2"
            @click="showStats = !showStats"
          >
            <span 
              class="transform transition-transform duration-300 ease-in-out"
              :class="{ 'rotate-90': showStats }"
            >></span>
            Stats
          </button>
          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="transform -translate-y-2 opacity-0"
            enter-to-class="transform translate-y-0 opacity-100"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="transform translate-y-0 opacity-100"
            leave-to-class="transform -translate-y-2 opacity-0"
          >
            <div
              v-show="showStats"
              class="
              grid grid-cols-1 md:grid-cols-2 
              gap-2 items-center
              text-sm

              md:!grid 
              md:-my-3

              [&>div]:grid [&>div]:grid-cols-[2fr_3fr]
              [&>div]:text-center md:[&>div]:text-left
            "
            >
              <div class="ml-2 px-2">
                <span class="text-gray-400">Damage:</span>
                <span 
                  class="text-slate-400 ml-2 px-2 py-1"
                  :class="{ 'pulse-dynamic': isManaPulsing }"
                  :style="{ '--pulse-color': manaPulseType === 'loss' ? 'var(--pulse-color-damage)' : 'var(--pulse-color-heal)' }"
                ><span>~{{ gameEngine.getCombatStats.damagePerTick }} (
                  <span
                    title="Base"
                    class="text-slate-200"
                  >{{ gameEngine.getCombatStats.baseDamagePerTick }}</span>
                  <span
                    v-if="gameEngine.getCombatStats.damage.physical > 0"
                    title="Physical"
                  >+<span class="text-slate-400">{{ gameEngine.getCombatStats.damage.physical }}</span></span>
                  <span
                    v-if="gameEngine.getCombatStats.damage.elemental.cold > 0"
                    title="Cold"
                  >+<span class="text-blue-400">{{ gameEngine.getCombatStats.damage.elemental.cold }}</span></span>
                  <span
                    v-if="gameEngine.getCombatStats.damage.elemental.fire > 0"
                    title="Fire"
                  >+<span class="text-red-400">{{ gameEngine.getCombatStats.damage.elemental.fire }}</span></span>
                  <span
                    v-if="gameEngine.getCombatStats.damage.elemental.lightning > 0"
                    title="Lightning"
                  >+<span class="text-amber-400">{{ gameEngine.getCombatStats.damage.elemental.lightning }}</span></span>
                  <span
                    v-if="gameEngine.getCombatStats.damage.corruption.void > 0"
                    title="Void"
                  >+<span class="text-purple-400">{{ gameEngine.getCombatStats.damage.corruption.void }}</span></span>
                  <span
                    v-if="gameEngine.getCombatStats.damage.corruption.mental > 0"
                    title="Mental"
                  >+<span class="text-pink-400">{{ gameEngine.getCombatStats.damage.corruption.mental }}</span></span>
                  )</span>
                </span>
              </div>
              <div class="ml-2  px-2">
                <span class="text-gray-400">Mitigation:</span>
                <span 
                  class="text-slate-400 ml-2 px-2 inline-flex gap-x-2 w-full justify-center md:justify-start"
                  :class="{ 'pulse-dynamic': isManaPulsing }"
                  :style="{ '--pulse-color': manaPulseType === 'loss' ? 'var(--pulse-color-damage)' : 'var(--pulse-color-heal)' }"
                >
                  <span v-if="gameEngine.getCombatStats.mitigation.find(el => el.key === 'evasion')?.value">Dodge: ~{{ gameEngine.getCombatStats.mitigation.find(el => el.key === 'evasion')?.value || 0 }}%</span>
                  <span v-if="gameEngine.getCombatStats.mitigation.find(el => el.key === 'block')?.value">Block: ~{{ gameEngine.getCombatStats.mitigation.find(el => el.key === 'block')?.value || 0 }}%</span>
                </span>
              </div>
              <div class="ml-2  px-2">
                <span class="text-gray-400">Resist:</span>
                <span 
                  class="text-slate-400 ml-2 px-2 inline-flex gap-x-1 w-full justify-center md:justify-start"
                  :class="{ 'pulse-dynamic': isManaPulsing }"
                  :style="{ '--pulse-color': manaPulseType === 'loss' ? 'var(--pulse-color-damage)' : 'var(--pulse-color-heal)' }"
                >
                  <span
                    title="Physical Resist"
                    class="text-slate-400"
                  >{{ gameEngine.getCombatStats.mitigation.find(el => el.key === 'physical')?.value || 0 }}%</span>
                  <span
                    title="Cold Resist"
                    class="text-blue-300"
                  >{{ gameEngine.getCombatStats.mitigation.find(el => el.key === 'elemental_cold')?.value || 0 }}%</span>
                  <span
                    title="Fire Resist"
                    class="text-red-300"
                  >{{ gameEngine.getCombatStats.mitigation.find(el => el.key === 'elemental_fire')?.value || 0 }}%</span>
                  <span
                    title="Lightning Resist"
                    class="text-amber-300"
                  >{{ gameEngine.getCombatStats.mitigation.find(el => el.key === 'elemental_lightning')?.value || 0 }}%</span>
                </span>
              </div>
              <div class="ml-2  px-2">
                <span class="text-gray-400">Sanity:</span>
                <span 
                  class="text-slate-400 ml-2 px-2"
                  :class="{ 'pulse-dynamic': isManaPulsing }"
                  :style="{ '--pulse-color': manaPulseType === 'loss' ? 'var(--pulse-color-damage)' : 'var(--pulse-color-heal)' }"
                >
                  <span
                    title="Void Corruption"
                    class="text-purple-300"
                  >{{ gameEngine.getCombatStats.mitigation.find(el => el.key === 'corruption_void')?.value || 0 }}%  </span>
                  <span
                    title="Mental Corruption"
                    class="text-pink-300"
                  >{{ gameEngine.getCombatStats.mitigation.find(el => el.key === 'corruption_mental')?.value || 0 }}%  </span>
                </span>
              </div>
              <template
                v-for="stat in orderedStats"
                :key="stat"
              >
                <div class="ml-2  px-2">
                  <span class="text-gray-400">{{ stat.charAt(0).toUpperCase() + stat.slice(1) }}:</span>
                  <span :class="[getStatColor(stat), 'ml-2']">{{ gameEngine.getCombatStats.attributes[stat] }}</span>
                </div>
              </template>
            </div>
          </Transition>
        </div>

        <div 
          class="
          w-full h-3.5
          bg-emerald-700/30
          self-end
          mx-auto md:mt-2 
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

        <div
          v-if="hasEquippedItems"
          class="text-gray-300 text-sm"
        >
          <button 
            class="flex items-center gap-2 cursor-pointer hover:text-gray-300"
            @click="showDetailedStats = !showDetailedStats"
          >
            <span 
              class="transform transition-transform duration-300 ease-in-out text-gray-400"
              :class="{ 'rotate-90': showDetailedStats }"
            >></span>
            Equipment Stats
          </button>
          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="transform -translate-y-2 opacity-0"
            enter-to-class="transform translate-y-0 opacity-100"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="transform translate-y-0 opacity-100"
            leave-to-class="transform -translate-y-2 opacity-0"
          >
            <div
              v-show="showDetailedStats"
              class="mt-2 bg-gray-900/50 p-3 rounded-lg"
            >
              <div class="space-y-4">
                <template v-if="groupedAffixes.embedded.length > 0">
                  <div class="space-y-2">
                    <h4 class="text-cyan-400 font-medium">
                      Embedded Affixes
                    </h4>
                    <div class="pl-4 space-y-1">
                      <div
                        v-for="affix in groupedAffixes.embedded"
                        :key="affix.id"
                        class="text-gray-300"
                      >
                        {{ formatConsolidatedAffix(affix) }}
                      </div>
                    </div>
                  </div>
                </template>

                <template v-if="groupedAffixes.prefix.length > 0">
                  <div class="space-y-2">
                    <h4 class="text-purple-400 font-medium">
                      Prefix Affixes
                    </h4>
                    <div class="pl-4 space-y-1">
                      <div
                        v-for="affix in groupedAffixes.prefix"
                        :key="affix.id"
                        class="text-gray-300"
                      >
                        {{ formatConsolidatedAffix(affix) }}
                      </div>
                    </div>
                  </div>
                </template>

                <template v-if="groupedAffixes.suffix.length > 0">
                  <div class="space-y-2">
                    <h4 class="text-yellow-400 font-medium">
                      Suffix Affixes
                    </h4>
                    <div class="pl-4 space-y-1">
                      <div
                        v-for="affix in groupedAffixes.suffix"
                        :key="affix.id"
                        class="text-gray-300"
                      >
                        {{ formatConsolidatedAffix(affix) }}
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </Transition>
        </div>
      </template>
    </div>
  </FluidElement>
</template> 

<style lang="css" scoped>
  * {
    --pulse-color-loot: rgba(255, 215, 0, 0.1);
    --pulse-color-damage: rgba(255, 0, 0, 0.1);
    --pulse-color-heal: rgba(0, 255, 255, 0.1);
    --level-up-color: rgb(255, 213, 0);
    --core-ui-border-color: oklch(20.8% 0.042 265.755);

    @media (min-width: 768px) {
      --core-ui-border-color: oklch(50.8% 0.118 165.612);
    }
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
      var(--core-ui-border-color) 0%,
      var(--core-ui-border-color) 25%,
      color-mix(in srgb, var(--level-up-color) 20%, var(--core-ui-border-color)) 30%,
      var(--level-up-color) 40%,
      var(--level-up-color) 60%,
      color-mix(in srgb, var(--level-up-color) 20%, var(--core-ui-border-color)) 70%,
      var(--core-ui-border-color) 75%,
      var(--core-ui-border-color) 100%
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