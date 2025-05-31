<script setup lang="ts">
  import CharacterEquipment from '@/components/CharacterEquipment.vue';
  import CharacterState from '@/components/CharacterState.vue';
  import FluidElement from '@/components/FluidElement.vue';
  import WorldState from '@/components/WorldState.vue';
  import CharacterCreation from '@/components/CharacterCreation.vue';
  import { useGameEngine } from '@/stores/game';
  import { computed } from 'vue';

  const gameEngine = useGameEngine();
  const hasCharacter = computed(() => gameEngine.getCharacter !== -1);
</script>

<template>
  <section class="flex flex-col items-center gap-2 mt-2 [&>*]:max-w-content [&>*]:w-full">
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
      <FluidElement class="min-h-20">
        Events Log goes here
      </FluidElement>
    </template>
    <template v-else>
      <CharacterCreation />
    </template>
  </section>
</template>
