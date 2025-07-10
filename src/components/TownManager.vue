<script setup lang="ts">
  import { AudioKey, EVENT_AUDIO_KEY, smearWordIntoId, TownUnlockable, type EventWithAudio } from '@/lib/core';
  import { computed, ref } from 'vue';
  import FluidElement from './elements/FluidElement.vue';
  import { useWorldEngine } from '@/stores/world';
  import ModalDialog from './elements/ModalDialog.vue';
  import { useGameEngine } from '@/stores/game';
  import { ErrorNumber } from '@/lib/typescript';
  import { trace } from '@/lib/logging';
  import SmithyConfigurations from './town/SmithyConfigurations.vue';
  import ArcanumConfigurations from './town/ArcanumConfigurations.vue';
  import { useInteractionEngine } from '@/stores/audio';
  import { chooseRandom } from '@/lib/array';

  import scrollTrack1 from '@/assets/audio/sfx/scroll_1.m4a';
  import scrollTrack2 from '@/assets/audio/sfx/scroll_2.m4a';
  import scrollTrack3 from '@/assets/audio/sfx/scroll_3.m4a';

  import smithTrack1 from '@/assets/audio/sfx/smith_1.m4a';
  import smithTrack2 from '@/assets/audio/sfx/smith_2.m4a';
  import smithTrack3 from '@/assets/audio/sfx/smith_3.m4a';
import CloseButton from './elements/CloseButton.vue';

  const LOGGING_PREFIX = '🏠 Town:\t';
  function logger(message: string) {
    trace(`${LOGGING_PREFIX}${message}`);
  }

  const UNLOCK_FEATURE_MODAL_ID = `_locked_feature_Modal_${Date.now()}`;
  const INTERACT_FEATURE_MODAL_ID = `_interact_feature_Modal_${Date.now()}`;

  const worldEngine = useWorldEngine();
  const gameEngine = useGameEngine();
  const interactionEngine = useInteractionEngine();
  const showFeatureUnlockModal = ref<boolean>(false);
  const showFeatureInteractModal = ref<boolean>(false);
  const selectedFeature = ref<ITownFeature | undefined>(undefined);
  const restoreIntervalCount = ref<number>(-1);
  const restoreIntervalId = ref<number>(-1);

  const char = computed(() => gameEngine.getCharacter !== ErrorNumber.NOT_FOUND ? gameEngine.character : undefined)

  interface ITownFeature {
    isRuined: boolean;
    name: string;
    smearedName: string;
    binding: TownUnlockable;
    interaction: () => any;
    description: {
      ruin: string;
      repaired: string;
    },
    repairs: {
      cost: number;
      minLevel: number;
      runs: number;
    }
  }

  
  const scrollTracks = [
    scrollTrack1,
    scrollTrack2,
    scrollTrack3,
  ];
  const smithTracks = [
    smithTrack1,
    smithTrack2,
    smithTrack3,
  ];

  const shopsBase = ref<ITownFeature[]>([
    {
      isRuined: true,
      name: 'Smithy',
      smearedName: smearWordIntoId('Smithy'),
      binding: TownUnlockable.SMITH,
      interaction: () => {},
      description: {
        ruin: 'Charred stones and rusted tools hint at a forge long forgotten.',
        repaired: 'Embers flicker in the back of the forge.',
      },
      repairs: {
        cost: 2000,
        minLevel: 5,
        runs: 3,
      }
    },
    {
      isRuined: true,
      name: 'Arcanum',
      smearedName: smearWordIntoId('Arcanum'),
      binding: TownUnlockable.ARCANUM,
      interaction: () => {},
      description: {
        ruin: 'Dusty tomes and shattered crystals litter the floor, the air thick with the memory of lost incantations.',
        repaired: 'Shelves and artifices, once forgotten, now quiver as they await there use.',
      },
      repairs: {
        cost: 5000,
        minLevel: 7,
        runs: 2,
      }
    },
  ]);

  const shops = computed(() => {
    return shopsBase.value.map(shop => {
      shop.isRuined = !worldEngine.isTownFeatureUnlocked(shop.binding)
      return shop;
    });
  });


  function featureClick(feature: ITownFeature, event: MouseEvent): void{
    selectedFeature.value = feature;

    const isUnlocked = worldEngine.isTownFeatureUnlocked(feature.binding);
    if (isUnlocked){
      showFeatureInteractModal.value = true;
    }else{
      showFeatureUnlockModal.value = true;
    }

    switch (feature.binding) {
      case TownUnlockable.SMITH:
        (event as EventWithAudio)[EVENT_AUDIO_KEY] = AudioKey.SMITH;
        break;

      case TownUnlockable.ARCANUM:
        (event as EventWithAudio)[EVENT_AUDIO_KEY] = AudioKey.SCROLL;
        break;
    
      default:
        break;
    }
  }

  function attemptRestore(feature: ITownFeature): void{
    if (!feature.isRuined) return;

    showFeatureUnlockModal.value = false;

    if (char.value && char.value.gold >  feature.repairs.cost && char.value.level > feature.repairs.minLevel){
      // actually attempt repairs.

      gameEngine.updateGold(feature.repairs.cost, false);
      
      gameEngine.incrementRuns(feature.repairs.runs);

      restoreIntervalCount.value = feature.repairs.runs;

      restoreIntervalId.value = setInterval(
        () => {
          if(restoreIntervalCount.value <= 0){
            logger(`Repairs finished`);
            clearInterval(restoreIntervalId.value);
            worldEngine.unlockTownFeature(feature.binding);
            restoreIntervalId.value = -1;
            restoreIntervalCount.value = -1;
          }else{
            logger(`Repairs started: [${feature.repairs.runs - restoreIntervalCount.value + 1}/${feature.repairs.runs}]`);
            restoreIntervalCount.value--;
          }
        }, 
        500,
      ) as unknown as number;

    }
  }

  function closeInteractModal(event?: MouseEvent | Event): void{
    showFeatureInteractModal.value = false;
    switch (selectedFeature.value?.binding) {
      case TownUnlockable.SMITH:
        if (event){
          (event as EventWithAudio)[EVENT_AUDIO_KEY] = AudioKey.SMITH;
        } else {
          interactionEngine.setTrack(chooseRandom(smithTracks, smithTrack1), true);
        }
        break;

      case TownUnlockable.ARCANUM:
        if (event){
          (event as EventWithAudio)[EVENT_AUDIO_KEY] = AudioKey.SCROLL;
        } else {
          interactionEngine.setTrack(chooseRandom(scrollTracks, scrollTrack1), true);
        }
        break;
    
      default:
        break;
    }
    selectedFeature.value = undefined; 
    worldEngine.saveState();
  }

  function closeUnlockModal(event?: MouseEvent | Event): void{
    showFeatureUnlockModal.value = false;
    switch (selectedFeature.value?.binding) {
      case TownUnlockable.SMITH:
        if (event){
          (event as EventWithAudio)[EVENT_AUDIO_KEY] = AudioKey.SMITH;
        } else {
          interactionEngine.setTrack(chooseRandom(smithTracks, smithTrack1), true);
        }
        break;

      case TownUnlockable.ARCANUM:
        if (event){
          (event as EventWithAudio)[EVENT_AUDIO_KEY] = AudioKey.SCROLL;
        } else {
          interactionEngine.setTrack(chooseRandom(scrollTracks, scrollTrack1), true);
        }
        break;
    
      default:
        break;
    }

    selectedFeature.value = undefined;
  }

