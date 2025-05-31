import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useGameEngine } from './game';
import type { ILevel } from '@/types/game';
import type { IDifficulty } from '@/lib/game';

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

export const useAdventuringStore = defineStore('adventuring', () => {
  const gameEngine = useGameEngine();
  const isAdventuring = ref(false);
  const adventureIntervalId = ref<ReturnType<typeof setInterval> | -1>();
  const adventureInterval = ref<number>(0);
  const adventureJournal = ref<string[]>([]);
  const ADVENTURE_TICK_DELTA = 1000;

  function calculateScaledExperience(baseExp: number, characterLevel: number, areaLevel: number): number {
    const levelDiff = areaLevel - characterLevel;
    const scaleFactor = Math.max(0.1, 1 + (levelDiff * 0.2));
    return Math.floor(baseExp * scaleFactor);
  }

  function generateEncounter(level: ILevel): string {
    const difficulty = gameEngine.getDifficulty;
    if (difficulty === -1) return 'Something went wrong...';

    const availableEncounters = ENCOUNTERS
      .filter(enc => enc.minLevel <= level.areaLevel)
      .map(enc => {
        const adjustedEncounter = { ...enc };
        if (enc.alignment === 'negative') {
          adjustedEncounter.weight = Math.floor(enc.weight * difficulty.dangerMultiplier);
        }
        return adjustedEncounter;
      });
    
    const totalWeight = availableEncounters.reduce((sum, enc) => sum + enc.weight, 0);
    const random = Math.random() * totalWeight;
    
    let weightSum = 0;
    let selectedEncounter: IEncounter | null = null;
    
    for (const encounter of availableEncounters) {
      weightSum += encounter.weight;
      if (random <= weightSum) {
        selectedEncounter = encounter;
        break;
      }
    }
    
    if (!selectedEncounter) {
      selectedEncounter = availableEncounters[0];
    }

    const character = gameEngine.getCharacter;
    if (typeof character === 'number') return 'Something went wrong...';

    return processEncounter(selectedEncounter, character.level, level.areaLevel, difficulty);
  }

  function processEncounter(encounter: IEncounter, charLevel: number, areaLevel: number, difficulty: IDifficulty){
    switch (encounter.type) {
      case 'combat': {
        const damage = Math.floor(Math.random() * 20) * difficulty.dangerMultiplier;
        gameEngine.takeDamage(damage);
        gameEngine.addExperience(calculateScaledExperience(10, charLevel, areaLevel));
        gameEngine.addLoot(Math.floor(Math.random() * 2)); // 50%  chance of loot
        break;
      }
      
      case 'treasure': {
        const gold = Math.floor(Math.random() * 50) * difficulty.lootMultiplier;
        gameEngine.updateGold(gold);
        gameEngine.addExperience(calculateScaledExperience(15, charLevel, areaLevel));
        gameEngine.addLoot(Math.floor(Math.random() * 5)); // 20%  chance of 0 loot
        break;
      }
      
      case 'trap': {
        const trapDamage = Math.floor(Math.random() * 15) * difficulty.dangerMultiplier;
        gameEngine.takeDamage(trapDamage);
        // gameEngine.modifyStat('fortitude', -1);
        gameEngine.addExperience(calculateScaledExperience(5, charLevel, areaLevel));
        break;
      }
      
      case 'corrupted': {
        const corruptionDamage = Math.floor(Math.random() * 30) * difficulty.dangerMultiplier;
        gameEngine.takeDamage(corruptionDamage);
        // gameEngine.modifyStat('affinity', -2);
        // gameEngine.modifyStat('fortitude', -2);
        gameEngine.addExperience(calculateScaledExperience(25, charLevel, areaLevel));
        break;
      }
      
      case 'none': {
        gameEngine.heal(10);
        gameEngine.addExperience(calculateScaledExperience(5, charLevel, areaLevel));
        break;
      }
    }
    
    return encounter.description;
  }

  function startAdventuring(selectedLevel: ILevel) {
    isAdventuring.value = true;
    const { encounterBase, encounterRangeDeltas } = selectedLevel;
    const minEncounters = Math.max(0, encounterBase - encounterRangeDeltas);
    const maxEncounters = encounterBase + encounterRangeDeltas;
    const encounters = Math.floor(Math.random() * (maxEncounters - minEncounters + 1)) + minEncounters;
    
    console.log(`Starting Adventure to: ${selectedLevel.name}`);
    console.log(`Encounters: ${encounters}`);
    adventureInterval.value = encounters;
    
    adventureJournal.value.push(`${new Date(Date.now()).toLocaleTimeString('en-AU', { hour12: false}) } You embark on your adventure at ${selectedLevel.name}`);
    adventureIntervalId.value = setInterval(
      () => doAdventuring(selectedLevel),
      ADVENTURE_TICK_DELTA,
    );
  }

  function doAdventuring(selectedLevel: ILevel) {
    if (adventureInterval.value <= 0) {
      adventureJournal.value.push(`${new Date(Date.now()).toLocaleTimeString('en-AU', { hour12: false}) } You returned from your adventure`);
      clearInterval(adventureIntervalId.value);
      adventureIntervalId.value = -1;
      isAdventuring.value = false;
      return;
    }

    const tickResult = generateEncounter(selectedLevel);
    adventureJournal.value.push(`${new Date(Date.now()).toLocaleTimeString('en-AU', { hour12: false}) } ${tickResult}`);
    adventureInterval.value--;
  }

  return {
    isAdventuring,
    adventureJournal,
    startAdventuring,
    doAdventuring
  };
}); 