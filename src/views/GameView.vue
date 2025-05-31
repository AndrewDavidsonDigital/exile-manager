<script setup lang="ts">
  import CharacterEquipment from '@/components/CharacterEquipment.vue';
  import CharacterState from '@/components/CharacterState.vue';
  import FluidElement from '@/components/FluidElement.vue';
  import WorldState from '@/components/WorldState.vue';
  import CharacterCreation from '@/components/CharacterCreation.vue';
  import LevelSelection from '@/components/LevelSelection.vue';
  import { useGameEngine } from '@/stores/game';
  import { useAdventuringStore } from '@/stores/adventuring';
  import { computed, ref } from 'vue';
  import { levels, type ILevel } from '@/types/game';

  const gameEngine = useGameEngine();
  const adventuringStore = useAdventuringStore();
  const hasCharacter = computed(() => gameEngine.getCharacter !== -1);
  const selectedLevel = ref<ILevel>();
  const character = gameEngine.getCharacter;

  function startAdventuring() {
    if (selectedLevel.value) {
      adventuringStore.startAdventuring(selectedLevel.value);
    }
  }
</script>

<template>
  <section class="flex flex-col items-center gap-2 mt-2 [&>*]:max-w-content [&>*]:w-full mx-[min(3%,_2rem)]">
    <template v-if="hasCharacter">
      <FluidElement>
        <WorldState />
      </FluidElement>
      <div class="flex gap-2">
        <FluidElement class="w-full">
          <CharacterState />
        </FluidElement>
        <FluidElement class="w-full">
          <!-- Equipment Section -->
          <CharacterEquipment />
        </FluidElement>
      </div>
      <LevelSelection
        v-model="selectedLevel"
        :levels="levels"
        :character-level="typeof character === 'number' ? -1 : character.level"
        :is-adventuring="adventuringStore.isAdventuring"
        @start-adventuring="() => startAdventuring()"
      />
      <FluidElement class="min-h-40 max-h-[30dvh] flex flex-col overflow-y-scroll scrollbar overflow-x-clip">
        <TransitionGroup
          tag="ul" 
          class="mask-b"
        >
          <template
            v-for="log, index in adventuringStore.adventureJournal.toReversed()"
            :key="`journal_${index}`"
          >
            <li>{{ log }}</li>
          </template>
        </TransitionGroup>
      </FluidElement>
    </template>
    <template v-else>
      <CharacterCreation />
    </template>
  </section>
</template>
<style scoped>
  .mask-b {
    mask-image: linear-gradient(to bottom, black 0, black 60%, transparent 100%);
  }
</style>