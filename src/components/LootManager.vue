<script setup lang="ts">
import FluidElement from '@/components/FluidElement.vue';
import { useGameEngine } from '@/stores/game';
import { computed, ref } from 'vue';
import type { ILoot, ItemTierType } from '@/lib/game';

const gameEngine = useGameEngine();
const selectedLoot = ref<ILoot | undefined>();
const character = computed(() => gameEngine.getCharacter);

const selectLoot = (loot: ILoot) => {
  selectedLoot.value = loot;
};

const identifySelectedLoot = () => {
  if (!selectedLoot.value || !character.value || character.value === -1) return;
  
  const lootIndex = character.value.loot.findIndex(loot => loot === selectedLoot.value);
  if (lootIndex !== -1) {
    gameEngine.identifyLoot(lootIndex);
  }
};

const getTierColor = (tier: ItemTierType | undefined, isIdentified: boolean): string => {
  if (!tier) return 'rgb(110 231 183 / 0.3)'; // emerald-300/30
  
  const colorMap: Record<ItemTierType, string> = {
    'basic': 'rgb(110 231 183)', // emerald-400
    'enhanced': 'rgb(96 165 250)', // blue-400
    'exceptional': 'rgb(192 132 252)', // purple-400
    'abstract': 'rgb(251 191 36)', // amber-400
    'infused': 'rgb(34 211 238)' // cyan-400
  };
  
  const color = colorMap[tier];
  return isIdentified ? color : `${color} / 0.3`;
};
</script>

<template>
  <div class="flex gap-4 h-full">
    <!-- Main Loot List -->
    <FluidElement class="flex-1 flex flex-col gap-2">
      <h2 class="text-lg">
        Inventory
      </h2>
      <div class="flex flex-wrap gap-2">
        <template v-if="character !== -1 && character.loot.length > 0">
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
            @click="selectLoot(loot)"
          >
            <div class="flex flex-col">
              <p>{{ loot.name }}</p>
              <p class="text-sm opacity-50">
                {{ loot.identified ? 'Identified' : 'Unidentified' }}
              </p>
            </div>
          </FluidElement>
        </template>
        <p
          v-else
          class="text-neutral-500"
        >
          No loot in inventory
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-2 mt-4">
        <FluidElement class="w-fit !p-2">
          <button
            disabled
            class="opacity-50"
          >
            Stash Selected - Coming Soon
          </button>
        </FluidElement>
        <FluidElement class="w-fit !p-2">
          <button
            disabled
            class="opacity-50"
          >
            View Stash - Coming Soon
          </button>
        </FluidElement>
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
            <template v-if="selectedLoot.itemDetails.affixes.embedded.length > 0">
              <p class="text-sm">
                Embedded Affixes:
              </p>
              <ul class="list-disc list-inside">
                <li
                  v-for="affix in selectedLoot.itemDetails.affixes.embedded"
                  :key="affix"
                >
                  {{ affix }}
                </li>
              </ul>
            </template>
            <template v-if="selectedLoot.itemDetails.affixes.prefix.length > 0">
              <p class="text-sm">
                Prefixes:
              </p>
              <ul class="list-disc list-inside">
                <li
                  v-for="affix in selectedLoot.itemDetails.affixes.prefix"
                  :key="affix"
                >
                  {{ affix }}
                </li>
              </ul>
            </template>
            <template v-if="selectedLoot.itemDetails.affixes.suffix.length > 0">
              <p class="text-sm">
                Suffixes:
              </p>
              <ul class="list-disc list-inside">
                <li
                  v-for="affix in selectedLoot.itemDetails.affixes.suffix"
                  :key="affix"
                >
                  {{ affix }}
                </li>
              </ul>
            </template>
          </div>
        </template>
        <template v-else>
          <p class="text-sm opacity-50">
            Item not identified
          </p>
        </template>

        <!-- Identify Button -->
        <FluidElement class="w-fit !p-2 mt-auto">
          <button
            :disabled="!selectedLoot || selectedLoot.identified"
            :class="{ 'opacity-50': !selectedLoot || selectedLoot.identified }"
            @click="identifySelectedLoot"
          >
            Identify Item
          </button>
        </FluidElement>
      </div>
    </FluidElement>
  </div>
</template>

<style scoped>
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