<script setup lang="ts">
import { useGameEngine } from '@/stores/game';
import { getTierColor } from '@/lib/itemUtils';
import { formatAffixDescription } from '@/lib/game';

const gameEngine = useGameEngine();
const char = gameEngine.getCharacter;

</script>

<template>
  <div class="flex flex-col gap-2">
    <template v-if="char !== -1">
      <!-- Armor -->
      <details class="group">
        <summary class="text-sm text-gray-400 cursor-pointer hover:text-gray-300 flex items-center justify-center gap-2">
          <span class="transform group-open:rotate-90 transition-transform text-gray-400">></span>
          Armor
        </summary>
        <div class="mt-2 grid grid-cols-3 gap-2">
          <div 
            v-for="(item, slot) in { 
              shoulders: char.equipment.shoulders,
              head: char.equipment.head, 
              arms: char.equipment.arms,
              chest: char.equipment.chest, 
              legs: char.equipment.legs, 
              feet: char.equipment.feet 
            }"
            :key="slot"
            class="bg-gray-800/80 rounded-lg border p-2 text-center relative tooltip-parent"
            :class="{ 'opacity-50': !item }"
            :style="[{ borderColor: item ? getTierColor(item.itemDetails?.tier, item.identified) : 'rgb(75, 85, 99)' },`anchor-name: --accessory-${slot};`]"
          >
            <span class="text-sm text-gray-400">{{ item?.name || slot.charAt(0).toUpperCase() + slot.slice(1) }}</span>
            <div
              v-if="item"
              class="tooltip"
              :style="`position-anchor: --accessory-${slot};`"
            >
              <div class="flex flex-col gap-1">
                <p class="font-bold">
                  {{ item.name }}
                </p>
                <template v-if="item.itemDetails">
                  <p
                    class="text-sm capitalize"
                    :style="{
                      'color': getTierColor(item.itemDetails.tier, item.identified)
                    }"
                  >
                    {{ item.itemDetails.tier }}
                  </p>
                  <div
                    v-for="affix in item.itemDetails.affixes.embedded"
                    :key="affix.id"
                    class="text-sm text-gray-400 grid grid-cols-[30px_1fr_30px]"
                  >
                    <span class="text-left opacity-50 text-amber-200">{{ affix.id.split('_')[2] }}</span>
                    <span>{{ formatAffixDescription(affix) }}</span>
                    <span class="text-right opacity-50 text-amber-200">e</span>
                  </div>
                  <div
                    v-for="affix in item.itemDetails.affixes.prefix"
                    :key="affix.id"
                    class="text-sm text-blue-400 grid grid-cols-[30px_1fr_30px]"
                  >
                    <span class="text-left opacity-50 text-amber-200">{{ affix.id.split('_')[2] }}</span>
                    <span>{{ formatAffixDescription(affix) }}</span>
                    <span class="text-right opacity-50 text-amber-200">p</span>
                  </div>
                  <div
                    v-for="affix in item.itemDetails.affixes.suffix"
                    :key="affix.id"
                    class="text-sm text-green-400 grid grid-cols-[30px_1fr_30px]"
                  >
                    <span class="text-left opacity-50 text-amber-200">{{ affix.id.split('_')[2] }}</span>
                    <span>{{ formatAffixDescription(affix) }}</span>
                    <span class="text-right opacity-50 text-amber-200">s</span>
                  </div>
                </template>
                <template v-else>
                  <p class="text-sm opacity-50">
                    Item not identified
                  </p>
                </template>
              </div>
            </div>
          </div>
        </div>
      </details>

      <!-- Weapons -->
      <details class="group">
        <summary class="text-sm text-gray-400 cursor-pointer hover:text-gray-300 flex items-center justify-center gap-2">
          <span class="transform group-open:rotate-90 transition-transform text-gray-400">></span>
          Weapons
        </summary>
        <div class="mt-2 grid grid-cols-1 gap-2">
          <div 
            v-for="(item, slot) in { weapon: char.equipment.weapon }"
            :key="slot"
            class="bg-gray-800/80 rounded-lg border p-2 text-center relative tooltip-parent"
            :class="{ 'opacity-50': !item }"
            :style="[{ borderColor: item ? getTierColor(item.itemDetails?.tier, item.identified) : 'rgb(75, 85, 99)' },`anchor-name: --accessory-${slot};`]"
          >
            <span class="text-sm text-gray-400">{{ item?.name || slot.charAt(0).toUpperCase() + slot.slice(1) }}</span>
            <div
              v-if="item"
              class="tooltip"
              :style="`position-anchor: --accessory-${slot};`"
            >
              <div class="flex flex-col gap-1">
                <p class="font-bold">
                  {{ item.name }}
                </p>
                <template v-if="item.itemDetails">
                  <p
                    class="text-sm capitalize"
                    :style="{
                      'color': getTierColor(item.itemDetails.tier, item.identified)
                    }"
                  >
                    {{ item.itemDetails.tier }}
                  </p>
                  <div
                    v-for="affix in item.itemDetails.affixes.embedded"
                    :key="affix.id"
                    class="text-sm text-gray-400 grid grid-cols-[30px_1fr_30px]"
                  >
                    <span class="text-left opacity-50 text-amber-200">{{ affix.id.split('_')[2] }}</span>
                    <span>{{ formatAffixDescription(affix) }}</span>
                    <span class="text-right opacity-50 text-amber-200">e</span>
                  </div>
                  <div
                    v-for="affix in item.itemDetails.affixes.prefix"
                    :key="affix.id"
                    class="text-sm text-blue-400 grid grid-cols-[30px_1fr_30px]"
                  >
                    <span class="text-left opacity-50 text-amber-200">{{ affix.id.split('_')[2] }}</span>
                    <span>{{ formatAffixDescription(affix) }}</span>
                    <span class="text-right opacity-50 text-amber-200">p</span>
                  </div>
                  <div
                    v-for="affix in item.itemDetails.affixes.suffix"
                    :key="affix.id"
                    class="text-sm text-green-400 grid grid-cols-[30px_1fr_30px]"
                  >
                    <span class="text-left opacity-50 text-amber-200">{{ affix.id.split('_')[2] }}</span>
                    <span>{{ formatAffixDescription(affix) }}</span>
                    <span class="text-right opacity-50 text-amber-200">s</span>
                  </div>
                </template>
                <template v-else>
                  <p class="text-sm opacity-50">
                    Item not identified
                  </p>
                </template>
              </div>
            </div>
          </div>
        </div>
      </details>

      <!-- Accessories -->
      <details class="group">
        <summary class="text-sm text-gray-400 cursor-pointer hover:text-gray-300 flex items-center justify-center gap-2">
          <span class="transform group-open:rotate-90 transition-transform text-gray-400">></span>
          Accessories
        </summary>
        <div class="mt-2 grid grid-cols-3 gap-2">
          <div 
            v-for="(item, slot) in { neck: char.equipment.neck, leftHand: char.equipment.leftHand, rightHand: char.equipment.rightHand }"
            :key="slot"
            class="bg-gray-800/80 rounded-lg border p-2 text-center relative tooltip-parent"
            :class="{ 'opacity-50': !item }"
            :style="[{ borderColor: item ? getTierColor(item.itemDetails?.tier, item.identified) : 'rgb(75, 85, 99)' },`anchor-name: --accessory-${slot};`]"
          >
            <span class="text-sm text-gray-400">{{ item?.name || slot.replace(/([A-Z])/g, ' $1').trim() }}</span>
            <div
              v-if="item"
              class="tooltip"
              :style="`position-anchor: --accessory-${slot};`"
            >
              <div class="flex flex-col gap-1">
                <p class="font-bold">
                  {{ item.name }}
                </p>
                <template v-if="item.itemDetails">
                  <p
                    class="text-sm capitalize"
                    :style="{
                      'color': getTierColor(item.itemDetails.tier, item.identified)
                    }"
                  >
                    {{ item.itemDetails.tier }}
                  </p>
                  <div
                    v-for="affix in item.itemDetails.affixes.embedded"
                    :key="affix.id"
                    class="text-sm text-gray-400 grid grid-cols-[30px_1fr_30px]"
                  >
                    <span class="text-left opacity-50 text-amber-200">{{ affix.id.split('_')[2] }}</span>
                    <span>{{ formatAffixDescription(affix) }}</span>
                    <span class="text-right opacity-50 text-amber-200">e</span>
                  </div>
                  <div
                    v-for="affix in item.itemDetails.affixes.prefix"
                    :key="affix.id"
                    class="text-sm text-blue-400 grid grid-cols-[30px_1fr_30px]"
                  >
                    <span class="text-left opacity-50 text-amber-200">{{ affix.id.split('_')[2] }}</span>
                    <span>{{ formatAffixDescription(affix) }}</span>
                    <span class="text-right opacity-50 text-amber-200">p</span>
                  </div>
                  <div
                    v-for="affix in item.itemDetails.affixes.suffix"
                    :key="affix.id"
                    class="text-sm text-green-400 grid grid-cols-[30px_1fr_30px]"
                  >
                    <span class="text-left opacity-50 text-amber-200">{{ affix.id.split('_')[2] }}</span>
                    <span>{{ formatAffixDescription(affix) }}</span>
                    <span class="text-right opacity-50 text-amber-200">s</span>
                  </div>
                </template>
                <template v-else>
                  <p class="text-sm opacity-50">
                    Item not identified
                  </p>
                </template>
              </div>
            </div>
          </div>
        </div>
      </details>
    </template>
  </div>
</template>

<style scoped>
  @reference "@/assets/main.css";

  details {
    border: 1px solid rgba(75, 85, 99, 0.4);
    border-radius: 0.5rem;
    padding: 0.5rem;
  }

  details summary {
    list-style: none;
  }

  details summary::-webkit-details-marker {
    display: none;
  }

  details[open] {
    background-color: rgba(31, 41, 55, 0.4);
  }

  .tooltip {
    @apply fixed hidden bg-gray-900 border border-gray-600/40 rounded-md;
    @apply text-gray-200 text-sm whitespace-nowrap;
    @apply p-2 z-50;
    top: anchor(bottom);
    justify-self: anchor-center;
  }

  .tooltip-parent:hover .tooltip {
    @apply block;
  }
</style> 