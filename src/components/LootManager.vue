<script setup lang="ts">
import FluidElement from '@/components/FluidElement.vue';
import { useGameEngine } from '@/stores/game';
import { computed, ref } from 'vue';
import type { ILoot } from '@/lib/game';
import { ITEM_TIER_COSTS } from '@/lib/game';
import { formatAffixDescription } from '@/lib/game';
import { getTierColor } from '@/lib/itemUtils';

const gameEngine = useGameEngine();
const selectedLoot = ref<ILoot | undefined>();
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
  } else {
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
  if (!selectedLoot.value) return;
  
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
</script>

<template>
  <div class="flex gap-4 h-full">
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
            Inventory
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
            Stash
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
            :style="{
              '--loot-border-color': getTierColor(loot.itemDetails?.tier, loot.identified)
            }"
            :data-cursed="loot.cursed"
            :data-corrupted="loot.corrupted"
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
        <template v-else-if="activeTab === 'stash' && gameEngine.stash.length > 0">
          <FluidElement
            v-for="(loot, index) in gameEngine.stash"
            :key="`stash_${index}`"
            class="w-fit !p-2 !border cursor-pointer loot-item"
            :style="{
              '--loot-border-color': getTierColor(loot.itemDetails?.tier, loot.identified)
            }"
            :data-cursed="loot.cursed"
            :data-corrupted="loot.corrupted"
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
        <button
          v-if="activeTab === 'inventory'"
          :disabled="!selectedLoot"
          :class="{ 'opacity-50 pointer-events-none': !selectedLoot }"
          @click="stashSelectedLoot"
        >
          <FluidElement class="w-fit !p-2">
            Stash Selected
          </FluidElement>
        </button>
        <button
          v-else
          :disabled="!selectedLoot"
          :class="{ 'opacity-50 pointer-events-none': !selectedLoot }"
          @click="unstashSelectedLoot"
        >
          <FluidElement class="w-fit !p-2">
            Unstash Selected
          </FluidElement>
        </button>
      </div>
    </FluidElement>

    <!-- Loot Details Side Panel -->
    <FluidElement
      v-if="selectedLoot"
      class="w-1/3 flex flex-col gap-2"
    >
      <h2 class="text-lg">
        Item Details
      </h2>
      <div class="flex flex-col gap-2">
        <div>
          <p class="font-bold">
            {{ selectedLoot.name }}
          </p>
          <p
            class="text-sm"
            :class="[
              { 'text-amber-600': selectedLoot.cursed },
              { 'text-red-600': selectedLoot.corrupted }
            ]"
          >
            {{ selectedLoot.cursed ? 'Cursed' : '' }}
            {{ selectedLoot.corrupted ? 'Corrupted' : '' }}
          </p>
        </div>
        
        <template v-if="selectedLoot.itemDetails">
          <div>
            <p class="text-sm opacity-50">
              Tier: {{ selectedLoot.itemDetails.tier }}
            </p>
            <div
              v-for="affix in selectedLoot.itemDetails.affixes.embedded"
              :key="affix.id"
              class="text-sm text-gray-400"
            >
              {{ formatAffixDescription(affix) }}
            </div>
            <div
              v-for="affix in selectedLoot.itemDetails.affixes.prefix"
              :key="affix.id"
              class="text-sm text-blue-400"
            >
              {{ formatAffixDescription(affix) }}
            </div>
            <div
              v-for="affix in selectedLoot.itemDetails.affixes.suffix"
              :key="affix.id"
              class="text-sm text-green-400"
            >
              {{ formatAffixDescription(affix) }}
            </div>
          </div>
        </template>
        <template v-else>
          <p class="text-sm opacity-50">
            Item not identified
          </p>
        </template>

        <!-- Identify Button -->
        <button
          v-if="selectedLoot && !selectedLoot.identified"
          :disabled="!selectedLoot || !canAffordIdentification(selectedLoot)"
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
        <button
          v-if="selectedLoot && selectedLoot.identified"
          @click="equipSelectedLoot"
        >
          <FluidElement class="w-fit !p-2 mt-auto">
            Equip Item
          </FluidElement>
        </button>
      </div>
    </FluidElement>
  </div>
</template>

<style scoped>
  @reference "@/assets/main.css";

* {
  --loot-border-color: oklch(69.6% 0.17 162.48);
  --loot-border-color-selected: rgb(255 255 255); /* white */
  --loot-border-color-cursed: rgb(217 119 6); /* amber-600 */
  --loot-border-color-corrupted: rgb(220 38 38); /* red-600 */
}

.loot-item {
  border-color: var(--loot-border-color) !important;
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

.loot-item[data-cursed="true"] {
  border-color: var(--loot-border-color-cursed) !important;
}

.loot-item[data-corrupted="true"] {
  border-color: var(--loot-border-color-corrupted) !important;
}

.loot-item[data-selected="true"] {
  border-color: var(--loot-border-color-selected) !important;
}
</style> 