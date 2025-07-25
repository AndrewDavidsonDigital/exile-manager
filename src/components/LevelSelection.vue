<script setup lang="ts">
  import FluidElement from '@/components/elements/FluidElement.vue';
  import { BackgroundTypes, DynamicZone, LevelType, type ILevel } from '@/lib/core';
  import { computed, watch, ref } from 'vue';
  import SwitchToggle from './elements/SwitchToggle.vue';
  import { CURRENT_TUTORIAL_LEVEL, CUSTOM_LEVELS, UNKNOWN_USES } from '@/data/levels';
  import { useOnboardingEngine } from '@/stores/onboarding';

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
    'update:modelValue': [value: ILevel | undefined];
    'start-adventuring': [];
    'trash': [value: ILevel];
  }>();

  const lastUpdated = computed( () => props.toggle);
  const isCollapsed = ref(false);
  const hideLowLevel = ref(true);

  const onboardingEngine = useOnboardingEngine();

  const sortedLevels = computed( 
    () => {
      const baseSortedLevels = props.levels.toSorted((a,b) => sortLevel(a,b));
      if (onboardingEngine.isOnboarding){
        const tutorialLevel = CUSTOM_LEVELS.get('TUTORIAL');
        if (tutorialLevel){
          return [tutorialLevel].concat(baseSortedLevels);
        }
      }
      return baseSortedLevels
    }
  );
  const lastInfinite = computed( () => sortedLevels.value.findLastIndex(level => !level.maxUses && level.areaLevel !== -1));

  const isOnboarding = computed( () => onboardingEngine.isOnboarding);
  watch(isOnboarding, () => {
    $emit('update:modelValue', undefined);
  });


  watch(lastUpdated, () => {
    isCollapsed.value = false;
  })

  function startAdventuring(): void{  
    $emit('start-adventuring');
    isCollapsed.value = true;
  }


  function resolveBackground(level: ILevel): BackgroundTypes {
    if (!level.zone){
      return BackgroundTypes.DEFAULT;
    }

    switch (level.zone) {
      case DynamicZone.CAVE:
        return BackgroundTypes.FIREFLIES
        
      case DynamicZone.ISLAND:
        return BackgroundTypes.WAVE
      
      case DynamicZone.RIFT:
        return BackgroundTypes.STARS
    
      default:
        break;
    }

    return BackgroundTypes.DEFAULT
  }

  function sortLevel(a: ILevel, b: ILevel): number{
    if (a.areaLevel === -1 ){
      return 1;
    }
    if (b.areaLevel === -1 ){
      return -1;
    }
    return a.areaLevel - b.areaLevel;
  }

</script>

