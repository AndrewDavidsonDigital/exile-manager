<script setup lang="ts">
  import { generateRandomId } from '@/lib/core';
  // import { useGameEngine } from '@/stores/game';
  import { ref } from 'vue';
  import FluidElement from './elements/FluidElement.vue';

  interface IShop {
    isRuined: boolean;
    name: string;
    interaction: () => any;
    description: {
      ruin: string;
      repaired: string;
    }
  }

  const shops = ref<IShop[]>([
    {
      isRuined: true,
      name: 'Smithy',
      interaction: () => {},
      description: {
        ruin: 'Charred stones and rusted tools hint at a forge long forgotten.',
        repaired: 'Embers flicker in the back as the forge.',
      }
    },
    {
      isRuined: true,
      name: 'Apothecary',
      interaction: () => {},
      description: {
        ruin: '',
        repaired: '',
      }
    },
  ]);

  // const gameEngine = useGameEngine();


</script>

<template>
  <div class="flex flex-col md:flex-row gap-4 h-full">
    <button
      v-for="shop,index in shops"
      :key="`shop_${index}`"
    >
      <FluidElement
        class="w-fit !p-1"
      >
        {{ shop.isRuined ? `Ruins: ${generateRandomId()}` : shop.name }}
      </FluidElement>
    </button>
  </div>
</template>

<style scoped>
  @reference "@/assets/main.css";
</style> 