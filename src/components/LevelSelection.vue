<script setup lang="ts">
import FluidElement from '@/components/FluidElement.vue';
import type { ILevel } from '@/lib/game';
import { computed, watch, ref } from 'vue';

interface Props {
  levels: ILevel[];
  class: string;
  toggle: number;
  characterLevel: number;
  isAdventuring: boolean;
  modelValue?: ILevel;
}

const props = defineProps<Props>();
const $emit = defineEmits<{
  'update:modelValue': [value: ILevel];
  'start-adventuring': [];
}>();

const lastUpdated = computed( () => props.toggle);
const isCollapsed = ref(false);

watch(lastUpdated, () => {
  isCollapsed.value = false;
})

function startAdventuring(){  
  $emit('start-adventuring');
  isCollapsed.value = true;
}

</script>

<template>
  <FluidElement
    class="flex gap-2 flex-col items-center"
    :class="props.class"
  >
    <div class="flex items-center gap-2 w-full mb-2">
      <button 
        class="mx-auto text-sm w-fit"
        @click="isCollapsed = !isCollapsed"
      >
        <h2>
          Select Level <span
            class="duration-300 ease-in-out transition-all"
            :class="[
              { 'rotate-90': isCollapsed }
            ]"
          > ▼ </span>
        </h2>
      </button>
    </div>
    <div 
      class="flex gap-2 justify-center flex-wrap transition-all duration-300 my-4"
      :class="{ 'max-h-0 !my-0 overflow-clip': isCollapsed, 'max-h-[1000px]': !isCollapsed }"
    >
      <template
        v-for="level, index in levels"
        :key="`level_button_${index}`"
      >
        <FluidElement 
          v-if="characterLevel !== -1"
          class="
            w-fit min-w-[15vw]
            !p-2 !border 

            transition-all duration-500
            hover:z-10
            hover:scale-125
          "
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
            @click="$emit('update:modelValue', level)"
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
        @click="startAdventuring"
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