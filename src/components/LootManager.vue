<script setup lang="ts">
import FluidElement from '@/components/elements/FluidElement.vue';
import { useGameEngine } from '@/stores/game';
import { computed, ref, watch } from 'vue';
import type { ILoot } from '@/lib/game';
import { ITEM_TIER_COSTS } from '@/lib/game';
import { formatAffixDescription } from '@/lib/game';
import { getTierColor, allItemTypes, itemTypeEmojiMap, slotMap, formatBaseAffixValue } from '@/lib/itemUtils';
import type { AffixValue } from '@/lib/affixTypes';
import ModalDialog from './elements/ModalDialog.vue';
import { IconRefreshCC } from './icons';
import { ErrorNumber } from '@/lib/typescript';
import { allItemTiers, ItemTiers, TIER_SEPARATOR, type ItemBase, type ItemTierType } from '@/lib/core';
import RomanNumeral from './elements/RomanNumeral.vue';
import { useAdventuringStore } from '@/stores/adventuring';
import SwitchToggle from './elements/SwitchToggle.vue';

const gameEngine = useGameEngine();
const adventuringEngine = useAdventuringStore();
const selectedLoot = ref<ILoot | undefined>();
const lootFilter = ref<ItemBase | undefined>(undefined);
const tierFilter = ref<ItemTierType | undefined>(undefined);
const character = computed(() => gameEngine.getCharacter);
const activeTab = ref<ManageLootTabType>('inventory');
const showCompareModal = ref(false);
const isLeftRing = ref<boolean>(false);
type ManageLootTabType = 'inventory' | 'stash';

type BrushMode = 'none' | 'identify' | 'delete';
const activeBrush = ref<BrushMode>('none');

const selectLoot = (loot: ILoot) => {
  if (activeBrush.value === 'none') {
    selectedLoot.value = loot;
    return;
  }

  if (activeBrush.value === 'identify' && !loot.identified) {
    selectedLoot.value = loot;
    identifySelectedLoot();
  } else if (activeBrush.value === 'delete') {
    selectedLoot.value = loot;
    deleteSelectedLoot();
  }
};

const identifySelectedLoot = () => {
  if (!selectedLoot.value || !character.value || character.value === ErrorNumber.NOT_FOUND) return;
  
  if (activeTab.value === 'inventory') {
    const lootIndex = character.value.loot.findIndex(loot => loot === selectedLoot.value);
    if (lootIndex !== ErrorNumber.NOT_FOUND) {
      gameEngine.identifyLoot(lootIndex);
    }
  } else if (gameEngine.stash) {
    const stashIndex = gameEngine.stash.findIndex(loot => loot === selectedLoot.value);
    if (stashIndex !== ErrorNumber.NOT_FOUND) {
      gameEngine.identifyStashItem(stashIndex);
    }
  }
};

const stashSelectedLoot = () => {
  if (!selectedLoot.value || !character.value || character.value === ErrorNumber.NOT_FOUND) return;
  
  const lootIndex = character.value.loot.findIndex(loot => loot === selectedLoot.value);
  if (lootIndex !== ErrorNumber.NOT_FOUND) {
    gameEngine.stashItem(lootIndex);
    selectedLoot.value = undefined;
  }
};

const unstashSelectedLoot = () => {
  if (!gameEngine.stash || !selectedLoot.value) return;
  
  const stashIndex = gameEngine.stash.findIndex(loot => loot === selectedLoot.value);
  if (stashIndex !== ErrorNumber.NOT_FOUND) {
    gameEngine.unstashItem(stashIndex);
    selectedLoot.value = undefined;
  }
};

const equipSelectedLoot = (isMobile:boolean = false) => {
  if (!selectedLoot.value) return;
  gameEngine.equipItem(selectedLoot.value, activeTab.value === 'stash', !isLeftRing.value);
  if (!isMobile){
    selectedLoot.value = undefined;
  }else{
    if (hasNext.value === true){
      selectLootNeighbour(true);
    }else if(hasPrev.value === true){
      selectLootNeighbour(false);
    }else{
      selectedLoot.value = undefined;
    }
  }  
};

const isAdventuring = computed(() => adventuringEngine.isAdventuring);

watch(isAdventuring, (newValue) => {
  if (newValue){
    resetBrush();
  }
});

const handleEquipmentSwap = () => {
  if (!selectedLoot.value || !character.value || character.value === ErrorNumber.NOT_FOUND) return;
  
  const currentlyEquippedItem = equippedItem.value;
  if (!currentlyEquippedItem) return;

  // Store the identifier of the currently equipped item
  const unequippedItemId = currentlyEquippedItem._identifier;
  
  
  // Equip the selected item
  equipSelectedLoot();
  
  // Switch to inventory tab if we're in stash
  if (activeTab.value === 'stash') {
    activeTab.value = 'inventory';
  }

  // Find the unequipped item in the character's loot array
  const unequippedItem = character.value.loot.find(item => item._identifier === unequippedItemId);
  if (unequippedItem) {
    selectedLoot.value = unequippedItem;
  }
};

