<script setup lang="ts">
import { useGameEngine } from '@/stores/game';
import { CLASS_ALIGNED_STATS, formatConsolidatedAffix, Rarity, type ICooldown, type ILoot, type IPassive, type ISkill, type ITemporalEffect } from '@/lib/game';
import { AffixSubCategory, AffixTypes, attributeIncrease, Attributes, BaseStats, SkillActivationLayer, SkillResource, SkillTarget, SkillTiming, TIER_SEPARATOR, type IAffix } from '@/lib/core';
import { computed, ref, watch } from 'vue';
import { BaseItemAffix, isAffixRange, type AffixValue, type IBaseAffix, type IItemAffix } from '@/lib/affixTypes';
import { allAffixesById } from '@/data/affixes';
import { _cloneDeep } from '@/lib/object';
import { calculateCriticalChance } from '@/lib/combatMechanics';
import FluidElement from './elements/FluidElement.vue';
import { getAffixByType } from '@/lib/affixUtils';
import { formatBaseAffixValue } from '@/lib/itemUtils';
import { IconBuffs, IconPassiveTree, IconRefreshCC, IconSkills, IconStatIncrease, IconWorldSkills } from './icons';
import ModalDialog from './elements/ModalDialog.vue';
import SwitchToggle from './elements/SwitchToggle.vue';
import { ErrorNumber } from '@/lib/typescript';
import { isAbleToAffordSkill, isOffCooldown } from '@/stores/adventuring';
import { useConfigurationStore } from '@/stores/configuration';
import { entries } from '@/journal';
import CloseButton from './elements/CloseButton.vue';
import RomanNumeral from './elements/RomanNumeral.vue';
import TooltipElement from './elements/TooltipElement.vue';


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

const characterClass = computed(() => char !== ErrorNumber.NOT_FOUND ? char.class : null);

const showPassivesModal = ref<boolean>(false);
const showNewPassivesModal = ref<boolean>(false);
const showSkillsModal = ref<boolean>(false);
const showNewSkillsModal = ref<boolean>(false);
const showWorldSkillsModal = ref<boolean>(false);
const showAddStatsModal = ref<boolean>(false);

const configuration = useConfigurationStore();

const hasEquippedItems = computed(() => {
  if (char === ErrorNumber.NOT_FOUND) return false;
  return Object.values(char.equipment).some(item => item !== undefined);
});

const SKILLS_MODAL_ID = 'skills_modal_id';
const PASSIVES_MODAL_ID = 'passive_modal_id';
const NEW_SKILLS_MODAL_ID = 'new_skills_modal_id';
const NEW_PASSIVES_MODAL_ID = 'new_passive_modal_id';
const WORLD_SKILL_MODAL_ID = 'world_skill_modal_id';
const ADD_STATS_MODAL_ID = 'add_stats_modal_id';

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
const healthWidth = computed(() =>  char !== ErrorNumber.NOT_FOUND ? `${ Math.round((char.stats.currentHealth / char.stats.health) * 100) }%` : '0%');
const manaWidth = computed(() =>  char !== ErrorNumber.NOT_FOUND ? `${ Math.round((char.stats.currentMana / char.stats.mana) * 100) }%` : '0%');

const healthColorClass = computed(() => {
  if (char === ErrorNumber.NOT_FOUND) return '';
  const healthPercent = (char.stats.currentHealth / char.stats.health) * 100;
  return {
    '--health-percent': Math.min(Math.max(Math.round(healthPercent), 0), 100)
  };
});

const getStatColor = (stat: string): string => {
  switch (stat) {
    case 'fortitude': return 'text-yellow-400';
    case 'fortune': return 'text-purple-400';
    case 'wrath': return 'text-red-400';
    case 'affinity': return 'text-cyan-400';
    default: return 'text-gray-400';
  }
};

