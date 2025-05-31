<script setup lang="ts">
  import CharacterEquipment from '@/components/CharacterEquipment.vue';
  import CharacterState from '@/components/CharacterState.vue';
  import FluidElement from '@/components/FluidElement.vue';
  import WorldState from '@/components/WorldState.vue';
  import CharacterCreation from '@/components/CharacterCreation.vue';
  import LevelSelection from '@/components/LevelSelection.vue';
  import { useGameEngine } from '@/stores/game';
  import { useAdventuringStore } from '@/stores/adventuring';
  import { computed, ref, watch } from 'vue';
  import { levels, type ILevel } from '@/lib/game';
  import ModalDialog from '@/components/ModalDialog.vue';

  const gameEngine = useGameEngine();
  const adventuringStore = useAdventuringStore();
  const hasCharacter = computed(() => gameEngine.getCharacter !== -1);
  const isCharAlive = computed(() => gameEngine.getCharacter !== -1 && !(gameEngine.isDead));
  const selectedLevel = ref<ILevel>();
  const levelDelta = computed(() => gameEngine.getCharacter !== -1 ? gameEngine.getCharacter.level : 0);
  
  const modalShown = ref<boolean>(false);

  function startAdventuring() {
    if (selectedLevel.value) {
      adventuringStore.startAdventuring(selectedLevel.value);
    }
  }

  watch(isCharAlive, (newVal) => {
    if (newVal === false && hasCharacter.value){
      modalShown.value = true;
    }
  });

</script>

<template>
  <section class="flex flex-col items-center gap-2 mt-2 [&>*]:max-w-content [&>*]:w-full mx-[min(3%,_2rem)]">
    <template v-if="hasCharacter">
      <FluidElement>
        <WorldState />
      </FluidElement>
      <div class="gap-2 grid grid-cols-1 md:grid-cols-[2fr_1fr]">
        <FluidElement class="w-full">
          <CharacterState />
        </FluidElement>
        <FluidElement class="w-full">
          <CharacterEquipment />
        </FluidElement>
      </div>
      <LevelSelection
        v-model="selectedLevel"
        :class="isCharAlive ? '' : 'pointer-events-none opacity-50'"
        :levels="levels"
        :character-level="levelDelta"
        :is-adventuring="adventuringStore.isAdventuring"
        @start-adventuring="() => startAdventuring()"
      />
      <FluidElement class="h-full max-h-[30dvh] overflow-y-scroll scrollbar overflow-x-clip">
        <div class="mask-b ">
          <TransitionGroup
            tag="ul" 
            class="flex flex-col last:pb-2"
          >
            <template
              v-for="log, index in adventuringStore.adventureJournal.toReversed()"
              :key="`journal_${index}`"
            >
              <li>{{ log }}</li>
            </template>
          </TransitionGroup>
        </div>
      </FluidElement>
    </template>
    <template v-else>
      <CharacterCreation
        @character-created="() => adventuringStore.reset()"
      />
    </template>
  </section>
  <ModalDialog
    id="gameModal"
    :show="modalShown"
  >
    <section class="flex flex-col gap-2 text-emerald-200">
      <div class="">
        <p>At level {{ gameEngine.character?.level }}</p>
        <p>{{ gameEngine.character?.name }} has perished hoarding {{ gameEngine.character?.loot.length }} valuables</p>
      </div>
      <FluidElement class="h-full max-h-[30dvh] overflow-y-scroll scrollbar overflow-x-clip ">
        <div class="mask-b ">
          <TransitionGroup
            tag="ul" 
            class="flex flex-col last:pb-2"
          >
            <template
              v-for="log, index in adventuringStore.adventureJournal.toReversed()"
              :key="`journal_${index}`"
            >
              <li>{{ log }}</li>
            </template>
          </TransitionGroup>
        </div>
      </FluidElement>
      <FluidElement class="w-fit !p-2">
        <button
          class="size-full"
          @click="() => {modalShown = false; gameEngine.restart()}"
        >
          Start a new Run
        </button>
      </FluidElement>
    </section>
  </ModalDialog>
</template>
<style scoped>
  .mask-b {
    mask-image: linear-gradient(to bottom, black 0, black calc(100% - 2rem), transparent 100%);
  }
</style>