const getIdentificationCost = (loot: ILoot): number => {
  if (!loot.itemDetails) return 0;
  
  const tier = loot.itemDetails.tier;
  return ITEM_TIER_COSTS[tier];
};

const canAffordIdentification = (loot: ILoot): boolean => {
  if (!character.value || character.value === ErrorNumber.NOT_FOUND) return false;
  return character.value.gold >= getIdentificationCost(loot);
};

function itemMatchesFilter(type: ItemBase, isIdentified: boolean, tier?: ItemTierType) {
  if (lootFilter.value === undefined && tierFilter.value === undefined) {
    return false;
  }

  if (!isIdentified && tierFilter.value === undefined) {
    return true;
  }

  if (lootFilter.value !== undefined && lootFilter.value !== type) {
    return true;
  }

  if (tierFilter.value !== undefined && tierFilter.value !== tier) {
    return true;
  }

  return false;
}

function deleteSelectedLoot(){
  const char = gameEngine.getCharacter;
  let toDeleteId = selectedLoot.value?._identifier;

  if (activeTab.value === 'stash'){    
    if(!(gameEngine.stash) || gameEngine.stash.length === 0 || !toDeleteId){
      console.warn(`attempt made to delete an item, from STASH but not valid condition`);
      return;
    }

  } else {
    if(char === ErrorNumber.NOT_FOUND || char.loot.length === 0 || !toDeleteId){
      console.warn(`attempt made to delete an item, from INVENT but not valid condition`);
      return;
    }
  }
  
  let deletableIndex = undefined;
  if(activeTab.value === 'stash'){
    deletableIndex = gameEngine.stash?.findIndex(loot => loot._identifier === toDeleteId);
  }else if(char !== ErrorNumber.NOT_FOUND){
    deletableIndex = char.loot.findIndex(loot => loot._identifier === toDeleteId);
  }
  if (deletableIndex === undefined || deletableIndex === ErrorNumber.NOT_FOUND){
    console.warn(`attempt made to delete an item not indexed: `, toDeleteId, '  from: ', activeTab.value);
    return;
  }
  // console.log(`to delete item [${deletableIndex}] as item: ${JSON.stringify(char.loot[deletableIndex])}`)
  const itemTier = selectedLoot.value?.itemDetails?.tier || 'basic';
  const lootValue = ITEM_TIER_COSTS[itemTier] / 10;

  gameEngine.updateGold(lootValue);

  selectedLoot.value = undefined;

  if(activeTab.value === 'stash'){
    gameEngine.stash?.splice(deletableIndex, 1)
  }else if(char !== ErrorNumber.NOT_FOUND){
    char.loot.splice(deletableIndex, 1)
  }
}

const selectedItemIndex = computed(()=>{  
  const char = gameEngine.getCharacter;
  let toResolveId = selectedLoot.value?._identifier;
  if(char === ErrorNumber.NOT_FOUND || !toResolveId){
    return null;
  }
  return char.loot.findIndex(loot => loot._identifier === toResolveId);
})

const hasPrev = computed(()=>{
  if((selectedItemIndex.value !== 0 && !(selectedItemIndex.value))){
    return false;
  }
  return selectedItemIndex.value > 0
});

const hasNext = computed(()=>{
  const char = gameEngine.getCharacter;
  if(char === ErrorNumber.NOT_FOUND){
    return false;
  }
  if((selectedItemIndex.value !== 0 && !(selectedItemIndex.value))){
    return false;
  }
  return selectedItemIndex.value < (char.loot.length -1 )
});


function selectLootNeighbour(forwards: boolean = false){
  console.log('selecting neighbour: next?:', forwards);
  const char = gameEngine.getCharacter;
  if((selectedItemIndex.value !== 0 && !(selectedItemIndex.value)) || char === ErrorNumber.NOT_FOUND){
    return;
  }

  if(forwards){
    selectLoot(char.loot[selectedItemIndex.value + 1]);
  } else {
    selectLoot(char.loot[selectedItemIndex.value - 1]);
  }
}

const resetBrush = () => {
  activeBrush.value = 'none';
};

const equippedItem = computed(() => {
  if (!selectedLoot.value || !character.value || character.value === ErrorNumber.NOT_FOUND) return undefined;
  if (selectedLoot.value.type === 'Ring' && !(isLeftRing.value)){
    return character.value.equipment['rightHand'];
  }
  return character.value.equipment[slotMap[selectedLoot.value.type]];
});

const canCompare = computed(() => {
  return selectedLoot.value?.identified && equippedItem.value?.identified;
});

</script>