</script>

<template>
  <div class="flex flex-col md:flex-row gap-4 h-full justify-around">
    <button
      v-for="shop,index in shops"
      :key="`shop_${index}`"
      :class="[
        { 'pointer-events-none' : !(worldEngine.isTownFeatureKnown(shop.binding))}
      ]"
      @click="e => featureClick(shop, e)"
    >
      <FluidElement
        is-thin
      >
        {{ shop.isRuined ? 'Ruin:': '' }}
        <span
          :class="[
            { 'blur-[2px] text-emerald-500/50': !(worldEngine.isTownFeatureKnown(shop.binding)) },
            { 'blur-[1px]': (worldEngine.isTownFeatureKnown(shop.binding) && !(worldEngine.isTownFeatureUnlocked(shop.binding))) },
          ]"
        >{{ shop.isRuined ? shop.smearedName : shop.name }}</span>
      </FluidElement>
    </button>
  </div>

  <ModalDialog
    :id="UNLOCK_FEATURE_MODAL_ID"
    :show="showFeatureUnlockModal"
    class="!p-[3%] md:!px-10 md:!pb-10 md:!pt-4 min-h-1/3 md:min-h-[unset] min-w-2/3 md:min-w-[unset]"
    @close="closeUnlockModal"
  >
    <section
      v-if="selectedFeature"
      class="text-emerald-400 mx-auto"
    >
      <div>
        <h3 class="text-xl font-bold mb-4 w-fit mx-auto">
          Ruins: {{ selectedFeature.smearedName }}
        </h3>
        <CloseButton @click="e => closeUnlockModal(e)" />
      </div>
      <div>
        {{ selectedFeature.description.ruin }}
      </div>
      <div
        v-if="char && char.level > selectedFeature.repairs.minLevel && char.gold > selectedFeature.repairs.cost"
        class="flex flex-col"
      >
        You feel that you are skilled enough to restore this building, but at the cost of {{ selectedFeature.repairs.cost }} gold
        <button
          class="w-fit"
          @click="attemptRestore(selectedFeature)"
        >
          <FluidElement is-thin>
            Restore
          </FluidElement>
        </button>
      </div>
      <div v-else-if="char && char.level < selectedFeature.repairs.minLevel">
        You don't feel that you would skilled enough to repair this building.
      </div>
      <div v-else-if="char && char.gold < selectedFeature.repairs.cost">
        You would not be able to afford the required repair materials.
      </div>
      <div v-else>
        You are unsure about what to do with this ruin.
      </div>
    </section>
  </ModalDialog>

  <ModalDialog
    :id="INTERACT_FEATURE_MODAL_ID"
    :show="showFeatureInteractModal"
    class="!p-[3%] md:!px-10 md:!pb-10 md:!pt-4 min-h-1/3 md:min-h-[unset] min-w-2/3 md:min-w-[unset]"
    @close="closeInteractModal"
  >
    <section
      v-if="selectedFeature"
      class="text-emerald-400 mx-auto flex flex-col gap-y-2"
    >
      <div>
        <h3 class="text-xl font-bold w-fit mx-auto">
          {{ selectedFeature.name }}
        </h3>
        <CloseButton @click="e => closeInteractModal(e)" />
      </div>
      <div>
        {{ selectedFeature.description.repaired }}
      </div>
      <h3 class="mx-auto w-fit">
        Configurations:
      </h3>
      <template v-if="selectedFeature.binding === TownUnlockable.SMITH">
        <SmithyConfigurations />
      </template>
      <template v-else-if="selectedFeature.binding === TownUnlockable.ARCANUM">
        <ArcanumConfigurations />
      </template>
    </section>
  </ModalDialog>
</template>

<style scoped>
  @reference "@/assets/main.css";
</style> 