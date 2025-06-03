<script setup lang="ts">
import FluidElement from '@/components/FluidElement.vue';
import { useGameEngine } from '@/stores/game';
import { computed, ref } from 'vue';
import type { ILoot, ItemType } from '@/lib/game';
import { ITEM_TIER_COSTS } from '@/lib/game';
import { formatAffixDescription } from '@/lib/game';
import { getTierColor, allItemTypes, itemTypeEmojiMap } from '@/lib/itemUtils';

const gameEngine = useGameEngine();
const selectedLoot = ref<ILoot | undefined>();
const lootFilter = ref<ItemType | undefined>(undefined);
const character = computed(() => gameEngine.getCharacter);
const activeTab = ref<ManageLootTabType>('inventory');
type ManageLootTabType = 'inventory' | 'stash';

const selectLoot = (loot: ILoot) => {
  selectedLoot.value = loot;
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

const equipSelectedLoot = () => {
  if (!selectedLoot.value) return;
  gameEngine.equipItem(selectedLoot.value, activeTab.value === 'stash');
  selectedLoot.value = undefined;
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
  let foo = selectedLoot.value?.name;
  if(char === -1 || !foo){
    return;
  }
  const deletableIndex = char.loot.findIndex(loot => loot._identifier === foo);
  console.log(`to delete item [${deletableIndex}] as item: ${JSON.stringify(char.loot[deletableIndex])}`)
}

</script>

<template>
  <div class="flex flex-col md:flex-row gap-4 h-full">
    <!-- Main Loot List -->
    <FluidElement class="flex-1 flex flex-col gap-2">
      <!-- Tab Navigation -->
      <div class="flex gap-2 mb-4">
        <button
          :class="[
            { 'opacity-50': activeTab !== 'inventory' },
            { 'pointer-events-none': activeTab === 'inventory' }
          ]"
          @click="activeTab = 'inventory'"
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
          @click="activeTab = 'stash'"
        >
          <FluidElement class="w-fit !p-2">
            Stash {{ gameEngine.stash?.length || 0 }}
          </FluidElement>
        </button>
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
            <p class="text-sm">
              Tier: <span
                class="dynamic-loot-text capitalize"
                :style="{
                  '--loot-text-color': getTierColor(selectedLoot.itemDetails?.tier, selectedLoot.identified)
                }"
              >
                {{ selectedLoot?.itemDetails.tier }}
              </span>
            </p>
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
          class="mt-auto"
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
            class="w-fit mt-auto"
            @click="equipSelectedLoot"
          >
            <FluidElement class="!p-2 mt-auto">
              Equip Item
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

.dynamic-loot-text {
  color: var(--loot-text-color, white);
}
</style> 