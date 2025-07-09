<script setup lang="ts">
import { useGameEngine } from '@/stores/game';
import { formatAffixDescription, type ILoot, type ICharacterEquipment } from '@/lib/game';
import { formatBaseAffixValue } from '@/lib/itemUtils';
import { inject, ref } from 'vue';
import type { AffixValue } from '@/lib/affixTypes';
import { ErrorNumber } from '@/lib/typescript';
import EquipmentSlot from './elements/EquipmentSlot.vue';
import { AudioKey, EVENT_AUDIO_KEY, type EventWithAudio } from '@/lib/core';

const ctrlPressed = inject<undefined | { value: boolean}>('ctrlPressed');
const gameEngine = useGameEngine();
const char = gameEngine.getCharacter;

type BrushMode = 'none' | 'unequip';
const activeBrush = ref<BrushMode>('none');

function alertStats(item: ILoot | undefined): void{
  if (!item){
    return
  }

  let output = `${item.name}\n`;
  
  if (item.itemDetails) {
    output += `\nTier: ${item.itemDetails.tier}\n`;

    // Base Affix
    if (item.itemDetails.baseDetails && item.itemDetails.baseDetails.value) {
      output += '\n\n';
      output += `${formatBaseAffixValue(item.itemDetails.baseDetails.value as AffixValue)}\n`;
    }
    
    // Embedded affixes
    if (item.itemDetails.affixes.embedded.length > 0) {
      output += '\nEmbedded:\n';
      item.itemDetails.affixes.embedded.forEach(affix => {
        output += `${formatAffixDescription(affix)}\n`;
      });
    }
    
    // Prefix affixes
    if (item.itemDetails.affixes.prefix.length > 0) {
      output += '\nPrefixes:\n';
      item.itemDetails.affixes.prefix.forEach(affix => {
        output += `${formatAffixDescription(affix)}\n`;
      });
    }
    
    // Suffix affixes
    if (item.itemDetails.affixes.suffix.length > 0) {
      output += '\nSuffixes:\n';
      item.itemDetails.affixes.suffix.forEach(affix => {
        output += `${formatAffixDescription(affix)}\n`;
      });
    }
  } else {
    output += '\nItem not identified';
  }

  alert(output);
}

function unequipItem(slot: keyof ICharacterEquipment): void {
  if (!char || char === ErrorNumber.NOT_FOUND) return;

  // Allow unequip if either CTRL is pressed or brush is active
  if ((!ctrlPressed || ctrlPressed.value !== true) && activeBrush.value !== 'unequip') {
    return;
  }
  
  const item = char.equipment[slot];
  if (!item) return;

  // Add item to inventory
  char.loot.push(item);
  // Clear equipment slot
  char.equipment[slot] = undefined;
  // Save state
  gameEngine.saveState();
  
  // Reset brush after unequipping
  if (activeBrush.value === 'unequip') {
    activeBrush.value = 'none';
  }
}

const resetBrush = (): void => {
  activeBrush.value = 'none';
};

</script>

