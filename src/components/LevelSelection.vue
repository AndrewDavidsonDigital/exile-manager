<script setup lang="ts">
import FluidElement from '@/components/FluidElement.vue';
import type { ILevel } from '@/types/game';

interface Props {
  levels: ILevel[];
  characterLevel: number;
  isAdventuring: boolean;
  modelValue?: ILevel;
}

defineProps<Props>();
const emit = defineEmits<{
  'update:modelValue': [value: ILevel];
  'start-adventuring': [];
}>();
</script>

<template>
  <FluidElement class="flex gap-2 justify-center flex-wrap">
    <template
      v-for="level, index in levels"
      :key="`level_button_${index}`"
    >
      <FluidElement 
        v-if="characterLevel !== -1"
        class="w-fit !p-2 !border"
        :class="[
          { '!border-neutral-600' : (level.areaLevel - characterLevel) < -1},
          { '!border-emerald-600' : (level.areaLevel - characterLevel) <= 0},
          { '!border-amber-600' : (level.areaLevel - characterLevel) > 0},
          { '!border-red-600' : (level.areaLevel - characterLevel) > 2},
          { 'pointer-events-none' : isAdventuring },
        ]"
      >
        <button
          class="flex flex-col"
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
  </FluidElement>
  <FluidElement v-if="modelValue !== undefined">
    <div
      class="flex"
      :class="[
        { 'pointer-events-none' : isAdventuring },
      ]"
    >
      <button
        class="mx-auto"
        :disabled="isAdventuring"
        @click="emit('start-adventuring')"
      >
        Enter: <span class="italic">{{ modelValue.name }}</span>
      </button>
    </div>
  </FluidElement>
</template> 