function combineAffixes( existingValue:AffixValue ,newValue: AffixValue) {
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

const consolidateAffixes = (affixes: Array<IItemAffix>) => {
  const consolidated = new Map<string, {
    value: AffixValue;
    originalAffix: IAffix;
  }>();
  
  affixes.forEach(affix => {
    const key = affix.id.split('_').slice(0,2).join('_'); // Get the category part of the ID
    // console.log(`consolidateAffixes: id: '${affix.id}' Key: ${key}`)
    const originalAffix = allAffixesById.get(affix.id);
    if (!originalAffix) return;

    const multiplier =  1 + (((affix.saturation || 1) -1) / 4 );

    // console.log('Multi: ', multiplier, ' \taffix: ',affix);

    if (consolidated.has(key)) {
      consolidated.get(key)!.value = combineAffixes(_cloneDeep(consolidated.get(key)!.value), affixMultiplier(multiplier, affix.value));
    } else {
      consolidated.set(key, {
        value: affixMultiplier(multiplier, affix.value),
        originalAffix,
      });
    }
  });


  return Array.from(consolidated.entries()).map(([_key, { value, originalAffix }]) => ({
    ...originalAffix,
    id: `${originalAffix.type}_${originalAffix.subCategory ? originalAffix.subCategory : originalAffix.category}_-1`, // Create new ID with tier -1
    value,
  }));
};

function affixMultiplier(multiplier: number, value :AffixValue):AffixValue{
  if (multiplier === 1){
    return value;
  }
  const retval:AffixValue = {...value};

  switch (retval.type) {
    case AffixTypes.RANGE:
      retval.minValue *= multiplier;
      retval.minValue *= multiplier;      
      break;
  
    default:
      retval.value *= multiplier;
      break;
  }

  return retval;
}

const groupedAffixes = computed(() => {
  if (char === ErrorNumber.NOT_FOUND) return { embedded: [], prefix: [], suffix: [], base: [] };
  
  const affixes = {
    embedded: [] as Array<IItemAffix>,
    prefix: [] as Array<IItemAffix>,
    suffix: [] as Array<IItemAffix>,
    base: [] as Array<{ id: string; affixType: BaseItemAffix; value: AffixValue }>
  };

  // Collect all affixes from equipped items
  Object.values(char.equipment).forEach((item: ILoot) => {
    // console.log(item?.itemDetails?.baseDetails);
    if (item?.itemDetails) {
      // abase affix if it exists
      if (item.itemDetails.baseDetails) {
        affixes.base.push({
          id: `base_${item.itemDetails.baseDetails.affix}_-1`,
          affixType: item.itemDetails.baseDetails.affix,
          value: _cloneDeep(item.itemDetails.baseDetails.value) as AffixValue
        });
      }
      
      // Add regular affixes if they exist
      if (item.itemDetails.affixes) {
        affixes.embedded.push(...withCounters(item.itemDetails.affixes.embedded));
        affixes.prefix.push(...withCounters(item.itemDetails.affixes.prefix));
        affixes.suffix.push(...withCounters(item.itemDetails.affixes.suffix));
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

function withCounters(affixes: IItemAffix[]): IItemAffix[]{
  const counters = new Map<string, number>();

  affixes.forEach(afx => {
    const id = afx.id.slice(0, afx.id.lastIndexOf('_'));
    if (counters.has(id)){
      let newCounter = counters.get(id) || 1;
      counters.set(id, ++newCounter);
    }else{
      counters.set(id, 1);
    }
  });

  
  affixes.forEach(afx => afx.saturation = counters.get(afx.id.slice(0, afx.id.lastIndexOf('_'))));

  // console.log(counters.entries());
  // console.log(affixes);

  return affixes;
}

function handleIncreaseStat(stat: Attributes): void{
  if (char === ErrorNumber.NOT_FOUND) return;

  if (char.pendingRewards.stats > 0){
    gameEngine.increaseStat(stat, attributeIncrease[stat]);
    char.pendingRewards.stats--;
  }

  showAddStatsModal.value = !showAddStatsModal.value
}

function handleWorldSkillsClick(): void{
  if (char === ErrorNumber.NOT_FOUND) return;

  showWorldSkillsModal.value = !showWorldSkillsModal.value
}

function handleStatsClick(): void{
  if (char === ErrorNumber.NOT_FOUND) return;

  showAddStatsModal.value = !showAddStatsModal.value
}

function handleSkillsClick(): void{
  if (char === ErrorNumber.NOT_FOUND) return;

  if (char.pendingRewards.skills > 0){
    showNewSkillsModal.value = !showNewSkillsModal.value
  }else{
    showSkillsModal.value = !showSkillsModal.value
  }
}

function handlePassivesClick(): void{
  if (char === ErrorNumber.NOT_FOUND) return;

  if (char.pendingRewards.passives > 0){
    showNewPassivesModal.value = !showNewPassivesModal.value
  }else{
    showPassivesModal.value = !showPassivesModal.value
  }
}

function handleAddPassive(identifier: string): void{
  try{
    gameEngine.addPassive(identifier);
  } finally{
    showNewPassivesModal.value = false;
  }
}

function handleAddSkill(identifier: string): void{
  try{
    gameEngine.addSkill(identifier);
  } finally{
    showNewSkillsModal.value = false;
  }
}

function handleActivateWorldSkill(skill: ISkill): void{
  if (char === ErrorNumber.NOT_FOUND || !isAbleToAffordSkill(char, skill.cost)) return;
  // pay costs
  switch (skill.cost.resource) {
    case SkillResource.HEALTH:
      gameEngine.takeDamage(skill.cost.amount);
      break;

    case SkillResource.MANA:
      char.stats.currentMana -= skill.cost.amount
      break;

    case SkillResource.GOLD:
      char.gold -= skill.cost.amount
      break;
  
    default:
      break;
  }
  if (skill.duration){
    const newBuff: ITemporalEffect = {
      effect: skill.effect,
      name: skill.name,
      timing: skill.duration.timing,
      remaining: skill.duration.count,
    }
    gameEngine.addTemporalEffect(newBuff);
  } else {
    // what world skill doesn't have a duration??
    // alchemy?
    // crafting?
  }
  
  const cooldownTime = skill.cooldown.startCooldownInstantly ? skill.cooldown.count : (skill.cooldown.count + (skill.duration?.count || 0));
  // set on cooldown:
  const newCooldown: ICooldown = {
    _identifier: skill._identifier,
    name: skill.name,
    timing: skill.cooldown.timing,
    remaining: cooldownTime,
  }
  gameEngine.addCooldown(newCooldown);
}


const hasWorldSkill = computed(() => char !== ErrorNumber.NOT_FOUND && char.skills.filter(el => el.isEnabled && el.activationLayer === SkillActivationLayer.WORLD).length > 0);

function resolveTemporalEffectDescription(temporal: ITemporalEffect){
  let description = `${temporal.name}`;
  let direction = `${ temporal.effect.type === AffixTypes.MULTIPLICATIVE ? '%' : '' }`;
  let ignoreChange = false;
  if (temporal.effect.subTarget){
    switch (temporal.effect.subTarget) {
      case AffixSubCategory.DEFLECTION:
        description = `Minimum Deflection`;
        direction = '';
        break;
      case AffixSubCategory.DODGE:
        description = `Base Dodge`;
        direction = '% ';
        break;
      case AffixSubCategory.PHYSICAL:
        direction = '';
        ignoreChange = true;
        break;
      case AffixSubCategory.ELEMENTAL:
        direction = '';
        ignoreChange = true;
        break;
    
      default:
        description = `${temporal.effect.subTarget}`
        break;
    }
  }else {
    description = `${temporal.effect.target}`
  }

  let change = '';
  if (!ignoreChange){
    if (temporal.effect.type === AffixTypes.RANGE && typeof temporal.effect.change !== 'number' ){
      change = `${temporal.effect.change.min * (temporal.effect.change.min > 0 ? 1 : -1)}  -  ${temporal.effect.change.max * (temporal.effect.change.max > 0 ? 1 : -1)}`
    } else if(typeof temporal.effect.change === 'number'){
      change = `${temporal.effect.change > 0 ? '+' : ''}${temporal.effect.change }${direction} `;
    }
  }

  return change + description;
}

function resolveDescriptionFromEffect(b: IPassive | ISkill){
  let description = `${b.effect.target}`;
  let direction = `${ b.effect.type === AffixTypes.MULTIPLICATIVE ? '%' : '' }`;
  let ignoreChange = false;
  if (b.effect.subTarget){
    switch (b.effect.subTarget) {
      case AffixSubCategory.DEFLECTION:
        description = `Minimum Deflection`;
        direction = '';
        break;
      case AffixSubCategory.DODGE:
        description = `Base Dodge`;
        direction = '% ';
        break;
      case AffixSubCategory.PHYSICAL:
        description = b?.description || '';
        direction = '';
        ignoreChange = true;
        break;
      case AffixSubCategory.ELEMENTAL:
        description = b?.description || '';
        direction = '';
        ignoreChange = true;
        break;
    
      default:
        description = `${b.effect.subTarget}`
        break;
    }
  }else {
        description = `${b.effect.target}`
  }

  let change = '';
  if (!ignoreChange){
    if (b.effect.type === AffixTypes.RANGE && typeof b.effect.change !== 'number' ){
      change = `${b.effect.change.min * (b.effect.change.min > 0 ? 1 : -1)}  -  ${b.effect.change.max * (b.effect.change.max > 0 ? 1 : -1)}`
    } else if(typeof b.effect.change === 'number'){
      change = `${b.effect.change > 0 ? '+' : ''}${b.effect.change }${direction} `;
    }
  }

  return change + description;
}

function formatBuffs(buffs: ITemporalEffect[]){
  if (buffs.length <= 0) return '';

  let retval = '';

  buffs.forEach(buff => {

    retval += `${buff.name}: +${buff.effect.change}${buff.effect.type === AffixTypes.MULTIPLICATIVE ? '%' : ''} :  ${buff.remaining} ${buff.timing} `;

  });

  return retval;
}

</script>

<template>
  <FluidElement
    class="!p-0 md:!p-5 !border-0 md:!border-2"
    :class="props.class"
    data-onboarding-key="character-pane"
  >
    <div 
      class="
      flex flex-col 
      gap-1 md:gap-3 md:p-4 py-2 px-3
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
            <div class="text-xl font-bold text-white capitalize inline-flex gap-2">
              {{ char.name }} 
              <span
                v-if="char.temporalEffects.length > 0"
                :title="formatBuffs(char.temporalEffects)"
              >
                <TooltipElement 
                  :tooltip-key="`${Date.now()}`"
                >
                  <template #wrapper>
                    <IconBuffs
                      class="text-class"
                    />
                  </template>
                  <template #tooltip>
                    <section>
                      <h4>Buffs:</h4>
                      <template
                        v-for="eff,idx in char.temporalEffects"
                        :key="`_${idx}`"
                      >
                        <div class="grid grid-cols-[1fr_1fr_4rem] gap-2">
                          <p class="text-sm !font-normal">{{ eff.name }}</p>
                          <!-- <p class="text-sm !font-normal justify-self-end">+{{ eff.effect.change }}{{ eff.effect.type === AffixTypes.MULTIPLICATIVE ? '%' : '' }}</p> -->
                          <p class="text-sm !font-normal justify-self-center">{{ resolveTemporalEffectDescription(eff) }}</p>
                          <p class="text-sm !font-normal justify-self-end">{{ eff.remaining }} {{ eff.timing }}{{ eff.remaining === 1 ? '' : 's' }}</p>
                        </div>
                      </template>
                    </section>
                  </template>
                </TooltipElement>
              </span>
            </div>
            <div class="text-sm text-gray-300">
              Level {{ char.level }} {{ char.class }}
            </div>
          </div>
          <div
            class="gap-2 hidden md:flex"
            data-onboarding-key="level-up-section"
          >
            <button 
              v-if="hasWorldSkill"
              class="size-fit my-auto opacity-70 hover:scale-110 transition-all duration-300 hover:[&>svg]:!animation-pause"
              data-onboarding-key="world-skills"
              data-onboarding-key-2="all-skills"
              @click="handleWorldSkillsClick"
            >
              <IconWorldSkills class="opacity-50 hover:opacity-80" />
            </button>
            <button 
              class="size-fit my-auto opacity-70 hover:scale-110 transition-all duration-300 hover:[&>svg]:!animation-pause"
              data-onboarding-key="manage-skills"
              data-onboarding-key-2="all-skills"
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
              data-onboarding-key="manage-passives"
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
            <button
              v-if="char.pendingRewards.stats > 0"
              class="size-fit my-auto opacity-70 hover:scale-110 transition-all duration-300 hover:[&>svg]:!animation-pause"
              data-onboarding-key="manage-attributes"
              @click="handleStatsClick"
            >
              <IconStatIncrease 
                :class="[
                  {'animate-colour-pulse': char.pendingRewards.stats > 0 && !showPassivesModal},
                  {'opacity-50 hover:opacity-80': !(char.pendingRewards.stats)},
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
          class="px-2 mx-auto flex gap-2 -mt-2 md:mt-0"
          data-onboarding-key="level-up-section"
        >
          <div
            v-if="char.skills.filter(sk => sk.activationLayer === SkillActivationLayer.WORLD).length > 0"
            class="flex"
            data-onboarding-key-2="all-skills"
            data-onboarding-key="world-skills"
          >
            <span class="text-gray-400 hidden md:block">World Skills:</span>
            <button 
              v-if="hasWorldSkill"
              class="size-fit my-auto opacity-70 hover:scale-110 transition-all duration-300 hover:[&>svg]:!animation-pause md:hidden"
              @click="handleWorldSkillsClick"
            >
              <IconWorldSkills class="opacity-50 hover:opacity-80" />
            </button>
            <span 
              class="ml-2 place-self-center md:place-self-start" 
            >
              <span>{{ char.skills.filter(sk => sk.isEnabled && sk.activationLayer === SkillActivationLayer.WORLD).length }}</span>/<span>{{ Math.min(char.skills.filter(sk => sk.activationLayer === SkillActivationLayer.WORLD).length,3) }}</span>
            </span>
          </div>
          <div
            v-if="char.skills.filter(sk => sk.activationLayer !== SkillActivationLayer.WORLD).length > 0 || char.pendingRewards.skills > 0"
            class="flex"
            data-onboarding-key-2="all-skills"
            data-onboarding-key="manage-skills"
          >
            <span class="text-gray-400 hidden md:block">Skills:</span>
            <button  
              class="size-fit my-auto opacity-70 hover:scale-110 transition-all duration-300 hover:[&>svg]:!animation-pause md:hidden"
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
            <span 
              class="ml-2 place-self-center md:place-self-start" 
            >
              <span>{{ char.skills.filter(sk => sk.isEnabled && sk.activationLayer !== SkillActivationLayer.WORLD).length }}</span>/<span>{{ Math.min(char.skills.filter(sk => sk.activationLayer !== SkillActivationLayer.WORLD).length, 3) }}</span>
            </span>
          </div>
          <div
            class="flex"
            data-onboarding-key="manage-passives"
          >
            <span class="text-gray-400 hidden md:block">Passives:</span>
            <button
              class="size-fit my-auto opacity-70 hover:scale-110 transition-all duration-300 hover:[&>svg]:!animation-pause md:hidden"
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
            <span 
              class="ml-2 place-self-center md:place-self-start" 
            >
              <span>{{ Math.min(char.passives.length) }}</span>
            </span>
          </div>
          <div
            class="flex md:hidden"
            data-onboarding-key="manage-attributes"
          >
            <button
              v-if="char.pendingRewards.stats > 0"
              class="size-fit my-auto opacity-70 hover:scale-110 transition-all duration-300 hover:[&>svg]:!animation-pause"
              @click="handleStatsClick"
            >
              <IconStatIncrease 
                :class="[
                  {'animate-colour-pulse': char.pendingRewards.stats > 0 && !showPassivesModal},
                  {'opacity-50 hover:opacity-80': !(char.pendingRewards.stats)},
                ]"
                :style="`
                  --dynamic-colour-pulse-out: oklch(0.88 0.18 194.49);
                  --dynamic-colour-pulse-in: oklch(0.723 0.219 149.579);
                `"
              />
            </button>
          </div>
        </div>

        <template v-if="configuration.ui.healthManaBars">
          <div
            class="
              hidden md:flex justify-center
              gap-4 my-1
              text-sm
            "
            data-onboarding-key="health-mana-panel"
          >
            <div 
              :title="`Regen: ${gameEngine.getCombatStats.healthRegen}`"
              class="
                ml-3 px-2 
                place-self-end 
                w-full 
                text-right 
                text-mlg
                border rounded-l-xl rounded-r-md
                relative

                bg-emerald-400/10

                after:bg-emerald-700
                after:absolute
                after:right-0 after:rounded-r-md
                after_w-dynamic-health after:h-full after:rounded-l-xl after:transition-all after:duration-500 after:ease-out
              " 
            >
              <span class="relative z-10 text-white">{{ gameEngine.getCombatStats.health }}/<span>{{ gameEngine.getCombatStats.maxHealth }}</span>
              </span>
            </div>
            <div 
              :title="`Regen: ${gameEngine.getCombatStats.manaRegen}`"
              class="
                text-blue-400 
                mr-3 px-2 
                place-self-start 
                text-mlg
                w-full 
                border rounded-r-xl rounded-l-md
                relative

                bg-blue-500/15

                after:bg-cyan-700/80
                after:absolute
                after:left-0
                after:rounded-r-xl after:rounded-l-md 
                after_w-dynamic-mana after:h-full after:transition-all after:duration-500 after:ease-out
              " 
            >
              <span class="relative z-10 text-white">
                <span>{{ gameEngine.getCombatStats.mana }}</span>/<span>{{ gameEngine.getCombatStats.maxMana }}</span>
              </span>
            </div>
          </div>
        </template>
        <template v-else>
          <div
            class="
              hidden md:grid
              grid-cols-1 md:grid-cols-2 
              gap-2 items-center
              text-sm

              [&>div]:grid [&>div]:grid-cols-[2fr_3fr]
              [&>div]:text-center md:[&>div]:text-left
            "
            data-onboarding-key="health-mana-panel"
          >
            <div class="ml-2 px-2">
              <span class="text-gray-400">Health:</span>
              <span 
                :title="`Regen: ${gameEngine.getCombatStats.healthRegen}`"
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
                :title="`Regen: ${gameEngine.getCombatStats.manaRegen}`"
                class="text-blue-400 ml-2 px-2 py-1 place-self-center md:place-self-start"
                :class="{ 'pulse-dynamic': isManaPulsing }"
                :style="{ '--pulse-color': manaPulseType === 'loss' ? 'var(--pulse-color-mana-loss)' : 'var(--pulse-color-mana)' }"
              ><span>{{ gameEngine.getCombatStats.mana }}</span>/<span>{{ gameEngine.getCombatStats.maxMana }}</span>
              </span>
            </div>
          </div>
        </template>

        <div
          class="
            flex md:hidden justify-center
            gap-2 mt-1
            text-sm
          "
          data-onboarding-key="health-mana-panel"
        >
          <div 
            :title="`Regen: ${gameEngine.getCombatStats.healthRegen}`"
            class="
              ml-3 px-2 
              place-self-end 
              w-full 
              text-right 
              text-mlg
              border rounded-l-xl rounded-r-md
              relative

              bg-emerald-400/10

              after:bg-emerald-700
              after:absolute
              after:right-0 after:rounded-r-md
              after_w-dynamic-health after:h-full after:rounded-l-xl after:transition-all after:duration-500 after:ease-out
            " 
          >
            <span class="relative z-10 text-white">{{ gameEngine.getCombatStats.health }}/<span>{{ gameEngine.getCombatStats.maxHealth }}</span>
            </span>
          </div>
          <div 
            :title="`Regen: ${gameEngine.getCombatStats.manaRegen}`"
            class="
              text-blue-400 
              mr-3 px-2 
              place-self-start 
              text-mlg
              w-full 
              border rounded-r-xl rounded-l-md
              relative

              bg-blue-500/15

              after:bg-cyan-700/80
              after:absolute
              after:left-0
              after:rounded-r-xl after:rounded-l-md 
              after_w-dynamic-mana after:h-full after:transition-all after:duration-500 after:ease-out
            " 
          >
            <span class="relative z-10 text-white">
              <span>{{ gameEngine.getCombatStats.mana }}</span>/<span>{{ gameEngine.getCombatStats.maxMana }}</span>
            </span>
          </div>
        </div>

        <!-- Stats Section -->
        <div
          class="relative"
          data-onboarding-key="stats-panel"
        >
          <button 
            class="md:hidden flex items-center gap-2 text-gray-400 hover:text-gray-300 mb-2"
            data-onboarding-key="stats-panel-button"
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
              md:-mb-3

              [&>div]:grid [&>div]:grid-cols-[2fr_3fr]
              [&>div]:text-center md:[&>div]:text-left
            "
              data-onboarding-key="stats-panel-visual"
            >
              <div class="ml-2 px-2">
                <span class="text-gray-400">Damage:</span>
                <span 
                  class="text-slate-400 ml-2 px-2"
                ><span>~{{ Math.floor(gameEngine.getCombatStats.damagePerTick) }} (
                  <span
                    title="Base"
                    class="text-slate-200"
                  >{{ gameEngine.getCombatStats.baseDamagePerTick }}</span>
                  <span
                    v-if="gameEngine.getCombatStats.damage.physical > 0"
                    title="Physical"
                  >+<span class="text-slate-400">{{ Math.floor(gameEngine.getCombatStats.damage.physical) }}</span></span>
                  <span
                    v-if="gameEngine.getCombatStats.damage.elemental.cold > 0"
                    title="Cold"
                  >+<span class="text-blue-400">{{ Math.floor(gameEngine.getCombatStats.damage.elemental.cold) }}</span></span>
                  <span
                    v-if="gameEngine.getCombatStats.damage.elemental.fire > 0"
                    title="Fire"
                  >+<span class="text-red-400">{{ Math.floor(gameEngine.getCombatStats.damage.elemental.fire) }}</span></span>
                  <span
                    v-if="gameEngine.getCombatStats.damage.elemental.lightning > 0"
                    title="Lightning"
                  >+<span class="text-amber-400">{{ Math.floor(gameEngine.getCombatStats.damage.elemental.lightning) }}</span></span>
                  <span
                    v-if="gameEngine.getCombatStats.damage.corruption.void > 0"
                    title="Void"
                  >+<span class="text-purple-400">{{ Math.floor(gameEngine.getCombatStats.damage.corruption.void) }}</span></span>
                  <span
                    v-if="gameEngine.getCombatStats.damage.corruption.mental > 0"
                    title="Mental"
                  >+<span class="text-pink-400">{{ Math.floor(gameEngine.getCombatStats.damage.corruption.mental) }}</span></span>
                  )</span>
                </span>
              </div>
              <div
                class="ml-2 px-2"
                :title="characterClass ? entries.find(el => el.title === `Critical Hit - ${characterClass}`)?.description : undefined"
              >
                <span class="text-gray-400">Critical:</span>
                <span 
                  class="text-slate-400 ml-2 px-2 inline-flex gap-x-2 w-full justify-center md:justify-start"
                >
                  <span>~{{ calculateCriticalChance(gameEngine.getCombatStats.criticalStrike) }}%</span>
                </span>
              </div>
              <div class="ml-2 px-2">
                <span class="text-gray-400">Mitigation:</span>
                <span class="text-slate-400 ml-2 px-2 inline-flex gap-x-2 w-full justify-center md:justify-start">
                  <span 
                    v-if="gameEngine.getCombatStats.mitigation.find(el => el.key === 'evasion')?.value"
                    :title="entries.find(el => el.title.toLowerCase() === 'dodge')?.description"
                  >Dodge: ~{{ gameEngine.getCombatStats.mitigation.find(el => el.key === 'evasion')?.value || 0 }}%</span>
                  <span
                    v-if="gameEngine.getCombatStats.deflection"
                    :title="entries.find(el => el.title.toLowerCase() === 'deflection')?.description"
                  >Deflect: {{ gameEngine.getCombatStats.deflection || 0 }}</span>
                </span>
              </div>
              <div class="ml-2 px-2">
                <span class="text-gray-400">Resist:</span>
                <span class="text-slate-400 ml-2 px-2 inline-flex gap-x-1 w-full justify-center md:justify-start">
                  <span
                    title="Physical Resist"
                    class="text-slate-400"
                  >{{ Math.floor(Math.min(BaseStats.BASE_MAX_RESISTANCE, gameEngine.getCombatStats.mitigation.find(el => el.key === 'physical')?.value || 0)) }}%</span>
                  <span
                    title="Cold Resist"
                    class="text-blue-300"
                  >{{ Math.floor(Math.min(BaseStats.BASE_MAX_RESISTANCE, gameEngine.getCombatStats.mitigation.find(el => el.key === 'elemental_cold')?.value || 0)) }}%</span>
                  <span
                    title="Fire Resist"
                    class="text-red-300"
                  >{{ Math.floor(Math.min(BaseStats.BASE_MAX_RESISTANCE, gameEngine.getCombatStats.mitigation.find(el => el.key === 'elemental_fire')?.value || 0)) }}%</span>
                  <span
                    title="Lightning Resist"
                    class="text-amber-300"
                  >{{ Math.floor(Math.min(BaseStats.BASE_MAX_RESISTANCE, gameEngine.getCombatStats.mitigation.find(el => el.key === 'elemental_lightning')?.value || 0)) }}%</span>
                </span>
              </div>

              <template
                v-for="stat in orderedStats"
                :key="stat"
              >
                <div
                  class="ml-2 px-2"
                  :title="entries.find(el => el.title.toLowerCase() === stat)?.description"
                >
                  <span class="text-gray-400">{{ stat.charAt(0).toUpperCase() + stat.slice(1) }}:</span>
                  <span :class="[getStatColor(stat), 'ml-2']">{{ gameEngine.getCombatStats.attributes[stat] }}</span>
                </div>
              </template>
            </div>
          </Transition>
        </div>

        <div 
          class="
          w-full h-5
          bg-emerald-700/30
          self-end
          mx-auto md:mt-2 
          relative
          border border-slate-600/50 rounded-full
          
          after:bg-emerald-700
          after:absolute
          after:bg-gradient-to-tr after:via-40%
          after:from-emerald-900 after:via-emerald-800/50 after:to-teal-500/50
          after_w-dynamic after:h-full after:rounded-full after:transition-all after:duration-500 after:ease-out

          before:absolute before:size-full before:my-auto
          before_current-percent before:text-slate-300 before:z-10 
          before:text-center before:text-mlg

          before:translate-y-[calc(-1.25ch_+_50%)] before:md:translate-y-0 
        "
          :style="`--num:${Math.min(100, Math.round((char.experience / (char.level * 100)) * 100))};`"
          data-onboarding-key="experience-panel"
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
                        {{ formatConsolidatedAffix(affix).split(TIER_SEPARATOR)[0] }}
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
                        {{ formatConsolidatedAffix(affix).split(TIER_SEPARATOR)[0] }}
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
                        {{ formatConsolidatedAffix(affix).split(TIER_SEPARATOR)[0] }}
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
    :id="PASSIVES_MODAL_ID"
    :show="showPassivesModal"
    class="!p-[3%] md:!px-10 md:!pb-10 md:!pt-4 min-h-1/3 md:min-h-[unset] min-w-2/3 md:min-w-[unset] overflow-clip relative"
    @close="showPassivesModal = false"
  >
    <section
      class="text-emerald-400 mx-auto pb-2 md:pt-6"
      :class="[
        {'pt-16': char !== ErrorNumber.NOT_FOUND && char.passives.length > 2},
        {'pt-10': char !== ErrorNumber.NOT_FOUND && char.passives.length <= 2}
      ]"
    >
      <h3 class="text-xl font-bold mb-4 w-fit fixed top-2 left-1/2 -translate-x-1/2">
        Passives
      </h3>
      <CloseButton @click="showPassivesModal = false" />
      <div
        v-if="char !== ErrorNumber.NOT_FOUND"
        class="flex flex-wrap gap-6 items-center justify-center scrollbar "
        :class="[
          {'overflow-y-scroll overflow-x-clip overscroll-y-contain md:overflow-visible max-h-[80dvh]': char.passives.length >= 2},
        ]"
      >
        <FluidElement
          v-if="char.passives.length < 1"
          class="p-3"
        >
          <div class="flex flex-col gap-2">
            <div class="flex justify-between items-center">
              <h4 class="text-lg font-medium capitalize">
                No Known Passives
              </h4>
            </div>
          </div>
        </FluidElement>
        <template
          v-for="passive,index in char.passives"
          :key="`passives_${index}`"
        >
          <FluidElement
            class="duration-300 transition-all border-rarity max-w-[calc(100%_-_2px)] md:max-w-52 last:-mb-10"
            :data-rarity="passive.rarity"
            :class="[
              { 'animate-shimmer-border' : [Rarity.UNCOMMON, Rarity.RARE].includes(passive.rarity) },
            ]"
          >
            <article 
              class="grid-area-stack size-full"
              :style="`--pulse-delay: ${(Math.random() * 3) * 500 * (Math.random() * 3) % 500}ms;`"
            >
              <RomanNumeral
                :count="passive.rarity === Rarity.RARE ? 3 : passive.rarity === Rarity.UNCOMMON ? 2 : 1"
                class="ml-auto -mr-3 -mt-5 text-gray-500"
                :class="[
                  { '!text-amber-300' : passive.rarity === Rarity.RARE },
                  { '!text-white/70' : passive.rarity === Rarity.UNCOMMON },
                ]"
              />
              <div
                v-if="passive.rarity === Rarity.RARE"
                class="relative -translate-x-16 -translate-y-6"
                :style="
                  `--firefly-animation-delay: ${(Math.random() * 3) * 1500 * (Math.random() * 3) % 1500}ms;` +
                    `--firefly-animation-delta: ${(Math.random() * 3) * 200 * (Math.random() * 3) % 200}ms;` +
                    `--firefly-colour: red;`
                "
              >
                <span 
                  v-for="i in 15"
                  :key="`firefly_${index}-${i}`"
                  class="firefly"
                ></span>
              </div>
              <div class="flex flex-col gap-2 z-1">
                <div class="flex justify-between items-center">
                  <h4 class="text-lg font-medium capitalize">
                    {{ passive.name }}
                  </h4>
                </div>
                <div class="text-sm text-gray-300 capitalize">
                  Effect: {{ resolveDescriptionFromEffect(passive) }}
                </div>
              </div>
            </article>
          </FluidElement>
        </template>
      </div>
    </section>
  </ModalDialog>
  <ModalDialog
    :id="SKILLS_MODAL_ID"
    :show="showSkillsModal"
    class="!p-[3%] md:!px-10 md:!pb-10 md:!pt-4 min-h-1/3 md:min-h-[unset] min-w-2/3 md:min-w-[unset] overflow-clip relative"
    @close="showSkillsModal = false"
  >
    <section
      class="text-emerald-400 mx-auto pb-2 md:pt-6"
      :class="[
        {'pt-16': char !== ErrorNumber.NOT_FOUND && char.skills.length > 2},
        {'pt-10': char !== ErrorNumber.NOT_FOUND && char.skills.length <= 2}
      ]"
    >
      <h3 class="text-xl font-bold mb-4 w-full fixed top-2 left-1/2 -translate-x-1/2 text-center">
        Skills
      </h3>
      <CloseButton @click="showSkillsModal = false" />
      <div
        v-if="char !== ErrorNumber.NOT_FOUND"
        class="flex flex-wrap gap-6 items-center justify-center scrollbar "
        :class="[
          {'overflow-y-scroll overflow-x-clip overscroll-y-contain md:overflow-visible max-h-[80dvh]': char.skills.length >= 2},
        ]"
      >
        <template
          v-for="skill,index in char.skills"
          :key="`skills_${index}`"
        >
          <FluidElement
            class="duration-300 transition-all border-rarity"
            :data-rarity="skill.rarity"
            :class="[
              { 'animate-shimmer-border' : [Rarity.UNCOMMON, Rarity.RARE].includes(skill.rarity) },
              {'!pointer-events-none': !isOffCooldown(char, skill._identifier)},
              {'opacity-50': !(skill.isEnabled) || !isOffCooldown(char, skill._identifier)},
            ]"
          >
            <article 
              class="grid-area-stack size-full"
              :style="`--pulse-delay: ${(Math.random() * 3) * 500 * (Math.random() * 3) % 500}ms;`"
            >
              <RomanNumeral
                :count="skill.rarity === Rarity.RARE ? 3 : skill.rarity === Rarity.UNCOMMON ? 2 : 1"
                class="ml-auto -mr-3 -mt-5 text-gray-500"
                :class="[
                  { '!text-amber-300' : skill.rarity === Rarity.RARE },
                  { '!text-white/70' : skill.rarity === Rarity.UNCOMMON },
                ]"
              />
              <div
                v-if="skill.rarity === Rarity.RARE"
                class="relative -translate-x-12 -translate-y-6"
                :style="
                  `--firefly-animation-delay: ${(Math.random() * 3) * 1500 * (Math.random() * 3) % 1500}ms;` +
                    `--firefly-animation-delta: ${(Math.random() * 3) * 200 * (Math.random() * 3) % 200}ms;` +
                    `--firefly-colour: red;`
                "
              >
                <span 
                  v-for="i in 15"
                  :key="`firefly_${index}-${i}`"
                  class="firefly"
                ></span>
              </div>
              <div class="flex flex-col gap-2 z-1">
                <h4
                  v-if="!isOffCooldown(char, skill._identifier)"
                  class="text-base font-medium capitalize mx-auto text-indigo-400"
                >
                  Cooldown Remaining {{ char.cooldowns.find(el => el._identifier === skill._identifier)?.remaining }} {{ skill.cooldown.timing }}'s
                </h4>
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
                    Effect: {{ resolveDescriptionFromEffect(skill) }}
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
            </article>
          </FluidElement>
        </template>
      </div>
    </section>
  </ModalDialog>
  <ModalDialog
    :id="WORLD_SKILL_MODAL_ID"
    :show="showWorldSkillsModal"
    class="!p-[3%] md:!px-10 md:!pb-10 md:!pt-4 min-h-1/3 md:min-h-[unset] min-w-2/3 md:min-w-[unset] overflow-clip relative"
    @close="showWorldSkillsModal = false"
  >
    <section
      class="text-emerald-400 mx-auto pb-2 md:pt-6"
      :class="[
        {'pt-16': char !== ErrorNumber.NOT_FOUND && char.skills.filter(el => el.isEnabled && el.activationLayer === SkillActivationLayer.WORLD).length > 2},
        {'pt-10': char !== ErrorNumber.NOT_FOUND && char.skills.filter(el => el.isEnabled && el.activationLayer === SkillActivationLayer.WORLD).length <= 2}
      ]"
    >
      <h3 class="text-xl font-bold mb-4 w-full fixed top-2 left-1/2 -translate-x-1/2 text-center">
        Activate World Skill
      </h3>
      <CloseButton @click="showWorldSkillsModal = false" />
      <div
        v-if="char !== ErrorNumber.NOT_FOUND"
        class="flex flex-wrap gap-6 items-center justify-center scrollbar "
        :class="[
          {'overflow-y-scroll overflow-x-clip overscroll-y-contain md:overflow-visible max-h-[80dvh]': char.skills.filter(el => el.isEnabled && el.activationLayer === SkillActivationLayer.WORLD).length >= 2},
        ]"
      >
        <template
          v-for="skill,index in char.skills.filter(el => el.isEnabled && el.activationLayer === SkillActivationLayer.WORLD)"
          :key="`skills_${index}`"
        >
          <FluidElement
            class="p-3"
            :class="[
              { 'opacity-50': !isOffCooldown(char, skill._identifier) || !isAbleToAffordSkill(char, skill.cost)},
              { '!pointer-events-none' : !isAbleToAffordSkill(char, skill.cost)}
            ]"
          >
            <div class="flex flex-col gap-2">
              <h4
                v-if="!isOffCooldown(char, skill._identifier)"
                class="text-base font-medium capitalize mx-auto text-indigo-400"
              >
                Cooldown Remaining {{ char.cooldowns.find(el => el._identifier === skill._identifier)?.remaining }} {{ skill.cooldown.timing }}'s
              </h4>
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
                  Effect: 
                  <template v-if="typeof skill.effect.change === 'number'">
                    {{ skill.effect.change > 0 ? '+' : '' }}{{ skill.effect.change }}
                  </template>
                  <template v-else>
                    {{ skill.effect.change.min > 0 ? '+' : '-' }} ({{ skill.effect.change.min * (skill.effect.change.min > 0 ? 1 : -1) }} - {{ skill.effect.change.max * (skill.effect.change.max > 0 ? 1 : -1) }})
                  </template>{{ skill.effect.type === AffixTypes.MULTIPLICATIVE ? '%' : '' }} {{ skill.effect.target }}
                </div>
                <div class="flex flex-wrap gap-2 mt-2">
                  <button
                    class="w-fit mx-auto"
                    :class="[
                      {'pointer-events-none': !isOffCooldown(char, skill._identifier)},
                    ]"
                    @click="handleActivateWorldSkill(skill)"
                  >
                    <FluidElement class="w-fit px-2 py-1 hover:bg-emerald-950 duration-300 transition-colors">
                      {{ isOffCooldown(char, skill._identifier) ? 'Activate' : 'On Cooldown' }}
                    </FluidElement>
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
    :id="NEW_PASSIVES_MODAL_ID"
    :show="showNewPassivesModal"
    disable-lite-dismiss
    class="!p-[3%] md:!px-10 md:!pb-10 md:!pt-4 min-h-1/3 md:min-h-[unset] min-w-2/3 md:min-w-[unset] overflow-clip relative"
    @close="showNewPassivesModal = false"
  >
    <section class="text-emerald-400 mx-auto">
      <h3 class="text-xl font-bold mb-4 w-fit mx-auto">
        Select a new Passive
      </h3>
      <CloseButton @click="showNewPassivesModal = false" />
      <div
        v-if="char !== ErrorNumber.NOT_FOUND"
        class="flex flex-wrap gap-6 items-center justify-center scrollbar overflow-y-scroll overflow-x-clip overscroll-y-contain md:overflow-visible max-h-[80dvh]"
      >
        <template
          v-for="passive,index in (gameEngine.getAvailablePassives)"
          :key="`passives_${index}`"
        >
          <button 
            class="hover:scale-125 duration-300 transition-all hover:z-10 mt-5 max-w-[calc(100%_-_3rem)]"
            @click="handleAddPassive(passive._identifier)"
          >
            <FluidElement
              class="duration-300 transition-all border-rarity"
              :data-rarity="passive.rarity"
              :class="[
                { 'animate-shimmer-border' : [Rarity.UNCOMMON, Rarity.RARE].includes(passive.rarity) },
              ]"
            >
              <article 
                class="grid-area-stack size-full"
                :style="`--pulse-delay: ${(Math.random() * 3) * 500 * (Math.random() * 3) % 500}ms;`"
              >
                <RomanNumeral
                  :count="passive.rarity === Rarity.RARE ? 3 : passive.rarity === Rarity.UNCOMMON ? 2 : 1"
                  class="ml-auto -mr-3 -mt-5 text-gray-500"
                  :class="[
                    { '!text-amber-300' : passive.rarity === Rarity.RARE },
                    { '!text-white/70' : passive.rarity === Rarity.UNCOMMON },
                  ]"
                />
                <div
                  v-if="passive.rarity === Rarity.RARE"
                  class="relative -translate-x-16 -translate-y-6"
                  :style="
                    `--firefly-animation-delay: ${(Math.random() * 3) * 1500 * (Math.random() * 3) % 1500}ms;` +
                      `--firefly-animation-delta: ${(Math.random() * 3) * 200 * (Math.random() * 3) % 200}ms;` +
                      `--firefly-colour: red;`
                  "
                >
                  <span 
                    v-for="i in 15"
                    :key="`firefly_${index}-${i}`"
                    class="firefly"
                  ></span>
                </div>
                <div class="flex flex-col gap-2 z-1">
                  <div class="flex justify-between items-center">
                    <h4 class="text-lg font-medium capitalize">
                      {{ passive.name }}
                    </h4>
                  </div>
                  <div class="text-sm text-gray-300 capitalize">
                    Effect: {{ resolveDescriptionFromEffect(passive) }}
                  </div>
                </div>
              </article>
            </FluidElement>
          </button>
        </template>
      </div>
      <div
        v-if="char !== ErrorNumber.NOT_FOUND && gameEngine.hasRefreshes"
        class="mx-auto w-fit mt-2"
      >
        <button
          class="hover:rotate-360 duration-3000 transition-all"
          @click="gameEngine.refreshPassives"
        >
          <IconRefreshCC />
        </button>
      </div>
    </section>
  </ModalDialog>
  <ModalDialog
    :id="NEW_SKILLS_MODAL_ID"
    :show="showNewSkillsModal"
    class="!p-[3%] md:!px-10 md:!pb-10 md:!pt-4 min-h-1/3 md:min-h-[unset] min-w-2/3 md:min-w-[unset] overflow-clip relative"
    @close="showNewSkillsModal = false"
  >
    <section
      class="text-emerald-400 mx-auto pt-16 pb-2 md:pt-6"
    >
      <h3 class="text-xl font-bold mb-4 fixed top-2 left-1/2 -translate-x-1/2 w-full text-center">
        Select a new Skills
      </h3>
      <CloseButton @click="showNewSkillsModal = false" />
      <div
        v-if="char !== ErrorNumber.NOT_FOUND"
        class="flex flex-wrap gap-6 items-center justify-center scrollbar overflow-y-scroll overflow-x-clip overscroll-y-contain md:overflow-visible max-h-[80dvh]"
      >
        <template
          v-for="skill,index in gameEngine.getAvailableSkills"
          :key="`skills_${index}`"
        >
          <button 
            class="hover:scale-125 duration-300 transition-all hover:z-10 mt-5 max-w-[calc(100%_-_3rem)]"
            @click="handleAddSkill(skill._identifier)"
          >
            <FluidElement
              class="duration-300 transition-all border-rarity"
              :data-rarity="skill.rarity"
              :class="[
                { 'animate-shimmer-border' : [Rarity.UNCOMMON, Rarity.RARE].includes(skill.rarity) },
              ]"
            >
              <article 
                class="grid-area-stack size-full"
                :style="`--pulse-delay: ${(Math.random() * 3) * 500 * (Math.random() * 3) % 500}ms;`"
              >
                <RomanNumeral
                  :count="skill.rarity === Rarity.RARE ? 3 : skill.rarity === Rarity.UNCOMMON ? 2 : 1"
                  class="ml-auto -mr-3 -mt-5 text-gray-500"
                  :class="[
                    { '!text-amber-300' : skill.rarity === Rarity.RARE },
                    { '!text-white/70' : skill.rarity === Rarity.UNCOMMON },
                  ]"
                />
                <div
                  v-if="skill.rarity === Rarity.RARE"
                  class="relative -translate-x-12 -translate-y-6"
                  :style="
                    `--firefly-animation-delay: ${(Math.random() * 3) * 1500 * (Math.random() * 3) % 1500}ms;` +
                      `--firefly-animation-delta: ${(Math.random() * 3) * 200 * (Math.random() * 3) % 200}ms;` +
                      `--firefly-colour: red;`
                  "
                >
                  <span 
                    v-for="i in 15"
                    :key="`firefly_${index}-${i}`"
                    class="firefly"
                  ></span>
                </div>
                <div class="flex flex-col gap-2 z-1">
                  <h4
                    v-if="!isOffCooldown(char, skill._identifier)"
                    class="text-base font-medium capitalize mx-auto text-indigo-400"
                  >
                    Cooldown Remaining {{ char.cooldowns.find(el => el._identifier === skill._identifier)?.remaining }} {{ skill.cooldown.timing }}'s
                  </h4>
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
                      Effect: {{ resolveDescriptionFromEffect(skill) }}
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
              </article>
            </FluidElement>
          </button>
        </template>
      </div>
      <div
        v-if="char !== ErrorNumber.NOT_FOUND && gameEngine.hasRefreshes"
        class="mx-auto w-fit mt-2"
      >
        <button
          class="hover:rotate-360 duration-3000 transition-all"
          @click="gameEngine.refreshSkills"
        >
          <IconRefreshCC />
        </button>
      </div>
    </section>
  </ModalDialog>
  <ModalDialog
    :id="ADD_STATS_MODAL_ID"
    :show="showAddStatsModal"
    class="!p-[3%] md:!px-10 md:!pb-10 md:!pt-4 min-h-1/3 md:min-h-[unset] min-w-2/3 md:min-w-[unset]"
    @close="showAddStatsModal = false"
  >
    <section class="text-emerald-400 mx-auto">
      <h3 class="text-xl font-bold mb-4 w-fit mx-auto">
        Increase a single attribute
      </h3>
      <CloseButton @click="showAddStatsModal = false" />
      <div
        v-if="char !== ErrorNumber.NOT_FOUND"
        class="flex gap-2 flex-wrap justify-center"
      >
        <template
          v-for="stat,index in Attributes"
          :key="`stats_${index}`"
        >
          <button 
            class="hover:scale-125 duration-300 transition-all hover:z-10 mt-5"
            @click="handleIncreaseStat(stat)"
          >
            <FluidElement
              class="p-3 hover:border-amber-400  duration-300 transition-all"
            >
              <div class="flex flex-col gap-2">
                <div class="flex justify-between items-center">
                  <span class="inline-flex items-baseline-last">
                    <h4 class="text-lg font-medium capitalize">
                      {{ stat }} +{{ attributeIncrease[stat] }}
                    </h4>
                  </span>
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
    --pulse-color-mana: rgba(0, 179, 255, 0.1);
    --pulse-color-mana-loss: rgba(124, 211, 255, 0.1);
    --level-up-color: rgb(255, 213, 0);
    --core-ui-border-color: oklch(20.8% 0.042 265.755);
    
    --shimmer-color: oklch(78.9% 0.154 211.53);

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
  .after_w-dynamic-health::after {
    width: v-bind(healthWidth);
    max-width: 100%;
  }
  .after_w-dynamic-mana::after {
    width: v-bind(manaWidth);
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

  .border-rarity {
    --rarity-colour: oklch(50.8% 0.118 165.612);
    border-color: var(--rarity-colour) !important;
    --shimmer-color: var(--rarity-colour);

    &[data-rarity="RARE"] {
      --rarity-colour: oklch(70.5% 0.213 47.604);
    }

    &[data-rarity="UNCOMMON"] {
      --rarity-colour: oklch(71.5% 0.143 215.221);
    }
  }

  @keyframes shimmer-border {
    0% {
      background-position: -50% 0;
    }
    100% {
      background-position: 150% 0;
    }
  }

  .animate-shimmer-border {
    position: relative;
    border: 2px solid transparent;
  }

  .animate-shimmer-border::before {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: inherit;
    padding: 4px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      transparent 25%,
      color-mix(in srgb, var(--shimmer-color) 20%, transparent) 30%,
      var(--shimmer-color) 40%,
      var(--shimmer-color) 60%,
      color-mix(in srgb, var(--shimmer-color) 20%, transparent) 70%,
      transparent 75%,
      transparent 100%
    );
    background-size: 200% 100%;
    -webkit-mask: 
      linear-gradient(#fff 0 0) content-box, 
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    animation: shimmer-border 2s linear infinite forwards;
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