<template>
  <div class="flex flex-col md:flex-row gap-4 h-full">
    <!-- Main Loot List -->
    <FluidElement class="flex-1 flex flex-col gap-2">
      <!-- Tab Navigation -->
      <div class="flex flex-col md:flex-row justify-between gap-x-2 gap-y-4 mb-2">
        <div class="flex gap-2">
          <button
            :class="[
              { 'opacity-50': activeTab !== 'inventory' },
              { 'pointer-events-none': activeTab === 'inventory' }
            ]"
            @click="activeTab = 'inventory'; selectedLoot = undefined;"
          >
            <FluidElement class="w-fit !p-2">
              Inventory {{ character !== ErrorNumber.NOT_FOUND ? character.loot.length : 0 }}
            </FluidElement>
          </button>
          <button
            :class="[
              { 'opacity-50': activeTab !== 'stash' },
              { 'pointer-events-none': activeTab === 'stash' }
            ]"
            @click="activeTab = 'stash'; selectedLoot = undefined;"
          >
            <FluidElement class="w-fit !p-2">
              Stash {{ gameEngine.stash?.length || 0 }}
            </FluidElement>
          </button>
        </div>
        <div class="flex flex-col gap-1">
          <span
            class="ml-2 md:mx-auto opacity-80"
            :class="[
              { 'grayscale opacity-50' : !(gameEngine.autoSalvage) },
            ]"
          >Auto Salvage</span>
          <div class="flex gap-2 w-fit h-fit items-center">
            <SwitchToggle
              v-model="gameEngine.autoSalvage" 
              :class="!gameEngine.autoSalvage ? 'opacity-50' : ''"
            />
            <label>
              <select 
                v-model="gameEngine.autoSalvageTier"
                class="capitalize text-center bg-slate-800 rounded-sm border-emerald-700 border"
                :class="[
                  { 'pointer-events-none grayscale opacity-50' : !(gameEngine.autoSalvage) },
                ]"
              >
                <option
                  v-for="tier,index in ItemTiers"
                  :key="`autosalvage_${index}`"
                  :value="tier"
                  class="capitalize bg-slate-800"
                >
                  {{ tier }}
                </option>
              </select>
            </label>
          </div>
        </div>
        <!-- Brush Tools -->
        <div class="flex gap-2">
          <button
            :class="[
              { 'opacity-50': activeBrush !== 'identify' },
              { 'pointer-events-none': activeBrush === 'identify' }
            ]"
            @click="activeBrush = activeBrush === 'identify' ? 'none' : 'identify'"
          >
            <FluidElement
              class="w-fit !p-2"
              title="Identify Brush"
            >
              🔍
            </FluidElement>
          </button>
          <button
            :class="[
              { 'opacity-50': activeBrush !== 'delete' },
              { 'pointer-events-none': activeBrush === 'delete' }
            ]"
            @click="activeBrush = activeBrush === 'delete' ? 'none' : 'delete'"
          >
            <FluidElement
              class="w-fit !p-2"
              title="Delete Brush"
            >
              ❌
            </FluidElement>
          </button>
          <button
            v-if="activeBrush !== 'none'"
            @click="resetBrush"
          >
            <FluidElement
              class="w-fit !p-2"
              title="Reset Brush"
            >
              Reset
            </FluidElement>
          </button>
        </div>
      </div>

      <!-- Filter Buttons -->
      <div class="flex flex-wrap gap-1 mb-2">
        <button
          :class="[
            { 'opacity-50': lootFilter !== undefined },
            { 'pointer-events-none': lootFilter === undefined }
          ]"
          @click="lootFilter = undefined"
        >
          <FluidElement class="w-fit !p-1">
            All Types
          </FluidElement>
        </button>
        <button
          v-for="type in allItemTypes"
          :key="type"
          :class="[
            { 'opacity-50': lootFilter !== type },
            { 'pointer-events-none': lootFilter === type }
          ]"
          @click="lootFilter = type"
        >
          <FluidElement
            class="w-fit !p-1"
            :title="type"
          >
            {{ itemTypeEmojiMap[type] }}
          </FluidElement>
        </button>
      </div>

      <!-- Tier Filter Buttons -->
      <div class="flex flex-wrap gap-1 mb-4">
        <button
          :class="[
            { 'opacity-50': tierFilter !== undefined },
            { 'pointer-events-none': tierFilter === undefined }
          ]"
          @click="tierFilter = undefined"
        >
          <FluidElement class="w-fit !p-1">
            All Tiers
          </FluidElement>
        </button>
        <button
          v-for="tier in allItemTiers"
          :key="tier"
          :class="[
            { 'opacity-30': tierFilter !== tier },
            { 'pointer-events-none': tierFilter === tier }
          ]"
          @click="tierFilter = tier"
        >
          <FluidElement
            class="w-fit !p-1"
            :title="tier"
            :style="{ color: getTierColor(tier, true) }"
          >
            {{ tier.charAt(0).toUpperCase() + tier.slice(1) }}
          </FluidElement>
        </button>
      </div>

      <!-- Loot List -->
      <div class="flex flex-wrap gap-2">
        <template v-if="activeTab === 'inventory' && character !== -1 && character.loot.length > 0">
          <FluidElement
            v-for="(loot, index) in character.loot"
            :key="`loot_${index}`"
            class="w-fit !p-2 !border cursor-pointer loot-item"
            :class="[
              { 'opacity-20 grayscale pointer-events-none' : itemMatchesFilter(loot.type, loot.identified, loot.itemDetails?.tier) },
            ]"
            :style="{
              '--loot-border-color': getTierColor(loot.itemDetails?.tier, loot.identified)
            }"
            :data-cursed="loot._hidden.isCursed"
            :data-corrupted="loot._hidden.isCorrupted"
            :data-void-touched="loot._hidden.isVoidTouched"
            :data-selected="selectedLoot === loot"
            :data-identified="loot.identified"
            :data-brush="activeBrush"
            @click="selectLoot(loot)"
          >
            <div class="flex flex-col">
              <div :class="{ 'item-content': true, 'blurred': !loot.identified }">
                <p>{{ loot.name }}</p>
              </div>
            </div>
          </FluidElement>
        </template>
        <template v-else-if="activeTab === 'stash' && gameEngine.stash && gameEngine.stash.length > 0">
          <FluidElement
            v-for="(loot, index) in gameEngine.stash"
            :key="`stash_${index}`"
            class="w-fit !p-2 !border cursor-pointer loot-item"
            :class="[
              { 'opacity-20 pointer-events-none' : itemMatchesFilter(loot.type, loot.identified, loot.itemDetails?.tier) },
            ]"
            :style="{
              '--loot-border-color': getTierColor(loot.itemDetails?.tier, loot.identified)
            }"
            :data-cursed="loot._hidden.isCursed"
            :data-corrupted="loot._hidden.isCorrupted"
            :data-void-touched="loot._hidden.isVoidTouched"
            :data-selected="selectedLoot === loot"
            :data-identified="loot.identified"
            :data-brush="activeBrush"
            @click="selectLoot(loot)"
          >
            <div class="flex flex-col">
              <div :class="{ 'item-content': true, 'blurred': !loot.identified }">
                <p>{{ loot.name }}</p>
              </div>
            </div>
          </FluidElement>
        </template>
        <p
          v-else
          class="text-neutral-500"
        >
          No items in {{ activeTab }}
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-2 mt-4">
        <FluidElement
          v-if="activeTab === 'inventory'"
          class="w-fit !p-2"
        >
          <button
            
            :disabled="!selectedLoot"
            :class="{ 'opacity-50 pointer-events-none': !selectedLoot }"
            @click="stashSelectedLoot"
          >
            Stash Selected
          </button>
        </FluidElement>
        <FluidElement
          v-else
          class="w-fit !p-2 "
        >
          <button
            
            :disabled="!selectedLoot"
            :class="{ 'opacity-50 pointer-events-none': !selectedLoot }"
            @click="unstashSelectedLoot"
          >
            Unstash Selected
          </button>
        </FluidElement>
      </div>
    </FluidElement>

    <!-- Loot Details Side Panel -->
    <FluidElement class="w-full md:w-1/3 flex flex-col gap-2">
      <div class="flex justify-between">
        <h2 class="text-lg w-fit">
          Item Details
        </h2>
        <button
          v-if="selectedLoot"
          class="w-fit mt-auto"
          @click="deleteSelectedLoot"
        >
          <FluidElement
            class="!p-1 mt-auto border-red-400 text-red-500"
            title="Delete selected Item"
          >
            ❌
          </FluidElement>
        </button>
      </div>
      <div
        v-if="selectedLoot"
        class="flex justify-between"
      >
        <button
          :disabled="!hasPrev"
          class="disabled:pointer-events-none"
          @click="resetBrush();selectLootNeighbour()"
        >
          <FluidElement class="!py-1 !px-2">
            {{ '<' }}
          </FluidElement>
        </button>
        <button
          :disabled="!hasNext"
          class="disabled:pointer-events-none"
          @click="resetBrush();selectLootNeighbour(true)"
        >
          <FluidElement class="!py-1 !px-2">
            {{ `>` }}
          </FluidElement>
        </button>
      </div>
      <div class="flex flex-col gap-2 h-full">
        <div>
          <p class="font-bold">
            {{ selectedLoot?.name }}
          </p>
          <p
            class="text-sm"
            :class="[
              { 'text-amber-600': selectedLoot?.itemDetails?.mutations.includes('cursed') },
              { 'text-red-600': selectedLoot?.itemDetails?.mutations.includes('corrupted') },
              { 'text-cyan-600': selectedLoot?.itemDetails?.mutations.includes('crystallized') },
              { 'text-purple-700': selectedLoot?.itemDetails?.mutations.includes('voided') }
            ]"
          >
            {{ selectedLoot?.itemDetails?.mutations.includes('cursed') ? 'Cursed' : '' }}
            {{ selectedLoot?.itemDetails?.mutations.includes('corrupted') ? 'Corrupted' : '' }}
            {{ selectedLoot?.itemDetails?.mutations.includes('crystallized') ? 'Crystallized' : '' }}
            {{ selectedLoot?.itemDetails?.mutations.includes('voided') ? 'VoidTouched' : '' }}
          </p>
        </div>
        
        <template v-if="selectedLoot?.itemDetails">
          <div>
            <div class="flex justify-between">
              <p class="text-sm w-fit">
                Tier: <span
                  class="dynamic-loot-text capitalize"
                  :style="{
                    '--loot-text-color': getTierColor(selectedLoot.itemDetails?.tier, true)
                  }"
                >
                  {{ selectedLoot?.itemDetails.tier }}
                </span>
              </p>
              <p class="w-fit">
                ilvl:{{ selectedLoot.iLvl || -1 }}
              </p>
            </div>
            <div
              v-if="selectedLoot.itemDetails?.baseDetails"
              class="text-sm text-amber-200 capitalize"
            >
              {{ selectedLoot.itemDetails.baseDetails.name }}: {{ formatBaseAffixValue(selectedLoot.itemDetails.baseDetails.value as AffixValue) }}
            </div>
            <div
              v-for="affix, aIndex in selectedLoot.itemDetails.affixes.embedded"
              :key="`em_${affix.id}_${aIndex}`"
              class="text-sm text-gray-400 inline-flex justify-between w-full"
            >
              <template v-if="formatAffixDescription(affix).split(TIER_SEPARATOR).length > 1">
                {{ formatAffixDescription(affix).split(TIER_SEPARATOR)[0] }} <RomanNumeral :count="Number(formatAffixDescription(affix).split(TIER_SEPARATOR)[1])" />
              </template>
              <template v-else>
                {{ formatAffixDescription(affix) }}
              </template>
            </div>
            <div
              v-for="affix, aIndex in selectedLoot.itemDetails.affixes.prefix"
              :key="`pr_${affix.id}_${aIndex}`"
              class="text-sm text-blue-400 inline-flex justify-between w-full"
            >
              <template v-if="formatAffixDescription(affix).split(TIER_SEPARATOR).length > 1">
                {{ formatAffixDescription(affix).split(TIER_SEPARATOR)[0] }} <RomanNumeral :count="Number(formatAffixDescription(affix).split(TIER_SEPARATOR)[1])" />
              </template>
              <template v-else>
                {{ formatAffixDescription(affix) }}
              </template>
            </div>
            <div
              v-for="affix, aIndex in selectedLoot.itemDetails.affixes.suffix"
              :key="`su_${affix.id}_${aIndex}`"
              class="text-sm text-green-400 inline-flex justify-between w-full"
            >
              <template v-if="formatAffixDescription(affix).split(TIER_SEPARATOR).length > 1">
                {{ formatAffixDescription(affix).split(TIER_SEPARATOR)[0] }} <RomanNumeral :count="Number(formatAffixDescription(affix).split(TIER_SEPARATOR)[1])" />
              </template>
              <template v-else>
                {{ formatAffixDescription(affix) }}
              </template>
            </div>
          </div>
        </template>
        <template v-else-if="selectedLoot">
          <p class="text-sm opacity-50">
            Item not identified
          </p>
        </template>
        <template v-else>
          <p class="text-sm opacity-50">
            Select an Item
          </p>
        </template>

        <!-- Identify Button -->
        <button
          v-if="selectedLoot && !selectedLoot.identified"
          :disabled="!selectedLoot || !canAffordIdentification(selectedLoot)"
          class="mt-auto w-fit"
          :class="{ 'opacity-50 pointer-events-none': !selectedLoot || !canAffordIdentification(selectedLoot) }"
          @click="identifySelectedLoot"
        >
          <FluidElement class="w-fit !p-2 mt-auto">
            <div class="flex flex-col gap-2">
              <p class="text-sm opacity-50">
                Identification Cost: {{ selectedLoot ? getIdentificationCost(selectedLoot) : 0 }} gold
              </p>
              <span>
                {{ !canAffordIdentification(selectedLoot) ? 'Not Enough Gold' : 'Identify Item' }}
              </span>
            </div>
          </FluidElement>
        </button>


        <!-- Equip Button -->
        <section class="flex justify-between">
          <div class="flex flex-col gap-2">
            <button
              v-if="canCompare"
              class="w-fit mt-auto"
              @click="showCompareModal = true"
            >
              <FluidElement class="!p-2 mt-auto">
                Compare
              </FluidElement>
            </button>
            <button
              v-if="selectedLoot && selectedLoot.identified"
              class="w-fit mt-auto hidden md:block"
              @click="() => equipSelectedLoot()"
            >
              <FluidElement class="!p-2 mt-auto">
                Equip Item <span v-if="character !== ErrorNumber.NOT_FOUND">{{ character.equipment[slotMap[selectedLoot.type]] ? "(replace)" : '' }}</span>
              </FluidElement>
            </button>
            <button
              v-if="selectedLoot && selectedLoot.identified"
              class="w-fit mt-auto block md:hidden"
              @click="() => equipSelectedLoot(true)"
            >
              <FluidElement class="!p-2 mt-auto">
                Equip Item <span v-if="character !== ErrorNumber.NOT_FOUND">{{ character.equipment[slotMap[selectedLoot.type]] ? "(replace)" : '' }}</span>
              </FluidElement>
            </button>
          </div>
          <button
            v-if="selectedLoot && selectedLoot.identified"
            class="w-fit mt-auto"
            @click="selectedLoot = undefined"
          >
            <FluidElement class="!p-2 mt-auto">
              Deselect Item
            </FluidElement>
          </button>
        </section>
      </div>
    </FluidElement>
    <ModalDialog
      id="compareModal"
      :show="showCompareModal"
      class="text-emerald-200 md:!p-8 border-emerald-800 border "
      @close="showCompareModal = false"
    >
      <div class="flex flex-col gap-4 p-4  bg-slate-900 rounded-4xl">
        <h2 class="text-lg font-bold mx-auto w-fit">
          Item Comparison
        </h2>
        <button
          class="absolute top-2 right-2 w-fit"
          @click="showCompareModal = false"
        >
          <FluidElement class="!rounded-full !py-0 !px-1.5 border-slate-400 text-slate-500 bg-transparent">
            <div class="font-semibold text-slate-300">
              X
            </div>
          </FluidElement>
        </button>
        <div
          v-if="selectedLoot && selectedLoot.identified && equippedItem"
          class="grid grid-cols-[1fr_3fr_3fr] gap-4 items-start [&>*]:capitalize px-[3%] md:px-8 py-[2%] md:py-4 relative"
        >
          <!-- Header -->
          <span></span>
          <span class="text-center text-slate-400">Selected Item</span>
          <span class="text-center text-slate-400">Equipped Item</span>

          <!-- Name -->
          <span class="text-right opacity-50 my-auto md:my-0">Name</span>
          <p class="text-center">
            {{ selectedLoot?.name || '-' }}
          </p>
          <p class="text-center">
            {{ equippedItem?.name || '-' }}
          </p>

          <!-- Mutations -->
          <template v-if="equippedItem?.itemDetails?.mutations?.length || selectedLoot?.itemDetails?.mutations?.length">
            <span class="text-right my-auto md:my-0">Mutations</span>
            <div>
              <template v-if="selectedLoot?.itemDetails?.mutations?.length">
                <p
                  v-for="mutation,index in selectedLoot.itemDetails.mutations"
                  :key="`eq-mutation_${index}-${Date.now()}`"
                  class="text-sm capitalize"
                  :class="[
                    { 'text-amber-600': mutation === 'cursed' },
                    { 'text-red-600': mutation === 'corrupted' },
                    { 'text-cyan-600': mutation === 'crystallized' },
                    { 'text-purple-700': mutation === 'voided' }
                  ]"
                >
                  {{ mutation }}
                </p>
              </template>
              <span v-else>-</span>
            </div>
            <div>
              <template v-if="equippedItem?.itemDetails?.mutations?.length">
                <p
                  v-for="mutation,index in equippedItem.itemDetails.mutations"
                  :key="`si-mutation_${index}-${Date.now()}`"
                  class="text-sm capitalize"
                  :class="[
                    { 'text-amber-600': mutation === 'cursed' },
                    { 'text-red-600': mutation === 'corrupted' },
                    { 'text-cyan-600': mutation === 'crystallized' },
                    { 'text-purple-700': mutation === 'voided' }
                  ]"
                >
                  {{ mutation }}
                </p>
              </template>
              <span v-else>-</span>
            </div>
          </template>

          <!-- iLevel -->
          <span class="text-right opacity-50 my-auto md:my-0">Item Level</span>
          <p class="opacity-50 text-center">
            {{ selectedLoot?.iLvl || '-' }}
          </p>
          <p class="opacity-50 text-center">
            {{ equippedItem?.iLvl || '-' }}
          </p>

          <!-- Tier -->
          <span class="text-right opacity-50 my-auto md:my-0">Tier</span>
          <p
            class="text-sm capitalize text-center"
            :style="{ color: getTierColor(selectedLoot?.itemDetails?.tier, true) }"
          >
            {{ selectedLoot?.itemDetails?.tier || '-' }}
          </p>
          <p
            class="text-sm capitalize text-center"
            :style="{ color: getTierColor(equippedItem?.itemDetails?.tier, true) }"
          >
            {{ equippedItem?.itemDetails?.tier || '-' }}
          </p>

          <!-- BaseAffix -->
          <span class="text-right opacity-50 my-auto md:my-0">Base Affix</span>
          <p class="text-amber-200 text-sm md:px-[2vw]">
            {{ selectedLoot?.itemDetails?.baseDetails?.name }}:{{ formatBaseAffixValue(selectedLoot?.itemDetails?.baseDetails?.value as AffixValue) }}
          </p>
          <p class="text-amber-200 text-sm md:px-[2vw]">
            {{ equippedItem?.itemDetails?.baseDetails?.name }}:{{ formatBaseAffixValue(equippedItem?.itemDetails?.baseDetails?.value as AffixValue) }}
          </p>

          <!-- Embedded Affix -->
          <span class="text-right opacity-50 my-auto md:my-0">Embedded Affix</span>
          <div class="flex flex-col gap-1 md:px-[2vw]">
            <template v-if="(selectedLoot?.itemDetails?.affixes.embedded.length || 0) > 0">
              <template
                v-for="embedded,i in selectedLoot?.itemDetails?.affixes.embedded"
                :key="`emb-${i}-selected-${Date.now()}`"
              >
                <span class="text-sm text-teal-400 inline-flex justify-between">
                  <template v-if="formatAffixDescription(embedded).split(TIER_SEPARATOR).length > 1">
                    {{ formatAffixDescription(embedded).split(TIER_SEPARATOR)[0] }}  <RomanNumeral :count="Number(formatAffixDescription(embedded).split(TIER_SEPARATOR)[1])" />
                  </template>
                  <template v-else>
                    {{ formatAffixDescription(embedded) }}
                  </template>
                </span>
              </template>
            </template>
            <span
              v-else
              class="text-center"
            >
              -
            </span>
          </div>
          <div class="flex flex-col gap-1 md:px-[2vw]">
            <template v-if="(equippedItem?.itemDetails?.affixes.embedded.length || 0) > 0">
              <template
                v-for="embedded,i in equippedItem?.itemDetails?.affixes.embedded"
                :key="`emb-${i}-equipped-${Date.now()}`"
              >
                <span class="text-sm text-teal-400 inline-flex justify-between">
                  <template v-if="formatAffixDescription(embedded).split(TIER_SEPARATOR).length > 1">
                    {{ formatAffixDescription(embedded).split(TIER_SEPARATOR)[0] }}  <RomanNumeral :count="Number(formatAffixDescription(embedded).split(TIER_SEPARATOR)[1])" />
                  </template>
                  <template v-else>
                    {{ formatAffixDescription(embedded) }}
                  </template>
                </span>
              </template>
            </template>
            <span
              v-else
              class="text-center"
            >
              -
            </span>
          </div>

          <!-- Prefix -->
          <span class="text-right opacity-50 my-auto md:my-0">Prefixes</span>
          <div class="flex flex-col gap-1 md:px-[2vw]">
            <template v-if="(selectedLoot?.itemDetails?.affixes.prefix.length || 0) > 0">
              <template
                v-for="prefix,i in selectedLoot?.itemDetails?.affixes.prefix"
                :key="`pre-${i}-selected-${Date.now()}`"
              >
                <span class="text-sm text-teal-400 inline-flex justify-between">
                  <template v-if="formatAffixDescription(prefix).split(TIER_SEPARATOR).length > 1">
                    {{ formatAffixDescription(prefix).split(TIER_SEPARATOR)[0] }}  <RomanNumeral :count="Number(formatAffixDescription(prefix).split(TIER_SEPARATOR)[1])" />
                  </template>
                  <template v-else>
                    {{ formatAffixDescription(prefix) }}
                  </template>
                </span>
              </template>
            </template>
            <span
              v-else
              class="text-center"
            >
              -
            </span>
          </div>
          <div class="flex flex-col gap-1 md:px-[2vw]">
            <template v-if="(equippedItem?.itemDetails?.affixes.prefix.length || 0) > 0">
              <template
                v-for="prefix,i in equippedItem?.itemDetails?.affixes.prefix"
                :key="`pre-${i}-equipped-${Date.now()}`"
              >
                <span class="text-sm text-teal-400 inline-flex justify-between">
                  <template v-if="formatAffixDescription(prefix).split(TIER_SEPARATOR).length > 1">
                    {{ formatAffixDescription(prefix).split(TIER_SEPARATOR)[0] }}  <RomanNumeral :count="Number(formatAffixDescription(prefix).split(TIER_SEPARATOR)[1])" />
                  </template>
                  <template v-else>
                    {{ formatAffixDescription(prefix) }}
                  </template>
                </span>
              </template>
            </template>
            <span
              v-else
              class="text-center"
            >
              -
            </span>
          </div>

          <!-- Suffix -->
          <span class="text-right opacity-50 my-auto md:my-0">Suffix</span>
          <div class="flex flex-col gap-1 md:px-[2vw]">
            <template v-if="(selectedLoot?.itemDetails?.affixes.suffix.length || 0) > 0">
              <template
                v-for="suffix,i in selectedLoot?.itemDetails?.affixes.suffix"
                :key="`su-${i}-selected-${Date.now()}`"
              >
                <span class="text-sm text-green-400 inline-flex justify-between">
                  <template v-if="formatAffixDescription(suffix).split(TIER_SEPARATOR).length > 1">
                    {{ formatAffixDescription(suffix).split(TIER_SEPARATOR)[0] }}  <RomanNumeral :count="Number(formatAffixDescription(suffix).split(TIER_SEPARATOR)[1])" />
                  </template>
                  <template v-else>
                    {{ formatAffixDescription(suffix) }}
                  </template>
                </span>
              </template>
            </template>
            <span
              v-else
              class="text-center"
            >
              -
            </span>
          </div>
          <div class="flex flex-col gap-1 md:px-[2vw]">
            <template v-if="(equippedItem?.itemDetails?.affixes.suffix.length || 0) > 0">
              <template
                v-for="suffix,i in equippedItem?.itemDetails?.affixes.suffix"
                :key="`su-${i}-equipped-${Date.now()}`"
              >
                <span class="text-sm text-green-400 inline-flex justify-between">
                  <template v-if="formatAffixDescription(suffix).split(TIER_SEPARATOR).length > 1">
                    {{ formatAffixDescription(suffix).split(TIER_SEPARATOR)[0] }} <RomanNumeral :count="Number(formatAffixDescription(suffix).split(TIER_SEPARATOR)[1])" />
                  </template>
                  <template v-else>
                    {{ formatAffixDescription(suffix) }}
                  </template>
                </span>
              </template>
            </template>
            <span
              v-else
              class="text-center"
            >
              -
            </span>
          </div>
          <button
            v-if="equippedItem.type === 'Ring' && character !== -1 && character.equipment.leftHand && character.equipment.rightHand"
            class="absolute top-2 right-2 w-fit"
            @click="isLeftRing = !isLeftRing"
          >
            <FluidElement class="!rounded-full !p-2 border-emerald-400/50 text-emerald-500 bg-transparent scale-75">
              <IconRefreshCC
                class="stroke-2 duration-700 transition-all"
                :class="[
                  { 'rotate-180' : isLeftRing }
                ]"
              />
            </FluidElement>
          </button>
        </div>
        <button
          class="w-fit mx-auto"
          @click="handleEquipmentSwap"
        >
          <FluidElement class="py-1 px-2 w-fit">
            Quick Swap
          </FluidElement>
        </button>
      </div>
    </modaldialog>
  </div>
