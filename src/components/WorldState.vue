<script setup lang="ts">
import { useGameEngine } from '@/stores/game';
import FluidElement from './FluidElement.vue';

const gameEngine = useGameEngine();
const difficulty = gameEngine.getDifficulty;
</script>

<template>
  <article class="flex flex-col gap-2">
    <div class="flex justify-between">
      <div class="flex flex-col gap-1">
        <template v-if="difficulty !== -1">
          <div class="text-xl font-bold">
            {{ difficulty.name }}
          </div>
        </template>
      </div>
      <FluidElement class="w-fit !p-2">
        <button
          class="size-full"
          @click="() => gameEngine.restart()"
        >
          Start a new Run
        </button>
      </FluidElement>
    </div>
    <div class="flex gap-2">
      <div class="flex flex-col gap-1">
        <template v-if="difficulty !== -1">
          <div class="text-sm">
            <div>Danger Multiplier: {{ difficulty.dangerMultiplier }}x</div>
            <div>Loot Multiplier: {{ difficulty.lootMultiplier }}x</div>
          </div>
        </template>
      </div>
      <div class="text-sm">
        Days survived: {{ gameEngine.runs }}
      </div>
    </div>  
  </article>
</template> 