<template>
  <div>
    <template v-if="char !== ErrorNumber.NOT_FOUND">
      <!-- Brush Tools -->
      <section class="md:hidden flex flex-col gap-2">
        <div class="flex justify-between gap-2 mb-2">
          <button
            class="w-fit"
            :class="[
              { 'opacity-50': activeBrush !== 'unequip' },
              { 'pointer-events-none': activeBrush === 'unequip' }
            ]"
            @click="e => { activeBrush = activeBrush === 'unequip' ? 'none' : 'unequip'; (e as EventWithAudio)[EVENT_AUDIO_KEY] = AudioKey.BRUSH ;}"
          >
            <div class="bg-gray-800/80 rounded-lg border p-2 w-fit">
              Unequip Brush
            </div>
          </button>
          <button
            v-if="activeBrush !== 'none'"
            class="w-fit"
            @click="resetBrush"
          >
            <div class="bg-gray-800/80 rounded-lg border p-2 w-fit">
              Reset
            </div>
          </button>
        </div>

        <!-- Armor -->
        <details class="group">
          <summary class="text-sm text-gray-400 cursor-pointer hover:text-gray-300 flex gap-2 mx-auto w-fit">
            <span class="transform group-open:rotate-90 transition-transform text-gray-400">></span>
            Armor
          </summary>
          <div class="mt-2 grid grid-cols-3 gap-2">
            <EquipmentSlot
              v-for="(item, slot) in { 
                shoulders: char.equipment.shoulders,
                head: char.equipment.head, 
                arms: char.equipment.arms,
                chest: char.equipment.chest, 
                legs: char.equipment.legs, 
                feet: char.equipment.feet 
              }"
              :key="`arm-${slot}-${Date.now()}`"
              :item="item"
              :slot-name="slot"
              :active-brush="activeBrush"
              @unequip="() => unequipItem(slot)"
              @alert-stats="() => alertStats(item)"
            />
          </div>
        </details>

        <!-- Weapons -->
        <details class="group">
          <summary class="text-sm text-gray-400 cursor-pointer hover:text-gray-300 flex items-center justify-center gap-2">
            <span class="transform group-open:rotate-90 transition-transform text-gray-400">></span>
            Weapons
          </summary>
          <div class="mt-2 grid grid-cols-1 gap-2">
            <EquipmentSlot
              v-for="(item, slot) in { weapon: char.equipment.weapon }"
              :key="`weap-${slot}-${Date.now()}`"
              :item="item"
              :slot-name="slot"
              :active-brush="activeBrush"
              @unequip="() => unequipItem(slot)"
              @alert-stats="() => alertStats(item)"
            />
          </div>
        </details>

        <!-- Accessories -->
        <details class="group">
          <summary class="text-sm text-gray-400 cursor-pointer hover:text-gray-300 flex items-center justify-center gap-2">
            <span class="transform group-open:rotate-90 transition-transform text-gray-400">></span>
            Accessories
          </summary>
          <div class="mt-2 grid grid-cols-3 gap-2">
            <EquipmentSlot
              v-for="(item, slot) in { neck: char.equipment.neck, leftHand: char.equipment.leftHand, rightHand: char.equipment.rightHand }"
              :key="`acc-${slot}-${Date.now()}`"
              :item="item"
              :slot-name="slot"
              :active-brush="activeBrush"
              @unequip="() => unequipItem(slot)"
              @alert-stats="() => alertStats(item)"
            />
          </div>
        </details>
      </section>

      <section class="hidden md:block">
        <!-- Equipment -->
        <details
          class="group"
          open
        >
          <summary class="text-sm text-gray-400 cursor-pointer hover:text-gray-300 flex gap-2 mx-auto w-fit">
            <span class="transform group-open:rotate-90 transition-transform text-gray-400">></span>
            Equipment
          </summary>
          <div class="mt-2 grid grid-cols-3 gap-2 pb-2">
            <EquipmentSlot
              v-for="(item, slot) in { 
                shoulders: char.equipment.shoulders,
                head: char.equipment.head, 
                arms: char.equipment.arms,
                chest: char.equipment.chest, 
                legs: char.equipment.legs, 
                feet: char.equipment.feet 
              }"
              :key="`arm-${slot}-${Date.now()}`"
              :item="item"
              :slot-name="slot"
              :active-brush="activeBrush"
              @unequip="() => unequipItem(slot)"
              @alert-stats="() => alertStats(item)"
            />
          </div>

          <div class="mt-2 grid grid-cols-1 gap-2 pb-2">
            <EquipmentSlot
              v-for="(item, slot) in { weapon: char.equipment.weapon }"
              :key="`weap-${slot}-${Date.now()}`"
              :item="item"
              :slot-name="slot"
              :active-brush="activeBrush"
              @unequip="() => unequipItem(slot)"
              @alert-stats="() => alertStats(item)"
            />
          </div>

          <div class="mt-2 grid grid-cols-3 gap-2 pb-2">
            <EquipmentSlot
              v-for="(item, slot) in { neck: char.equipment.neck, leftHand: char.equipment.leftHand, rightHand: char.equipment.rightHand }"
              :key="`acc-${slot}-${Date.now()}`"
              :item="item"
              :slot-name="slot"
              :active-brush="activeBrush"
              @unequip="() => unequipItem(slot)"
              @alert-stats="() => alertStats(item)"
            />
          </div>
        </details>
        <blockquote class="opacity-50 italic">
          Un-equip item by holding CTRL
        </blockquote>
      </section>
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
</style> 