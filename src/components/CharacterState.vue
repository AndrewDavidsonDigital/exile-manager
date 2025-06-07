<script setup lang="ts">
import { useGameEngine } from '@/stores/game';
import { CLASS_ALIGNED_STATS, formatConsolidatedAffix, type ILoot } from '@/lib/game';
import { SkillActivationLayer, SkillResource, SkillTarget, SkillTiming, TIER_SEPARATOR } from '@/lib/core';
import { computed, ref, watch } from 'vue';
import { AffixCategory, AffixTypes, allAffixes, BaseItemAffix, isAffixRange, type AffixValue, type IAffix, type IBaseAffix } from '@/lib/affixTypes';
import { _cloneDeep } from '@/lib/object';
import { calculateCriticalChance } from '@/lib/combatMechanics';
import FluidElement from './FluidElement.vue';
import { getAffixByType } from '@/lib/affixUtils';
import { formatBaseAffixValue } from '@/lib/itemUtils';
import { IconPassiveTree, IconSkills } from './icons';
import ModalDialog from './ModalDialog.vue';
import SwitchToggle from './SwitchToggle.vue';
import { passives } from '@/data/passives';
import { skills } from '@/data/skills';
import { ErrorNumber } from '@/lib/typescript';


interface Props {
  class?: string;
}

const props = defineProps<Props>();

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

const showPassivesModal = ref<boolean>(false);
const showNewPassivesModal = ref<boolean>(false);
const showSkillsModal = ref<boolean>(false);
const showNewSkillsModal = ref<boolean>(false);

const availablePassives = computed(() => passives.filter(el => !(gameEngine.getPassiveIds.includes(el._identifier))));
const availableSkills = computed(() => skills.filter(el => !(gameEngine.getSkillIds.includes(el._identifier))));

const hasEquippedItems = computed(() => {
  if (char === ErrorNumber.NOT_FOUND) return false;
  return Object.values(char.equipment).some(item => item !== undefined);
});

const SKILLS_MODAL_ID = 'skills_modal_id';
const PASSIVES_MODAL_ID = 'passive_modal_id';
const NEW_SKILLS_MODAL_ID = 'new_skills_modal_id';
const NEW_PASSIVES_MODAL_ID = 'new_passive_modal_id';

const PULSE_DURATION = 500;
const LEVEL_UP_DURATION = 2000;

const pulseDurationMs = computed(() => `${PULSE_DURATION}ms`);

// Watch for loot changes
watch(() => char !== ErrorNumber.NOT_FOUND ? char.loot?.length : 0, () => {
  isLootPulsing.value = true;
  setTimeout(() => {
    isLootPulsing.value = false;
  }, PULSE_DURATION);
});

// Watch for health changes
watch(() => char !== ErrorNumber.NOT_FOUND ? char.stats.currentHealth : 0, (newHealth, oldHealth) => {
  if (char === ErrorNumber.NOT_FOUND || oldHealth === undefined) return;
  
  isHealthPulsing.value = true;
  healthPulseType.value = newHealth < oldHealth ? 'damage' : 'heal';
  
  setTimeout(() => {
    isHealthPulsing.value = false;
  }, PULSE_DURATION);
});

// Watch for mana changes
watch(() => char !== ErrorNumber.NOT_FOUND ? char.stats.currentMana : 0, (newMana, oldMana) => {
  if (char === ErrorNumber.NOT_FOUND || oldMana === undefined) return;
  
  isManaPulsing.value = true;
  manaPulseType.value = newMana < oldMana ? 'loss' : 'gain';
  
  setTimeout(() => {
    isManaPulsing.value = false;
  }, PULSE_DURATION);
});

// Watch for gold changes
watch(() => char !== ErrorNumber.NOT_FOUND ? char.gold : 0, () => {
  isGoldPulsing.value = true;
  setTimeout(() => {
    isGoldPulsing.value = false;
  }, PULSE_DURATION);
});

// Watch for level changes
watch(() => char !== ErrorNumber.NOT_FOUND ? char.level : 0, (newLevel, oldLevel) => {
  if (char === ErrorNumber.NOT_FOUND || oldLevel === undefined) return;
  
  isLevelingUp.value = true;
  setTimeout(() => {
    isLevelingUp.value = false;
  }, LEVEL_UP_DURATION);
});

