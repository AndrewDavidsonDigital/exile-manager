<script setup lang="ts">
import FluidElement from '@/components/FluidElement.vue';
import { useGameEngine } from '@/stores/game';
import { computed, ref } from 'vue';
import type { ILoot, ItemType } from '@/lib/game';
import { ITEM_TIER_COSTS } from '@/lib/game';
import { formatAffixDescription } from '@/lib/game';
import { getTierColor, allItemTypes, itemTypeEmojiMap, slotMap, formatBaseAffixValue } from '@/lib/itemUtils';
import type { AffixValue } from '@/lib/affixTypes';

const gameEngine = useGameEngine();
const selectedLoot = ref<ILoot | undefined>();
const lootFilter = ref<ItemType | undefined>(undefined);
const character = computed(() => gameEngine.getCharacter);
const activeTab = ref<ManageLootTabType>('inventory');
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
  if (!selectedLoot.value || !character.value || character.value === -1) return;
  
  if (activeTab.value === 'inventory') {
    const lootIndex = character.value.loot.findIndex(loot => loot === selectedLoot.value);
    if (lootIndex !== -1) {
      gameEngine.identifyLoot(lootIndex);
    }
  } else if (gameEngine.stash) {
    const stashIndex = gameEngine.stash.findIndex(loot => loot === selectedLoot.value);
    if (stashIndex !== -1) {
      gameEngine.identifyStashItem(stashIndex);
    }
  }
};

const stashSelectedLoot = () => {
  if (!selectedLoot.value || !character.value || character.value === -1) return;
  
  const lootIndex = character.value.loot.findIndex(loot => loot === selectedLoot.value);
  if (lootIndex !== -1) {
    gameEngine.stashItem(lootIndex);
    selectedLoot.value = undefined;
  }
};

const unstashSelectedLoot = () => {
  if (!gameEngine.stash || !selectedLoot.value) return;
  
  const stashIndex = gameEngine.stash.findIndex(loot => loot === selectedLoot.value);
  if (stashIndex !== -1) {
    gameEngine.unstashItem(stashIndex);
    selectedLoot.value = undefined;
  }
};

const equipSelectedLoot = (isMobile:boolean = false) => {
  if (!selectedLoot.value) return;
  gameEngine.equipItem(selectedLoot.value, activeTab.value === 'stash');
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

const getIdentificationCost = (loot: ILoot): number => {
  if (!loot.itemDetails) return 0;
  
  const tier = loot.itemDetails.tier;
  return ITEM_TIER_COSTS[tier];
};

const canAffordIdentification = (loot: ILoot): boolean => {
  if (!character.value || character.value === -1) return false;
  return character.value.gold >= getIdentificationCost(loot);
};

function itemMatchesFilter(type: ItemType, isIdentified :boolean) {
  if (lootFilter.value === undefined) {
    return false;
  }

  if (!isIdentified){
    return true;
  }

  if (lootFilter.value !== type) {
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
    if(char === -1 || char.loot.length === 0 || !toDeleteId){
      console.warn(`attempt made to delete an item, from INVENT but not valid condition`);
      return;
    }
  }
  
  let deletableIndex = undefined;
  if(activeTab.value === 'stash'){
    deletableIndex = gameEngine.stash?.findIndex(loot => loot._identifier === toDeleteId);
  }else if(char !== -1){
    deletableIndex = char.loot.findIndex(loot => loot._identifier === toDeleteId);
  }
  if (deletableIndex === undefined || deletableIndex === -1){
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
  }else if(char !== -1){
    char.loot.splice(deletableIndex, 1)
  }
}

const selectedItemIndex = computed(()=>{  
  const char = gameEngine.getCharacter;
  let toResolveId = selectedLoot.value?._identifier;
  if(char === -1 || !toResolveId){
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
  if(char === -1){
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
  if((selectedItemIndex.value !== 0 && !(selectedItemIndex.value)) || char === -1){
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

</script>

<template>
  <div class="flex flex-col md:flex-row gap-4 h-full">
    <!-- Main Loot List -->
    <FluidElement class="flex-1 flex flex-col gap-2">
      <!-- Tab Navigation -->
      <div class="flex flex-col md:flex-row justify-between gap-x-2 gap-y-4 mb-4">
        <div class="flex gap-2">
          <button
            :class="[
              { 'opacity-50': activeTab !== 'inventory' },
              { 'pointer-events-none': activeTab === 'inventory' }
            ]"
            @click="activeTab = 'inventory'; selectedLoot = undefined;"
          >
            <FluidElement class="w-fit !p-2">
              Inventory {{ character !== -1 ? character.loot.length : 0 }}
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
      <div class="flex flex-wrap gap-1 mb-4">
        <button
          :class="[
            { 'opacity-50': lootFilter !== undefined },
            { 'pointer-events-none': lootFilter === undefined }
          ]"
          @click="lootFilter = undefined"
        >
          <FluidElement class="w-fit !p-1">
            Clear Filter
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

      <!-- Loot List -->
      <div class="flex flex-wrap gap-2">
        <template v-if="activeTab === 'inventory' && character !== -1 && character.loot.length > 0">
          <FluidElement
            v-for="(loot, index) in character.loot"
            :key="`loot_${index}`"
            class="w-fit !p-2 !border cursor-pointer loot-item"
            :class="[
              { 'opacity-20 pointer-events-none' : itemMatchesFilter(loot.type, loot.identified) },
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
              { 'opacity-20 pointer-events-none' : itemMatchesFilter(loot.type, loot.identified) },
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
              <p 
                v-if="!loot.identified"
                class="text-sm opacity-50"
              >
                Unidentified
              </p>
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
            >
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
              class="text-sm text-gray-400"
            >
              {{ formatAffixDescription(affix) }}
            </div>
            <div
              v-for="affix, aIndex in selectedLoot.itemDetails.affixes.prefix"
              :key="`pr_${affix.id}_${aIndex}`"
              class="text-sm text-blue-400"
            >
              {{ formatAffixDescription(affix) }}
            </div>
            <div
              v-for="affix, aIndex in selectedLoot.itemDetails.affixes.suffix"
              :key="`su_${affix.id}_${aIndex}`"
              class="text-sm text-green-400"
            >
              {{ formatAffixDescription(affix) }}
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
          <button
            v-if="selectedLoot && selectedLoot.identified"
            class="w-fit mt-auto  hidden md:block"
            @click="() => equipSelectedLoot()"
          >
            <FluidElement class="!p-2 mt-auto">
              Equip Item <span v-if="character !== -1">{{ character.equipment[slotMap[selectedLoot.type]] ? "(replace)" : '' }}</span>
            </FluidElement>
          </button>
          <button
            v-if="selectedLoot && selectedLoot.identified"
            class="w-fit mt-auto block md:hidden"
            @click="() => equipSelectedLoot(true)"
          >
            <FluidElement class="!p-2 mt-auto">
              Equip Item <span v-if="character !== -1">{{ character.equipment[slotMap[selectedLoot.type]] ? "(replace)" : '' }}</span>
            </FluidElement>
          </button>
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