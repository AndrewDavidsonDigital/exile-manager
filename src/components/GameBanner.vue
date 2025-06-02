<script setup lang="ts">
  import { useAdventuringStore } from '@/stores/adventuring';
  import { useGameEngine } from '@/stores/game';

  const gameEngine = useGameEngine();
  const adventuringStore = useAdventuringStore();
</script>

<template>
  <section class="flex gap-2 mx-auto">
    <span
      v-if="gameEngine.character"
      class="capitalize"
    >{{ gameEngine.character.name }} the {{ gameEngine.character.class }} ({{ gameEngine.character.level }}) - </span>{{ gameEngine.difficulty }}
  </section>
  <section 
    v-if="gameEngine.isVersionSaveOutOfDate"
    class="flex gap-2 mx-auto bg-amber-700 text-black text-lg w-full justify-center py-2"
  >
    <span
      v-if="gameEngine.character"
      class="capitalize"
    >Save version is out of date. Current: {{ gameEngine.getVersions.game }} Save: {{ gameEngine.getVersions.save }}</span>
    <button 
      class=" border border-black px-2 rounded-lg bg-black text-amber-700"
      :class="[
        {'pointer-events-none': adventuringStore.isAdventuring },
      ]"
      @click="gameEngine.migrateSave()"
    >
      Attempt Migration
    </button>
  </section>
</template>
