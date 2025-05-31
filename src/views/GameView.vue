<script setup lang="ts">
  import CharacterEquipment from '@/components/CharacterEquipment.vue';
  import CharacterState from '@/components/CharacterState.vue';
  import FluidElement from '@/components/FluidElement.vue';
  import WorldState from '@/components/WorldState.vue';
  import CharacterCreation from '@/components/CharacterCreation.vue';
  import { useGameEngine } from '@/stores/game';
  import { computed, ref } from 'vue';

  const gameEngine = useGameEngine();
  const hasCharacter = computed(() => gameEngine.getCharacter !== -1);

  const character = gameEngine.getCharacter;

  type LootType = 'armor' | 'weapons' | 'jewelry' | 'currency';

  interface ILevel {
    areaLevel: number;
    name: string;
    description: string;
    lootTags: LootType[];
    areaLuckDelta?: number;
  }

  const levels = ref<ILevel[]>([
    {
      areaLevel: 0,
      description: "Washed up on the shores of the ",
      name: "The first last stand",
      lootTags: ['armor', 'weapons'],
      areaLuckDelta: 0.3,
    },
    {
      areaLevel: 1,
      description: "Having survived the last stand you progress on towards tomorrow",
      name: "Beach",
      lootTags: ['armor', 'weapons']
    },
    {
      areaLevel: 2,
      description: "Having survived the last stand you progress on towards tomorrow",
      name: "Mini Boss",
      lootTags: ['currency', 'jewelry']
    },
    {
      areaLevel: 3,
      description: "Having survived the last stand you progress on towards tomorrow",
      name: "Beach3",
      lootTags: ['weapons']
    },
    {
      areaLevel: 4,
      description: "Having survived the last stand you progress on towards tomorrow",
      name: "Boss",
      lootTags: ['currency', 'jewelry']
    },
  ]);

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
      <FluidElement class="flex gap-2 justify-center flex-wrap">
        <template
          v-for="level, index in levels"
          :key="`level_button_${index}`"
        >
          <FluidElement 
            v-if="character !== -1"
            class="w-fit !p-2 !border"
            :class="[
              { '!border-neutral-600' : (level.areaLevel - character.level) < -1},
              { '!border-emerald-600' : (level.areaLevel - character.level) <= 0},
              { '!border-amber-600' : (level.areaLevel - character.level) > 0},
              { '!border-red-600' : (level.areaLevel - character.level) > 2},
            ]"
          >
            <button class="flex flex-col">
              <p>{{ level.name }}</p>
              <p class="text-sm opacity-50">
                {{ level.description }}
              </p>
              <div class="flex gap-2 mx-auto capitalize text-cyan-600">
                <p
                  v-for="tag,tIndex in level.lootTags" 
                  :key="`tags_${index}_${tIndex}`"
                >
                  {{ tag }}
                </p>
              </div>
            </button>
          </FluidElement>
        </template>
      </FluidElement>
      <FluidElement class="min-h-40 max-h-[40dvh]">
        Events Log goes here
      </FluidElement>
    </template>
    <template v-else>
      <CharacterCreation />
    </template>
  </section>
</template>
