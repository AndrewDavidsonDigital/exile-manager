<script setup lang="ts">
  import CharacterEquipment from '@/components/CharacterEquipment.vue';
  import CharacterState from '@/components/CharacterState.vue';
  import FluidElement from '@/components/FluidElement.vue';
  import WorldState from '@/components/WorldState.vue';
  import CharacterCreation from '@/components/CharacterCreation.vue';
  import LevelSelection from '@/components/LevelSelection.vue';
  import { useGameEngine } from '@/stores/game';
  import { computed, ref } from 'vue';
  import { levels, type ILevel } from '@/types/game';

  interface IEncounter {
    type: string;
    description: string;
    weight: number;
    minLevel: number;
    alignment: 'positive' | 'negative' | 'neutral';
  }

  const ENCOUNTERS: IEncounter[] = [
    {
      type: 'combat',
      description: 'A group of hostile creatures appears!',
      weight: 60,
      minLevel: 0,
      alignment: 'negative'
    },
    {
      type: 'treasure',
      description: 'You discover a hidden cache of items!',
      weight: 12,
      minLevel: 0,
      alignment: 'positive'
    },
    {
      type: 'trap',
      description: 'You trigger a hidden trap!',
      weight: 15,
      minLevel: 1,
      alignment: 'negative'
    },
    {
      type: 'corrupted',
      description: 'A corrupted being, twisted by dark forces, emerges from the shadows!',
      weight: 5,
      minLevel: 2,
      alignment: 'negative'
    },
    {
      type: 'none',
      description: 'The path ahead is quiet and uneventful...',
      weight: 25,
      minLevel: 0,
      alignment: 'neutral'
    }
  ];

  const gameEngine = useGameEngine();
  const hasCharacter = computed(() => gameEngine.getCharacter !== -1);
  const selectedLevel = ref<ILevel>();
  const isAdventuring = ref(false);

  const adventureIntervalId = ref<ReturnType<typeof setInterval> | -1>();
  const adventureInterval = ref<number>(0);
  const ADVENTURE_TICK_DELTA = 1000;

  const adventureJournal = ref<string[]>([]);
  const character = gameEngine.getCharacter;

  function startAdventuring(){
    if (selectedLevel.value){
      isAdventuring.value = true;
      const { encounterBase, encounterRangeDeltas } = selectedLevel.value;
      const minEncounters = Math.max(0, encounterBase - encounterRangeDeltas);
      const maxEncounters = encounterBase + encounterRangeDeltas;
      const encounters = Math.floor(Math.random() * (maxEncounters - minEncounters + 1)) + minEncounters;
      
      console.log(`Starting Adventure to: ${selectedLevel.value.name}`);
      console.log(`Encounters: ${encounters}`);
      adventureInterval.value = encounters;
      
      adventureJournal.value.push(`${new Date(Date.now()).toLocaleTimeString('en-AU', { hour12: false}) } You embark on your adventure at ${selectedLevel.value.name}`);
      adventureIntervalId.value = setInterval(
        () => doAdventuring(),
        ADVENTURE_TICK_DELTA,
      );
      
    }
  };

  function doAdventuring(){
    if (adventureInterval.value <= 0){
      adventureJournal.value.push(`${new Date(Date.now()).toLocaleTimeString('en-AU', { hour12: false}) } You returned from your adventure`);
      clearInterval(adventureIntervalId.value);
      adventureIntervalId.value = -1;
      isAdventuring.value = false;
      return;
    }
    if (selectedLevel.value){
      const tickResult = generateEncounter(selectedLevel.value);
      // console.log(`Encounter-tick: ${adventureInterval.value}\t${tickResult}`);
      adventureJournal.value.push(`${new Date(Date.now()).toLocaleTimeString('en-AU', { hour12: false}) } ${tickResult}`);
    }
    
    // do adventuring 
    adventureInterval.value--;
  }

  function calculateScaledExperience(baseExp: number, characterLevel: number, areaLevel: number): number {
    const levelDiff = areaLevel - characterLevel;
    // Scale experience based on level difference
    // If area is higher level, give bonus exp
    // If area is lower level, reduce exp
    const scaleFactor = Math.max(0.1, 1 + (levelDiff * 0.2));
    return Math.floor(baseExp * scaleFactor);
  }

  function generateEncounter(level: ILevel): string {
    const difficulty = gameEngine.getDifficulty;
    if (difficulty === -1) return 'Something went wrong...';

    // Filter encounters based on level requirement and adjust weights
    const availableEncounters = ENCOUNTERS
      .filter(enc => enc.minLevel <= level.areaLevel)
      .map(enc => {
        // Create a copy of the encounter to modify weights
        const adjustedEncounter = { ...enc };
        
        // Apply difficulty multipliers
        if (enc.alignment === 'negative') {
          adjustedEncounter.weight = Math.floor(enc.weight * difficulty.dangerMultiplier);
        }
        
        return adjustedEncounter;
      });
    
    // Calculate total weight of available encounters
    const totalWeight = availableEncounters.reduce((sum, enc) => sum + enc.weight, 0);
    
    // Generate random number between 0 and total weight
    const random = Math.random() * totalWeight;
    
    // Find the selected encounter based on weights
    let weightSum = 0;
    let selectedEncounter: IEncounter | null = null;
    
    for (const encounter of availableEncounters) {
      weightSum += encounter.weight;
      if (random <= weightSum) {
        selectedEncounter = encounter;
        break;
      }
    }
    
    // If no encounter was selected (shouldn't happen, but just in case)
    if (!selectedEncounter) {
      selectedEncounter = availableEncounters[0];
    }

    const character = gameEngine.getCharacter;
    if (typeof character === 'number') return 'Something went wrong...';

    switch (selectedEncounter.type) {
      case 'combat': {
        // Combat encounter - deal damage based on difficulty
        const damage = Math.floor(Math.random() * 20) * difficulty.dangerMultiplier;
        gameEngine.takeDamage(damage);
        gameEngine.addExperience(calculateScaledExperience(10, character.level, level.areaLevel));
        break;
      }
      
      case 'treasure': {
        // Treasure encounter - gain gold and experience
        const gold = Math.floor(Math.random() * 50) * difficulty.lootMultiplier;
        gameEngine.updateGold(gold);
        gameEngine.addExperience(calculateScaledExperience(15, character.level, level.areaLevel));
        break;
      }
      
      case 'trap': {
        // Trap encounter - deal damage and reduce stats
        const trapDamage = Math.floor(Math.random() * 15) * difficulty.dangerMultiplier;
        gameEngine.takeDamage(trapDamage);
        gameEngine.modifyStat('fortitude', -1);
        gameEngine.addExperience(calculateScaledExperience(5, character.level, level.areaLevel));
        break;
      }
      
      case 'corrupted': {
        // Corrupted encounter - significant damage and stat reduction
        const corruptionDamage = Math.floor(Math.random() * 30) * difficulty.dangerMultiplier;
        gameEngine.takeDamage(corruptionDamage);
        gameEngine.modifyStat('affinity', -2);
        gameEngine.modifyStat('fortitude', -2);
        gameEngine.addExperience(calculateScaledExperience(25, character.level, level.areaLevel));
        break;
      }
      
      case 'none': {
        // Rest encounter - recover some health
        gameEngine.heal(10);
        gameEngine.addExperience(calculateScaledExperience(5, character.level, level.areaLevel));
        break;
      }
    
      default:
        break;
    }
    
    return selectedEncounter.description;
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
        :is-adventuring="isAdventuring"
        @start-adventuring="() => startAdventuring()"
      />
      <FluidElement class="min-h-40 max-h-[30dvh] flex flex-col overflow-y-scroll scrollbar overflow-x-clip">
        <TransitionGroup>
          <ul
            v-for="log, index in adventureJournal.toReversed()"
            :key="`journal_${index}`"
          >
            <li>{{ log }}</li>
          </ul>
        </TransitionGroup>
      </FluidElement>
    </template>
    <template v-else>
      <CharacterCreation />
    </template>
  </section>
</template>
<style scoped>
</style>