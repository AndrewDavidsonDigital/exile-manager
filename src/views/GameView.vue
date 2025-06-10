<script setup lang="ts">
  import CharacterEquipment from '@/components/CharacterEquipment.vue';
  import CharacterState from '@/components/CharacterState.vue';
  import FluidElement from '@/components/FluidElement.vue';
  import WorldState from '@/components/WorldState.vue';
  import CharacterCreation from '@/components/CharacterCreation.vue';
  import LevelSelection from '@/components/LevelSelection.vue';
  import LootManager from '@/components/LootManager.vue';
  import { useGameEngine } from '@/stores/game';
  import { useAdventuringStore } from '@/stores/adventuring';
  import { computed, ref, watch } from 'vue';
  import ModalDialog from '@/components/ModalDialog.vue';
  import SwitchToggle from '@/components/SwitchToggle.vue';
  import { ErrorNumber } from '@/lib/typescript';
  import { LevelType, type ILevel } from '@/lib/core';

  const gameEngine = useGameEngine();
  const adventuringStore = useAdventuringStore();
  const hasCharacter = computed(() => gameEngine.getCharacter !== ErrorNumber.NOT_FOUND);
  const isCharAlive = computed(() => gameEngine.getCharacter !== ErrorNumber.NOT_FOUND && !(gameEngine.isDead));
  const selectedLevel = ref<ILevel>();
  const levelDelta = computed(() => gameEngine.getCharacter !== ErrorNumber.NOT_FOUND ? gameEngine.getCharacter.level : 0);
  const activeTab = ref<TabType>('adventuring');
  const lastUpdate = ref<number>(Date.now());
  const reportingStyle = ref<boolean>(false);

  const enableCheats = import.meta.env.DEV;
  
  type TabType = 'adventuring' | 'loot' | 'town';
  const modalShown = ref<boolean>(false);

  const REPORT_DOM_ID = '_activity-report';

  function startAdventuring() {
    if (selectedLevel.value) {
      adventuringStore.startAdventuring(selectedLevel.value, reportingStyle.value);
    }
    setTimeout(
      ()=>{
        document.getElementById(REPORT_DOM_ID)?.scrollIntoView({behavior: 'smooth'});
      },
      500
    )
  }

  watch(isCharAlive, (newVal) => {
    if (newVal === false && hasCharacter.value){
      modalShown.value = true;
    }
  });

  function scrollIntoView(){
    document.querySelector("#_activity-report")?.scroll({ top:0, behavior :'smooth' })
  }

</script>

