<script setup lang="ts">
import { getTierColor, formatBaseAffixValue } from '@/lib/itemUtils';
import { formatAffixDescription, type ILoot } from '@/lib/game';
import type { AffixValue } from '@/lib/affixTypes';
import RomanNumeral from './RomanNumeral.vue';
import { TIER_SEPARATOR } from '@/lib/core';
import { inject } from 'vue';


const ctrlPressed = inject<undefined | { value: boolean}>('ctrlPressed');

const props = defineProps<{
  item: ILoot | undefined;
  slotName: string;
  activeBrush?: string;
}>();

const $emit = defineEmits<{
  (_e: 'unequip'): void;
  (_e: 'alertStats'): void;
}>();

function alertStats() {
  if (!props.item) return;
  $emit('alertStats');
}

function unequipItem() {
  if (!props.item) return;
  $emit('unequip');
}
</script>

<template>
  <button 
    class="bg-gray-800/80 rounded-lg border p-2 text-center relative tooltip-parent"
    :class="[
      { 'opacity-50 pointer-events-none': !item },
      { '!border-red-500': (ctrlPressed && item) || (activeBrush === 'unequip' && item) }
    ]"
    :style="[{ borderColor: item ? getTierColor(item.itemDetails?.tier, item.identified) : 'rgb(75, 85, 99)' },`anchor-name: --accessory-${slotName};`]"
    @touchend="() => activeBrush === 'none' && alertStats()"
    @click="() => item && unequipItem()"
    @keydown.enter="() => item && unequipItem()"
    @keydown.space="() => item && unequipItem()"
  >
    <span class="text-sm text-gray-400 capitalize">
      <span 
        :style="[{ color: item ? getTierColor(item.itemDetails?.tier, item.identified) : 'rgb(75, 85, 99)' }]"
      >{{ item ? item.itemDetails?.tier : '' }}</span>
      {{ item ? item.type : slotName.replace(/([A-Z])/g, ' $1').trim() }}
    </span>
    <div
      v-if="item"
      class="tooltip"
      :style="`position-anchor: --accessory-${slotName};`"
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
            v-if="item.itemDetails.baseDetails"
            class="text-sm text-amber-200 capitalize"
          >
            {{ item.itemDetails.baseDetails.name }}: {{ formatBaseAffixValue(item.itemDetails.baseDetails.value as AffixValue) }}
          </div>
          <div
            v-for="affix in item.itemDetails.affixes.embedded"
            :key="`emb-${slotName}-${affix.id}-${Date.now()}`"
            class="text-sm text-gray-400 grid grid-cols-[30px_1fr_30px]"
          >
            <template v-if="formatAffixDescription(affix).split(TIER_SEPARATOR).length > 1">
              <span class="text-left opacity-50 text-amber-200"><RomanNumeral :count="Number(affix.id.split('_')[2])" /></span>
              <span>{{ formatAffixDescription(affix).split(TIER_SEPARATOR)[0] }}</span>
            </template>
            <template v-else>
              <span class="text-left opacity-50 text-amber-200">{{ affix.id.split('_')[2] }}</span>
              <span>{{ formatAffixDescription(affix) }}</span>
            </template>
            <span class="text-right opacity-50 text-amber-200">e</span>
          </div>
          <div
            v-for="affix in item.itemDetails.affixes.prefix"
            :key="`pre-${slotName}-${affix.id}-${Date.now()}`"
            class="text-sm text-blue-400 grid grid-cols-[30px_1fr_30px]"
          >
            <template v-if="formatAffixDescription(affix).split(TIER_SEPARATOR).length > 1">
              <span class="text-left opacity-50 text-amber-200"><RomanNumeral :count="Number(affix.id.split('_')[2])" /></span>
              <span>{{ formatAffixDescription(affix).split(TIER_SEPARATOR)[0] }}</span>
            </template>
            <template v-else>
              <span class="text-left opacity-50 text-amber-200">{{ affix.id.split('_')[2] }}</span>
              <span>{{ formatAffixDescription(affix) }}</span>
            </template>
            <span class="text-right opacity-50 text-amber-200">p</span>
          </div>
          <div
            v-for="affix in item.itemDetails.affixes.suffix"
            :key="`suf-${slotName}-${affix.id}-${Date.now()}`"
            class="text-sm text-green-400 grid grid-cols-[30px_1fr_30px]"
          >
            <template v-if="formatAffixDescription(affix).split(TIER_SEPARATOR).length > 1">
              <span class="text-left opacity-50 text-amber-200"><RomanNumeral :count="Number(affix.id.split('_')[2])" /></span>
              <span>{{ formatAffixDescription(affix).split(TIER_SEPARATOR)[0] }}</span>
            </template>
            <template v-else>
              <span class="text-left opacity-50 text-amber-200">{{ affix.id.split('_')[2] }}</span>
              <span>{{ formatAffixDescription(affix) }}</span>
            </template>
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
  </button>
</template>

<style scoped>
  @reference "@/assets/main.css";

  .tooltip {
    @apply fixed hidden bg-gray-900 border border-gray-600/40 rounded-md;
    @apply text-gray-200 text-sm whitespace-nowrap;
    @apply p-2 z-50;
    @apply cursor-default;
    top: anchor(bottom);
    justify-self: anchor-center;
  }

  .tooltip-parent:hover .tooltip {
    @apply block;
  }
</style> 