</template>

<style scoped>
  @reference "@/assets/main.css";

* {
  --loot-border-color: oklch(69.6% 0.17 162.48);
  --loot-border-color-selected: rgb(255 255 255); /* white */
}

.loot-item {
  border-color: var(--loot-border-color);
  border-width: 2px !important;
  transition: border-color 0.2s ease-in-out;
}

.item-content {
  transition: filter 0.2s ease-in-out, opacity 0.2s ease-in-out;
}

.item-content.blurred {
  filter: blur(1px);
  opacity: 0.8;
}

.loot-item:hover .item-content.blurred {
  filter: none;
  opacity: 1;
}

.loot-item:hover {
  border-color: var(--loot-border-color-selected) !important;
}

/* Temp-remove colourations as mutations do nothing atm */
/*
.loot-item[data-cursed="true"][data-identified="true"] {
  border-color: var(--loot-border-color-cursed);
}

.loot-item[data-corrupted="true"][data-identified="true"] {
  border-color: var(--loot-border-color-corrupted);
}

.loot-item[data-crystallized="true"][data-identified="true"] {
  border-color: var(--loot-border-color-crystallized);
}

.loot-item[data-void-touched="true"][data-identified="true"] {
  border-color: var(--loot-border-color-void);
}
*/

.loot-item[data-selected="true"] {
  border-color: var(--loot-border-color-selected);
}

.loot-item[data-brush="identify"][data-identified="false"] {
  border-style: dashed;
  border-color: var(--loot-border-color-selected);
}

.loot-item[data-brush="delete"]:hover {
  border-style: dashed;
  border-color: rgb(255 0 0) !important;
}

.dynamic-loot-text {
  color: var(--loot-text-color, white);
}
</style> 