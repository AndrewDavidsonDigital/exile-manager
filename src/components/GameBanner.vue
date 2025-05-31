<script setup lang="ts">
  import { useGameEngine } from '@/stores/game';

  const gameEngine = useGameEngine();
</script>

<template>
  <section class="flex gap-2 mx-auto">
    <span
      v-if="gameEngine.character"
      class="capitalize"
    >{{ gameEngine.character.name }} ({{ gameEngine.character.level }}) - </span>{{ gameEngine.difficulty }}
  </section>
</template>