const orderedStats = computed(() => {
  if (char === ErrorNumber.NOT_FOUND) return [];
  
  const allStats = CLASS_ALIGNED_STATS[char.class];
  const baseStats = ['fortitude', 'fortune', 'wrath', 'affinity'] as const;
  const alignedStats = baseStats.filter(stat => allStats.includes(stat));
  const nonAlignedStats = baseStats.filter(stat => !allStats.includes(stat));
  
  return [...alignedStats, ...nonAlignedStats];
});

const experienceWidth = computed(() =>  char !== ErrorNumber.NOT_FOUND ? `${ Math.round((char.experience / (char.level * 100)) * 100) }%` : '0%');

const healthColorClass = computed(() => {
  if (char === ErrorNumber.NOT_FOUND) return '';
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
    case AffixTypes.RANGE:
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

const consolidateBaseAffixes = (affixes: Array<{ id: string; affixType: BaseItemAffix; value: AffixValue }>):
  Array<{
    key: string;
    entry: {
      value: AffixValue;
      baseAffix: IBaseAffix;
      }   
  }> => {
  const consolidated = new Map<string, {
    value: AffixValue;
    baseAffix: IBaseAffix;
  }>();
  
  affixes.forEach(affix => {
    // console.log(affix);
    const key = affix.id.split('_')[1]; // Get the category part of the ID
    // need to resolve base-affix details
    const baseAffix = getAffixByType(affix.affixType);
    // console.log('ba: ',baseAffix);
    if (!baseAffix) return;

    if (consolidated.has(key)) {
      consolidated.get(key)!.value = combineAffixes(_cloneDeep(consolidated.get(key)!.value), affix.value);
    } else {
      consolidated.set(key, {
        value: affix.value,
        baseAffix
      });
    }
  });

  const retval: Array<{
    key: string;
    entry: {
      value: AffixValue;
      baseAffix: IBaseAffix;
      }   
  }> = [];

  for (const [key, value] of consolidated) {
    retval.push({
      key,
      entry: value,
    })
  }

  return retval;
};

const consolidateAffixes = (affixes: Array<{ id: string; category: AffixCategory; value: AffixValue }>) => {
  const consolidated = new Map<string, {
    value: AffixValue;
    originalAffix: IAffix;
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
  if (char === ErrorNumber.NOT_FOUND) return { embedded: [], prefix: [], suffix: [], base: [] };
  
  const affixes = {
    embedded: [] as Array<{ id: string; category: AffixCategory; value: AffixValue }>,
    prefix: [] as Array<{ id: string; category: AffixCategory; value: AffixValue }>,
    suffix: [] as Array<{ id: string; category: AffixCategory; value: AffixValue }>,
    base: [] as Array<{ id: string; affixType: BaseItemAffix; value: AffixValue }>
  };

  // Collect all affixes from equipped items
  Object.values(char.equipment).forEach((item: ILoot) => {
    // console.log(item?.itemDetails?.baseDetails);
    if (item?.itemDetails) {
      // Add base affix if it exists
      if (item.itemDetails.baseDetails) {
        affixes.base.push({
          id: `base_${item.itemDetails.baseDetails.affix}_-1`,
          affixType: item.itemDetails.baseDetails.affix,
          value: _cloneDeep(item.itemDetails.baseDetails.value) as AffixValue
        });
      }
      
      // Add regular affixes if they exist
      if (item.itemDetails.affixes) {
        affixes.embedded.push(...item.itemDetails.affixes.embedded);
        affixes.prefix.push(...item.itemDetails.affixes.prefix);
        affixes.suffix.push(...item.itemDetails.affixes.suffix);
      }
    }
  });

  
  // Consolidate affixes by category
  return {
    embedded: consolidateAffixes(affixes.embedded),
    prefix: consolidateAffixes(affixes.prefix),
    suffix: consolidateAffixes(affixes.suffix),
    base: consolidateBaseAffixes(affixes.base)
  };
});

function handleSkillsClick(){
  if (char === ErrorNumber.NOT_FOUND) return;

  if (char.pendingRewards.skills > 0){
    showNewSkillsModal.value = !showNewSkillsModal.value
  }else{
    showSkillsModal.value = !showSkillsModal.value
  }
}

function handlePassivesClick(){
  if (char === ErrorNumber.NOT_FOUND) return;

  if (char.pendingRewards.passives > 0){
    showNewPassivesModal.value = !showNewPassivesModal.value
  }else{
    showPassivesModal.value = !showPassivesModal.value
  }
}

function handleAddPassive(identifier: string){
  try{
    gameEngine.addPassive(identifier);
  } finally{
    showNewPassivesModal.value = false;
  }
}

function handleAddSkill(identifier: string){
  try{
    gameEngine.addSkill(identifier);
  } finally{
    showNewSkillsModal.value = false;
  }
}

</script>

<template>
  <FluidElement
    class="!p-0 md:!p-5 !border-0 md:!border-2"
    :class="props.class"
  >
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
      <template v-if="char !== ErrorNumber.NOT_FOUND && gameEngine.getCombatStats !== ErrorNumber.NOT_FOUND">
        <div class="flex justify-between">
          <div class="flex flex-col gap-2">
            <div class="text-xl font-bold text-white capitalize">
              {{ char.name }}
            </div>
            <div class="text-sm text-gray-300">
              Level {{ char.level }} {{ char.class }}
            </div>
          </div>
          <div class="flex gap-2 ">
            <button 
              class="size-fit my-auto opacity-70 hover:scale-110 transition-all duration-300 hover:[&>svg]:!animation-pause"
              @click="handleSkillsClick"
            >
              <IconSkills
                :class="[
                  {'animate-colour-pulse': char.pendingRewards.skills > 0 && !showSkillsModal},
                  {'opacity-50 hover:opacity-80': !(char.pendingRewards.skills)},
                ]"
                :style="`
                  --dynamic-colour-pulse-out: oklch(0.88 0.18 194.49);
                  --dynamic-colour-pulse-in: oklch(0.723 0.219 149.579);
                `"
              />
            </button>
            <button
              class="size-fit my-auto opacity-70 hover:scale-110 transition-all duration-300 hover:[&>svg]:!animation-pause"
              @click="handlePassivesClick"
            >
              <IconPassiveTree 
                :class="[
                  {'animate-colour-pulse': char.pendingRewards.passives > 0 && !showPassivesModal},
                  {'opacity-50 hover:opacity-80': !(char.pendingRewards.passives)},
                ]"
                :style="`
                  --dynamic-colour-pulse-out: oklch(0.88 0.18 194.49);
                  --dynamic-colour-pulse-in: oklch(0.723 0.219 149.579);
                `"
              />
            </button>
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
              Gold: {{ Math.floor(char.gold) }}
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
                <span class="text-gray-400">Critical:</span>
                <span 
                  class="text-slate-400 ml-2 px-2 inline-flex gap-x-2 w-full justify-center md:justify-start"
                >
                  <span>~{{ calculateCriticalChance(gameEngine.getCombatStats.criticalStrike) }}%</span>
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
                  <span v-if="gameEngine.getCombatStats.deflection">Deflect: {{ gameEngine.getCombatStats.deflection || 0 }}</span>
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
              <!--
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
              -->
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
              <div class="space-y-4 grid grid-cols-1 lg:grid-cols-2">
                <template v-if="groupedAffixes.base.length > 0">
                  <div class="space-y-2">
                    <h4 class="text-emerald-400 font-medium">
                      Base Items
                    </h4>
                    <div class="pl-4 space-y-1">
                      <div
                        v-for="affix in groupedAffixes.base"
                        :key="affix.key"
                        class="text-gray-300"
                      >
                        {{ formatBaseAffixValue(affix.entry.value) }} {{ affix.entry.baseAffix.name }}
                      </div>
                    </div>
                  </div>
                </template>

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
                      Prefixes
                    </h4>
                    <div class="pl-4 space-y-1">
                      <div
                        v-for="affix in groupedAffixes.prefix"
                        :key="affix.id"
                        class="text-gray-300"
                      >
                        {{ formatConsolidatedAffix(affix).split(TIER_SEPARATOR) }}
                      </div>
                    </div>
                  </div>
                </template>

                <template v-if="groupedAffixes.suffix.length > 0">
                  <div class="space-y-2">
                    <h4 class="text-yellow-400 font-medium">
                      Suffixes
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
  <ModalDialog
    :id="SKILLS_MODAL_ID"
    :show="showSkillsModal"
    @close="showSkillsModal = false"
  >
    <section class="text-emerald-400">
      <h3 class="text-xl font-bold mb-4 mx-auto w-fit">
        Skills
      </h3>
      <div
        v-if="char !== ErrorNumber.NOT_FOUND"
        class="space-y-3"
      >
        <template
          v-for="skill,index in char.skills"
          :key="`skills_${index}`"
        >
          <FluidElement
            class="p-3"
            :class="[
              {'opacity-50': !(skill.isEnabled)}
            ]"
          >
            <div class="flex flex-col gap-2">
              <div class="flex justify-between items-center">
                <span class="inline-flex items-baseline-last">
                  <h4 class="text-lg font-medium capitalize">
                    {{ skill.name }}:
                  </h4>
                  <span
                    class="text-sm text-gray-400 capitalize ml-2"
                    :class="[
                      { 'text-red-400': skill.activationLayer === SkillActivationLayer.COMBAT },
                      { 'text-teal-400': skill.activationLayer === SkillActivationLayer.RESTING },
                      { 'text-white': skill.activationLayer === SkillActivationLayer.WORLD },
                    ]"
                  >
                    {{ skill.activationLayer }}
                  </span>
                </span>
                <SwitchToggle 
                  v-model="skill.isEnabled"
                />
              </div>
              <div class="flex flex-col gap-1 text-sm text-gray-300">
                <div class="flex gap-4 justify-between">
                  <span
                    class="capitalize"
                  >
                    Target: <span 
                      :class="[
                        { 'text-red-400': skill.target === SkillTarget.ENEMY },
                        { 'text-teal-400': skill.target === SkillTarget.SELF },
                      ]"
                    >{{ skill.target }}</span>
                  </span>
                  <span class="capitalize">
                    Cost: <span
                      :class="[
                        { 'text-red-300': skill.cost.resource === SkillResource.HEALTH },
                        { 'text-blue-300': skill.cost.resource === SkillResource.MANA },
                        { 'text-amber-300/70': skill.cost.resource === SkillResource.GOLD },
                      ]"
                    >{{ skill.cost.amount }} {{ skill.cost.resource }}</span>
                  </span>
                </div>
                <div class="flex gap-4 justify-between">
                  <span
                    v-if="skill.duration"
                    class="capitalize"
                  >
                    Duration: {{ skill.duration.count }} {{ skill.duration.timing }}{{ skill.duration.count > 1 ? 's': '' }}
                  </span>
                  <span class="capitalize">
                    Cooldown: <span
                      :class="[
                        { 'text-red-400': skill.cooldown.timing === SkillTiming.RUN },
                        { 'text-teal-400': skill.cooldown.timing === SkillTiming.TURN },
                      ]"
                    >{{ skill.cooldown.count }} {{ skill.cooldown.timing }}{{ skill.cooldown.count > 1 ? 's': '' }}
                    </span>
                  </span>
                </div>
                <div class="text-sm text-gray-300 capitalize">
                  Effect: {{ skill.effect.change > 0 ? '+' : '' }}{{ skill.effect.change }}{{ skill.effect.type === AffixTypes.MULTIPLICATIVE ? '%' : '' }} {{ skill.effect.target }}
                </div>
                <div class="flex flex-wrap gap-2 mt-2">
                  <span class="text-gray-400">Triggers:</span>
                  <button 
                    v-for="trigger in skill.triggerStates" 
                    :key="trigger"
                    class="px-2 py-0.5 bg-gray-800 rounded-full capitalize border-transparent border text-emerald-400 duration-300 transition-all"
                    :class="[
                      { '!border-emerald-500' : skill.setTrigger === trigger },
                      { 'opacity-50' : skill.setTrigger !== trigger },
                      { 'pointer-events-none' : !(skill.isEnabled) },
                    ]"
                    @click="gameEngine.setSkillTrigger(index, trigger)"
                  >
                    {{ trigger }}
                  </button>
                </div>
              </div>
            </div>
          </FluidElement>
        </template>
      </div>
    </section>
  </ModalDialog>
  <ModalDialog
    :id="PASSIVES_MODAL_ID"
    :show="showPassivesModal"
    @close="showPassivesModal = false"
  >
    <section class="text-emerald-400">
      <h3 class="text-xl font-bold mb-4 mx-auto w-fit">
        Passives
      </h3>
      <div
        v-if="char !== ErrorNumber.NOT_FOUND"
        class="space-y-3"
      >
        <template
          v-for="passive,index in char.passives"
          :key="`passives_${index}`"
        >
          <FluidElement class="p-3">
            <div class="flex flex-col gap-2">
              <div class="flex justify-between items-center">
                <h4 class="text-lg font-medium capitalize">
                  {{ passive.name }}
                </h4>
              </div>
              <div class="text-sm text-gray-300 capitalize">
                Effect: +{{ passive.effect.change }}{{ passive.effect.type === AffixTypes.MULTIPLICATIVE ? '%' : '' }} {{ passive.effect.target }}
              </div>
            </div>
          </FluidElement>
        </template>
      </div>
    </section>
  </ModalDialog>
  <ModalDialog
    :id="NEW_PASSIVES_MODAL_ID"
    :show="showNewPassivesModal"
    disable-lite-dismiss
    @close="showNewPassivesModal = false"
  >
    <section class="text-emerald-400">
      <h3 class="text-xl font-bold mb-4 mx-auto w-fit">
        Select a new Passive
      </h3>
      <div
        v-if="char !== ErrorNumber.NOT_FOUND"
        class="flex gap-2 flex-wrap justify-center"
      >
        <template
          v-for="passive,index in (availablePassives.toSorted(() => 0.5 - Math.random()).slice(0, 3))"
          :key="`passives_${index}`"
        >
          <button 
            class="hover:scale-125 duration-300 transition-all hover:z-10 mt-5"
            @click="handleAddPassive(passive._identifier)"
          >
            <FluidElement
              class="p-3 hover:border-amber-400  duration-300 transition-all"
            >
              <div class="flex flex-col gap-2">
                <div class="flex justify-between items-center">
                  <h4 class="text-lg font-medium capitalize">
                    {{ passive.name }}
                  </h4>
                </div>
                <div class="text-sm text-gray-300 capitalize">
                  Effect: +{{ passive.effect.change }}{{ passive.effect.type === AffixTypes.MULTIPLICATIVE ? '%' : '' }} {{ passive.effect.target }}
                </div>
              </div>
            </FluidElement>
          </button>
        </template>
      </div>
    </section>
  </ModalDialog>

  <ModalDialog
    :id="NEW_SKILLS_MODAL_ID"
    :show="showNewSkillsModal"
    class="!p-[3%] md:!px-10 md:!pb-10  md:!pt-4"
    @close="showNewSkillsModal = false"
  >
    <section class="text-emerald-400">
      <h3 class="text-xl font-bold mb-4 mx-auto w-fit">
        Select a new Skills
      </h3>
      <div
        v-if="char !== ErrorNumber.NOT_FOUND"
        class="flex gap-2 flex-wrap justify-center"
      >
        <template
          v-for="skill,index in (availableSkills.toSorted(() => 0.5 - Math.random()).slice(0, 3))"
          :key="`skills_${index}`"
        >
          <button 
            class="hover:scale-125 duration-300 transition-all hover:z-10 mt-5"
            @click="handleAddSkill(skill._identifier)"
          >
            <FluidElement
              class="p-3 hover:border-amber-400  duration-300 transition-all"
            >
              <div class="flex flex-col gap-2">
                <div class="flex justify-between items-center">
                  <span class="inline-flex items-baseline-last">
                    <h4 class="text-lg font-medium capitalize">
                      {{ skill.name }}:
                    </h4>
                    <span
                      class="text-sm text-gray-400 capitalize ml-2"
                      :class="[
                        { 'text-red-400': skill.activationLayer === SkillActivationLayer.COMBAT },
                        { 'text-teal-400': skill.activationLayer === SkillActivationLayer.RESTING },
                        { 'text-white': skill.activationLayer === SkillActivationLayer.WORLD },
                      ]"
                    >
                      {{ skill.activationLayer }}
                    </span>
                  </span>
                </div>
                <div class="flex flex-col gap-1 text-sm text-gray-300">
                  <div class="flex gap-4 justify-between">
                    <span
                      class="capitalize"
                    >
                      Target: <span 
                        :class="[
                          { 'text-red-400': skill.target === SkillTarget.ENEMY },
                          { 'text-teal-400': skill.target === SkillTarget.SELF },
                        ]"
                      >{{ skill.target }}</span>
                    </span>
                    <span class="capitalize">
                      Cost: <span
                        :class="[
                          { 'text-red-300': skill.cost.resource === SkillResource.HEALTH },
                          { 'text-blue-300': skill.cost.resource === SkillResource.MANA },
                          { 'text-amber-300/70': skill.cost.resource === SkillResource.GOLD },
                        ]"
                      >{{ skill.cost.amount }} {{ skill.cost.resource }}</span>
                    </span>
                  </div>
                  <div class="flex gap-4 justify-between">
                    <span
                      v-if="skill.duration"
                      class="capitalize"
                    >
                      Duration: {{ skill.duration.count }} {{ skill.duration.timing }}{{ skill.duration.count > 1 ? 's': '' }}
                    </span>
                    <span class="capitalize">
                      Cooldown: <span
                        :class="[
                          { 'text-red-400': skill.cooldown.timing === SkillTiming.RUN },
                          { 'text-teal-400': skill.cooldown.timing === SkillTiming.TURN },
                        ]"
                      >{{ skill.cooldown.count }} {{ skill.cooldown.timing }}{{ skill.cooldown.count > 1 ? 's': '' }}
                      </span>
                    </span>
                  </div>
                  <div class="text-sm text-gray-300 capitalize">
                    Effect: {{ skill.effect.change > 0 ? '+' : '' }}{{ skill.effect.change }}{{ skill.effect.type === AffixTypes.MULTIPLICATIVE ? '%' : '' }} {{ skill.effect.target }}
                  </div>
                  <div class="flex flex-wrap gap-2 mt-2">
                    <span class="text-gray-400">Triggers:</span>
                    <button 
                      v-for="trigger in skill.triggerStates" 
                      :key="trigger"
                      class="px-2 py-0.5 bg-gray-800 rounded-full capitalize border-transparent border text-emerald-400 duration-300 transition-all"
                      :class="[
                        { '!border-emerald-500' : skill.setTrigger === trigger },
                        { 'opacity-50' : skill.setTrigger !== trigger },
                        { 'pointer-events-none' : !(skill.isEnabled) },
                      ]"
                      @click="gameEngine.setSkillTrigger(index, trigger)"
                    >
                      {{ trigger }}
                    </button>
                  </div>
                </div>
              </div>
            </FluidElement>
          </button>
        </template>
      </div>
    </section>
  </ModalDialog>
</template> 


<style lang="css" scoped>
  * {
    --pulse-color-loot: rgba(255, 215, 0, 0.1);
    --pulse-color-damage: rgba(255, 0, 0, 0.1);
    --pulse-color-heal: rgba(0, 255, 255, 0.1);
    --level-up-color: rgb(255, 213, 0);
    --core-ui-border-color: oklch(20.8% 0.042 265.755);

    @media (min-width: 768px) {
      --core-ui-border-color: transparent;
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


.animate-colour-pulse {
  animation: colour-pulse-dynamic 3s ease-in-out forwards infinite;
}

@keyframes colour-pulse-dynamic {
  0% {
    opacity: 1;
    color: var(--dynamic-colour-pulse-out, red);
    scale: 0.9;
  }
  25% {
    opacity: 0.8;
    scale: 1;
  }
  50% {
    opacity: 1;
    color: var(--dynamic-colour-pulse-in, blue);
    scale: 0.9;
  }
  75% {
    opacity: 0.8;
    scale: 1;
  }
  100% {
    opacity: 1;
    color: var(--dynamic-colour-pulse-out, red);
    scale: 0.9;
  }
}

</style>