<template>
  <FluidElement
    class="flex flex-col items-center scrollbar overflow-y-scroll overflow-x-clip max-h-[50dvh] md:max-h-[unset]"
    :class="props.class"
    data-onboarding-key="level-selector"
  >
    <div 
      class="
        flex items-center gap-2 
        mb-2 
        
        sticky md:relative
        w-[calc(100%_+_2.5rem)] md:w-full 
        -top-6 md:top-0 

        pl-8 py-2 md:p-0

        z-100 bg-neutral-900
      "
    >
      <button 
        class="md:mx-auto text-sm w-fit"
        @click="isCollapsed = !isCollapsed"
      >
        <h2 class="mr-auto md:mx-auto">
          Destination <span
            class="duration-300 ease-in-out transition-all inline-flex w-fit "
            :class="[
              { 'rotate-90': isCollapsed }
            ]"
          > ▼ </span>
        </h2>
      </button>
      
      <div class="content-center flex items-center gap-2 absolute top-2 md:top-0 right-4 md:right-0">
        {{ hideLowLevel ? 'Hide' : 'Show' }} Low efficiency <SwitchToggle
          v-model="hideLowLevel" 
          :label="`${ hideLowLevel ? 'Hide' : 'Show' } Low efficiency missions`"
        />
      </div>
    </div>
    <div 
      class="flex gap-2 justify-center flex-wrap transition-all duration-300 my-4"
      :class="{ 'max-h-0 !my-0 overflow-clip': isCollapsed, 'max-h-[1000px]': !isCollapsed }"
    >
      <template
        v-for="level, index in sortedLevels"
        :key="`level_button_${index}`"
      >
        <FluidElement 
          v-show="level._identifier === CURRENT_TUTORIAL_LEVEL || ( characterLevel !== -1 && !(((level.areaLevel - characterLevel) < -1) && hideLowLevel && level.areaLevel !== -1) || index === lastInfinite)"
          :data-onboarding-key="`level-selection-${index}`"
          class="
            w-fit min-w-[15vw] md:min-w-[unset]
            !p-2 !border 
            md:max-w-[250px]

            transition-all duration-500
            hover:z-100
            hover:scale-125

            group
          "
          :class="[
            { '!border-neutral-600' : level.areaLevel !== -1 && (level.areaLevel - characterLevel) < -1},
            { '!border-emerald-600' : level.areaLevel !== -1 && (level.areaLevel - characterLevel) <= 0},
            { '!border-amber-600' : level.areaLevel !== -1 && (level.areaLevel - characterLevel) > 0},
            { '!border-red-600' : level.areaLevel !== -1 && (level.areaLevel - characterLevel) > 2},
            { 'pointer-events-none' : isAdventuring },
          ]"
        >
          <div 
            class="grid-area-stack size-full"
            :class="[
              { 'wave-parent' : resolveBackground(level) === BackgroundTypes.WAVE },
              { 'firefly-parent' : resolveBackground(level) === BackgroundTypes.FIREFLIES },
              { 'star-rise-parent' : resolveBackground(level) === BackgroundTypes.STARS },
              { 'animate-pulse-fade hue-rotate-dynamic saturate-50': level.type === LevelType.INFINITE },
            ]"
            :style="
              `--dynamic-hue-rotate: ${(Math.floor(100 + Math.random() * 400)) % 360}deg;`+
                `--pulse-delay: ${(Math.random() * 3) * 500 * (Math.random() * 3) % 500}ms;`
            "
          >
            <div
              v-if="resolveBackground(level) === BackgroundTypes.WAVE"
              class="wave z-0"
              :style="`--wave-animation-delay: ${(Math.random() * 3) * 1500 * (Math.random() * 3) % 1500}ms;`"
            >
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div
              v-else-if="resolveBackground(level) === BackgroundTypes.FIREFLIES"
              class="relative"
              :style="
                `--firefly-animation-delay: ${(Math.random() * 3) * 1500 * (Math.random() * 3) % 1500}ms;` +
                  `--firefly-animation-delta: ${(Math.random() * 3) * 200 * (Math.random() * 3) % 200}ms;`
              "
            >
              <span 
                v-for="i in 15"
                :key="`firefly_${index}-${i}`"
                class="firefly"
              ></span>
            </div>
            <div
              v-else-if="resolveBackground(level) === BackgroundTypes.STARS"
              class="relative"
              :style="`--star-rise-animation-delay: ${(Math.random() * 3) * 3000 * (Math.random() * 3) % 2000}ms;`"
              :data-star-pivot="`${Math.random() > 0.5}`"
            >
              <div 
                v-for="i in 3"
                :key="`stars_${index}-${i}`"
                :class="`stars${i}`"
              ></div>
            </div>
            <button 
              v-if="!isAdventuring && level.uses !== undefined && level.uses <= 0"
              class="ml-auto mb-auto text-red-500 z-100"
              title="Somehow we've refreshed in the middle of a run and soft-locked this level"
              @click="$emit('trash', level)"
            >
              <FluidElement
                is-thin
                class="border-red-500"
              >
                Trash
              </FluidElement>
            </button>
            <button
              class="flex flex-col mx-auto z-10 items-center justify-between"
              :disabled="isAdventuring"
              aria-label="Select this level"
              @click="$emit('update:modelValue', level)"
            >
              <article class="flex flex-col w-full mx-auto items-center">
                <h4
                  v-if="level.type === LevelType.DEFAULT"
                  :data-onboarding-key="`level-selection-${index}-name`"
                >
                  {{ level.name }}
                </h4>
                <h4
                  v-else 
                  :data-onboarding-key="`level-selection-${index}-name`"
                >
                  <span
                    v-for="segment, nameInd in level.name.split(': ')"
                    :key="`naming_${index}-${nameInd}`"
                    class="transition-all"
                    :class="[
                      { 'blurred' : nameInd === 1 },
                    ]"
                    role="presentation"
                  >
                    {{ segment }}{{ nameInd === 0 ? ': ' : '' }}
                  </span>
                </h4>
                <p
                  v-if="UNKNOWN_USES.has(level._identifier)"
                  :data-onboarding-key="`level-selection-${index}-uses`"
                  class="text-amber-600 selection:!bg-amber-400/30"
                >
                  ???
                </p>
                <p
                  v-else-if="level.uses !== undefined"
                  :data-onboarding-key="`level-selection-${index}-uses`"
                  class="text-amber-600 selection:!bg-amber-400/30"
                >
                  {{ level.uses }}
                </p>
                <p
                  v-else
                  :data-onboarding-key="`level-selection-${index}-uses`"
                  class="text-amber-600/90 selection:!bg-amber-400/30"
                >
                  ထ
                </p>
                <p
                  class="text-sm opacity-70 text-emerald-400" 
                  :data-onboarding-key="`level-selection-${index}-description`"
                >
                  {{ level.description }}
                </p>
              </article>
              <article class="flex flex-col w-full mx-auto items-center">
                <div class="flex justify-between w-full">
                  <h4
                    class="text-sm opacity-70 text-emerald-400" 
                    :data-onboarding-key="`level-selection-${index}-level`"
                  >
                    lvl: {{ level.areaLevel !== -1 ? level.areaLevel : characterLevel + 2 }}
                  </h4>
                  <h4
                    class="text-sm opacity-70 text-emerald-400" 
                    :data-onboarding-key="`level-selection-${index}-encounters`"
                  >
                    ({{ level.encounterBase - level.encounterRangeDeltas }} - {{ level.encounterBase + level.encounterRangeDeltas }})
                  </h4>
                </div>
                <div
                  class="flex text-sm gap-2 mx-auto capitalize text-cyan-600 selection:!bg-cyan-400/30" 
                  :data-onboarding-key="`level-selection-${index}-loot-bias`"
                >
                  <p
                    v-for="tag,tIndex in level.lootTags" 
                    :key="`tags_${index}_${tIndex}`"
                  >
                    {{ tag }}
                  </p>
                </div>
                <template v-if="level.monsterTypes.length > 0">
                  <div 
                    v-if="level.type !== LevelType.DEFAULT"
                    class="flex text-sm gap-2 mx-auto capitalize text-red-400 blurred duration-700 transition-all selection:!bg-red-400/40"
                    :class="[
                      { 'group-hover:!blur-none ' : (level.maxUses || 0) > (level.uses || 0) },
                    ]"
                    :data-onboarding-key="`level-selection-${index}-enemies`"
                  >
                    <p
                      v-for="mob,mobIndex in level.monsterTypes" 
                      :key="`tags_${index}_${mobIndex}`"
                    >
                      {{ mob }}
                    </p>
                  </div>
                  <div 
                    v-else
                    class="flex text-sm gap-2 mx-auto capitalize text-red-400"
                    :data-onboarding-key="`level-selection-${index}-enemies`"
                  >
                    <p
                      v-for="mob,mobIndex in level.monsterTypes" 
                      :key="`tags_${index}_${mobIndex}`"
                    >
                      {{ mob }}
                    </p>
                  </div>
                </template>
                <template v-else>
                  <div 
                    class="flex text-sm gap-2 mx-auto capitalize text-red-400"
                  >
                    <p>Unknown</p>
                  </div>
                </template>
              </article>
            </button>
          </div>
        </FluidElement>
      </template>
    </div>
  </FluidElement>
  <FluidElement
    class="!hidden"
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

<style lang="css" scoped>
  @reference "@/assets/main.css";

  * {
    --pulse-delay: 0ms;
  }

  .blurred {
    filter: blur(2px);
    opacity: 0.7;
  } 

  .animate-pulse-fade {
    animation-delay: var(--pulse-delay) !important;
    animation: pulse-fade 3.5s linear infinite;
  }

  @keyframes pulse-fade {
  0%,100% {
    opacity: 1;
  }
  20% {
    opacity: 0.7;
  }
  30% {
    opacity: 0.5;
  }
  55% {
    opacity: 0.6;
  }
  60% {
    opacity: 0.75;
  }
  75%{
    opacity: 0.7;
  }
  90% {
    opacity: 0.8;
  }
}

</style>