<template>
  <section class="flex flex-col items-center gap-2 my-2 [&>*]:max-w-content [&>*]:w-full mx-[min(3%,_2rem)]">
    <template v-if="hasCharacter">
      <FluidElement>
        <WorldState />
      </FluidElement>
      <section
        v-if="enableCheats"
        class="flex flex-col"
      >
        <div class="mx-auto w-fit">
          CHEATS
        </div>
        <div class="flex gap-2 justify-center">
          <button
            v-if="gameEngine.character"
            class="w-fit"
            @click="gameEngine.character.pendingRewards.passives++"
          >
            <FluidElement>
              add passive
            </FluidElement>
          </button>
          <button
            v-if="gameEngine.character"
            class="w-fit"
            @click="gameEngine.character.pendingRewards.skills++"
          >
            <FluidElement>
              add Skill
            </FluidElement>
          </button>
          <button
            class="w-fit"
            @click="gameEngine.levelUp()"
          >
            <FluidElement>
              LevelUp
            </FluidElement>
          </button>
        </div>
      </section>
      <article
        class="flex gap-2 justify-center"
        :class="[
          { 'opacity-50 pointer-events-none' : adventuringStore.isAdventuring },
        ]"
      >
        <button @click="activeTab = 'adventuring'; lastUpdate = Date.now()">
          <FluidElement class="w-fit">
            Go Adventuring
          </FluidElement>
        </button>
        <button @click="activeTab = 'loot'">
          <FluidElement class="w-fit">
            Manage Loot
          </FluidElement>
        </button>
        <button @click="activeTab = 'town'">
          <FluidElement class="w-fit">
            Goto Town - NYI
          </FluidElement>
        </button>
      </article>
      <section
        class="grid-area-stack"
        :class="[
          { 'opacity-50 pointer-events-none' : adventuringStore.isAdventuring },
        ]"
      >
        <article
          v-show="activeTab === 'adventuring'"
        >
          <LevelSelection
            v-model="selectedLevel"
            :toggle="lastUpdate"
            :class="isCharAlive ? '' : 'pointer-events-none opacity-50'"
            :levels="gameEngine.getAvailableLevels"
            :character-level="levelDelta"
            :is-adventuring="adventuringStore.isAdventuring"
            @start-adventuring="() => startAdventuring()"
          />
        </article>
        <article v-show="activeTab === 'loot'">
          <FluidElement class="w-full">
            <LootManager />
          </FluidElement>
        </article>
        <article v-show="activeTab === 'town'">
          <FluidElement class="w-full">
            TOWN
          </FluidElement>
        </article>
      </section>
      <div class="gap-2 grid grid-cols-1 md:grid-cols-[2fr_1fr]">
        <CharacterState class="w-full order-2" />
        <FluidElement class="w-full hidden md:block order-3">
          <CharacterEquipment />
        </FluidElement>
        <FluidElement
          v-if="activeTab === 'loot'"
          class="w-full md:hidden block order-1"
        >
          <CharacterEquipment />
        </FluidElement>
      </div>
      <div class="flex justify-center -mb-7 z-10">
        <button
          class="w-fit"
          :class="[
            {'pointer-events-none blur-xs': adventuringStore.isAdventuring || !isCharAlive || !selectedLevel || selectedLevel.uses === 0 }
          ]"
          @click="startAdventuring()"
        >
          <FluidElement
            v-if="selectedLevel?.type === LevelType.DEFAULT"
            class="w-fit py-1 hover:scale-125 transition-all duration-300"
          >
            <span v-if="!(selectedLevel.preface)">Approach: {{ selectedLevel.name }}</span>
            <span v-else>{{ selectedLevel.preface }} {{ selectedLevel.name }}</span>
          </FluidElement>
          <FluidElement
            v-else
            class="w-fit py-1 hover:scale-125 transition-all duration-300"
          >
            Approach
            <span
              v-for="segment, index in selectedLevel?.name.split(': ')"
              :key="`naming_${index}`"
              class="transition-all"
              :class="[
                { 'blurred' : index === 1 },
              ]"
            >
              {{ segment }}{{ index === 0 ? ': ' : '' }}
            </span>
          </FluidElement>
        </button>
      </div>

      <FluidElement
        :id="REPORT_DOM_ID"
        class="h-full max-h-[50dvh] md:max-h-[30dvh] overflow-y-scroll scrollbar overflow-x-clip !pt-2"
      >
        <div
          class="flex gap-2 bg-neutral-900 sticky -top-3 px-5 -mx-5 py-1 border-b border-emerald-900"
        >
          <h2 class="text-lg">
            Activity Log: 
          </h2>
          <p class="content-center ml-auto">
            {{ reportingStyle ? "Detailed Combat logs" : "Condensed Logs" }}
          </p>
          <div class="content-center">
            <SwitchToggle v-model="reportingStyle" />
          </div>
        </div>
        <TransitionGroup
          tag="ul" 
          class="flex flex-col last:pb-2"
        >
          <template
            v-for="log, index in adventuringStore.adventureJournal.toReversed()"
            :key="`journal_${index}`"
          >
            <li 
              class="ml-2 md:ml-4"
              :class="[
                { 'text-amber-300': log.type === 'Treasure' },
                { 'text-red-600': log.type === 'Danger' },
                { 'text-red-400': log.type === 'DangerLite' },
                { 'text-blue-400': log.type === 'Generic' },
                { 'text-teal-500': log.type === 'Safe' },
                { 'text-slate-400': log.type === 'Horror' },
              ]"
            >
              <p
                v-for="msg, mIndex in log.message.split('\n')"
                :key="`message_line_${index}-${mIndex}`"
                class="whitespace-preserve"
              >
                {{ msg }}
              </p>
            </li>
          </template>
        </TransitionGroup>
        <button
          v-if="adventuringStore.adventureJournal.length > 4"
          class="flex sticky ml-auto bottom-0 z-100"
          @click="scrollIntoView"
        >
          <FluidElement class="!rounded-full !px-2 !py-0">
            ↑
          </FluidElement>
        </button>
      </FluidElement>
      <article
        v-if="adventuringStore.adventureJournal.length > 2"
        class="mask-b -mt-2"
      >
      </article>
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
    class="backdrop:!bg-red-800"
    disable-lite-dismiss
  >
    <section class="flex flex-col gap-2 text-emerald-200">
      <div class="">
        <p>At level {{ gameEngine.character?.level }}</p>
        <p>{{ gameEngine.character?.name }} has perished hoarding {{ gameEngine.character?.loot.length }} valuables</p>
      </div>
      <FluidElement class="h-full max-h-[30dvh] overflow-y-scroll scrollbar overflow-x-clip ">
        <TransitionGroup
          tag="ul" 
          class="flex flex-col last:pb-2"
        >
          <template
            v-for="log, index in adventuringStore.adventureJournal.toReversed()"
            :key="`modal_journal_${index}`"
          >
            <li 
              :class="[
                { 'text-amber-300': log.type === 'Treasure' },
                { 'text-red-600': log.type === 'Danger' },
                { 'text-red-400': log.type === 'DangerLite' },
                { 'text-blue-400': log.type === 'Generic' },
                { 'text-teal-500': log.type === 'Safe' },
              ]"
            >
              <p
                v-for="msg, mIndex in log.message.split('\n')"
                :key="`modal_message_line_${index}-${mIndex}`"
                class="whitespace-preserve"
              >
                {{ msg }}
              </p>
            </li>
          </template>
        </TransitionGroup>
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
  @reference "@/assets/main.css";
  .mask-b{
    @apply relative;
    @apply before:absolute before:w-[calc(100%_-_0.75rem)] before:h-16 before:bottom-[1px] before:left-[1px] before:rounded-bl-xl;
    @apply before:bg-neutral-900;
  }
  .mask-b::before {
    mask-image: linear-gradient(
      to bottom, 
      transparent,
      black 80%
    );
    @apply z-10;
  }

  .blurred {
    filter: blur(2px);
    opacity: 0.7;
  }
</style>
