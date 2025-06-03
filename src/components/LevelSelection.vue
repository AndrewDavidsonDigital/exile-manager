<script setup lang="ts">
import FluidElement from '@/components/FluidElement.vue';
import type { ILevel } from '@/lib/game';

interface Props {
  levels: ILevel[];
  class: string;
  characterLevel: number;
  isAdventuring: boolean;
  modelValue?: ILevel;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:modelValue': [value: ILevel];
  'start-adventuring': [];
}>();
</script>

<template>
  <FluidElement
    class="flex gap-2 flex-col items-center"
    :class="props.class"
  >
    <h2>Select Level</h2>
    <div class="flex gap-2 justify-center flex-wrap">
      <template
        v-for="level, index in levels"
        :key="`level_button_${index}`"
      >
        <FluidElement 
          v-if="characterLevel !== -1"
          class="w-fit !p-2 !border min-w-[15vw]"
          :class="[
            { '!border-neutral-600' : (level.areaLevel - characterLevel) < -1},
            { '!border-emerald-600' : (level.areaLevel - characterLevel) <= 0},
            { '!border-amber-600' : (level.areaLevel - characterLevel) > 0},
            { '!border-red-600' : (level.areaLevel - characterLevel) > 2},
            { 'pointer-events-none' : isAdventuring },
          ]"
        >
          <button
            class="flex flex-col mx-auto"
            :disabled="isAdventuring"
            @click="() => emit('update:modelValue', level)"
          >
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
    </div>
  </FluidElement>
  <FluidElement
    :class="`${props.class} mt-2`"
  >
    <div
      class="flex"
      :class="[
        { 'pointer-events-none' : isAdventuring },
      ]"
    >
      <button
        v-if="modelValue !== undefined"
        class="mx-auto"
        :disabled="isAdventuring"
        @click="emit('start-adventuring')"
      >
        Enter: <span class="italic">{{ modelValue.name }}</span>
      </button>
      <div
        v-else
        class="mx-auto"
        :disabled="isAdventuring"
      >
        Select an area to explore
      </div>
    </div>
  </FluidElement>
</template> 