<script setup lang="ts">
import { useGameEngine } from '@/stores/game';

const gameEngine = useGameEngine();
const difficulty = gameEngine.getDifficulty;
</script>

<template>
  <div class="flex flex-col gap-1">
    <template v-if="difficulty !== -1">
      <div class="text-xl font-bold">
        {{ difficulty.name }}
      </div>
      <div class="text-sm">
        <div>Danger Multiplier: {{ difficulty.dangerMultiplier }}x</div>
        <div>Loot Multiplier: {{ difficulty.lootMultiplier }}x</div>
      </div>
    </template>
  </div>
</template> 