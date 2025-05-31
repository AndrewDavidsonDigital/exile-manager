import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useGameEngine } from './game';
import type { IDifficulty, IJournalEntry, ILevel, JournalEntryType, MonsterType, IMonsterDamage } from '@/lib/game';
import { MONSTER_DAMAGE_TYPES } from '@/lib/game';

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
  const adventureJournal = ref<IJournalEntry[]>([]);
  const ADVENTURE_TICK_DELTA = 1000;


  function calculateScaledExperience(baseExp: number, characterLevel: number, areaLevel: number): number {
    const levelDiff = areaLevel - characterLevel;
    const scaleFactor = Math.max(0.1, 1 + (levelDiff * 0.2));
    return Math.floor(baseExp * scaleFactor);
  }

  function generateEncounter(level: ILevel): { encounter: string, encounterType: JournalEntryType, encounterIcon: string } {
    const difficulty = gameEngine.getDifficulty;
    if (difficulty === -1) return {encounter: 'Something went wrong...', encounterType: 'Danger', encounterIcon: '' };

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
    if (typeof character === 'number') return {encounter: 'Something went wrong...', encounterType: 'Danger', encounterIcon: ''};

    return processEncounter(selectedEncounter, character.level, level, difficulty);
  }

  function processEncounter(
    encounter: IEncounter, 
    charLevel: number, 
    level: ILevel, 
    difficulty: IDifficulty
  ): { encounter: string, encounterType: JournalEntryType, encounterIcon: string} {
    let encounterType: JournalEntryType = 'Safe';
    let encounterIcon: string = '';
    const areaLevel = level.areaLevel;

    type MobTierType = ['basic', 1.0] | ['elite', 2.5] | ['boss', 5];
    interface ISimMonster {
      type: MonsterType,
      health: number,
      experience: number,
      damageInfo: IMonsterDamage
    }

    switch (encounter.type) {
      case 'combat': {
        const encounteredMonster = level.monsterTypes[Math.floor(Math.random() * level.monsterTypes.length)];
        const mobTier: MobTierType = ['basic', 1.0];
        const char = gameEngine.getCharacter;
        const exileStats = gameEngine.getCombatStats;

        if (char === -1 || exileStats === -1) break;

        const monsterDamageInfo = MONSTER_DAMAGE_TYPES[encounteredMonster];
        const simMonster: ISimMonster = {
          type: encounteredMonster,
          health: 10 * areaLevel * mobTier[1],
          experience: 1 * areaLevel * mobTier[1],
          damageInfo: monsterDamageInfo
        }

        // Calculate monster's attack damage based on area level, tier, and damage type
        const baseMonsterDamage = Math.floor((5 + Math.random() * 10) * areaLevel * mobTier[1] * difficulty.dangerMultiplier);
        const monsterDamage = Math.floor(baseMonsterDamage * monsterDamageInfo.damageMultiplier);
        
        // Calculate exile's attack damage based on combat stats
        const exileDamage = Math.floor(exileStats.damagePerTick * (0.8 + Math.random() * 0.4)); // 80-120% of base damage
        
        // Apply damage to exile, considering specific damage type mitigation
        let mitigatedDamage = 0;
        let damageTypeDesc = '';
        
        // First check for evasion (complete damage negation)
        const evasionMitigation = exileStats.mitigation.find(m => m.key === 'evasion')?.value || 0;
        const evasionRoll = Math.random() * 100;
        const evaded = evasionRoll < evasionMitigation;
        
        if (!evaded) {
          if (monsterDamageInfo.secondary && monsterDamageInfo.damageSplit) {
            // Split damage between primary and secondary types
            const primaryDamage = Math.floor(monsterDamage * (monsterDamageInfo.damageSplit / 100));
            const secondaryDamage = monsterDamage - primaryDamage;
            
            // Check for block (80% damage reduction)
            const blockMitigation = exileStats.mitigation.find(m => m.key === 'block')?.value || 0;
            const blockRoll = Math.random() * 100;
            const blocked = blockRoll < blockMitigation;
            
            // Get percentage-based mitigations
            const primaryMitigation = exileStats.mitigation.find(m => m.key === monsterDamageInfo.primary)?.value || 0;
            const secondaryMitigation = exileStats.mitigation.find(m => m.key === monsterDamageInfo.secondary)?.value || 0;
            
            // Apply block if successful
            const blockMultiplier = blocked ? 0.2 : 1.0; // 80% reduction if blocked
            
            // Calculate final damage with all mitigations
            const mitigatedPrimaryDamage = Math.max(1, Math.floor(primaryDamage * blockMultiplier * (1 - (primaryMitigation / 100))));
            const mitigatedSecondaryDamage = Math.max(1, Math.floor(secondaryDamage * blockMultiplier * (1 - (secondaryMitigation / 100))));
            
            mitigatedDamage = mitigatedPrimaryDamage + mitigatedSecondaryDamage;
            
            // Update damage description with all mitigation info
            const blockText = blocked ? ' (80% blocked)' : '';
            damageTypeDesc = `attacks with ${monsterDamageInfo.primary} (${primaryDamage}, ${primaryMitigation}% mitigated) and ${monsterDamageInfo.secondary} (${secondaryDamage}, ${secondaryMitigation}% mitigated)${blockText}`;
          } else {
            // Single damage type
            const primaryMitigation = exileStats.mitigation.find(m => m.key === monsterDamageInfo.primary)?.value || 0;
            
            // Check for block (80% damage reduction)
            const blockMitigation = exileStats.mitigation.find(m => m.key === 'block')?.value || 0;
            const blockRoll = Math.random() * 100;
            const blocked = blockRoll < blockMitigation;
            
            // Apply block if successful
            const blockMultiplier = blocked ? 0.2 : 1.0; // 80% reduction if blocked
            
            mitigatedDamage = Math.max(1, Math.floor(monsterDamage * blockMultiplier * (1 - (primaryMitigation / 100))));
            
            // Update damage description with all mitigation info
            const blockText = blocked ? ' (80% blocked)' : '';
            damageTypeDesc = `attacks with ${monsterDamageInfo.primary} (${monsterDamage}, ${primaryMitigation}% mitigated)${blockText}`;
          }
        } else {
          mitigatedDamage = 0;
          damageTypeDesc = 'attacks but misses (evaded)';
        }
        
        gameEngine.takeDamage(mitigatedDamage);

        // Reduce monster health
        simMonster.health -= exileDamage;
        
        // Add experience and loot if monster is defeated
        if (simMonster.health <= 0) {
          gameEngine.addExperience(calculateScaledExperience(simMonster.experience, charLevel, areaLevel));
          gameEngine.addLoot(Math.floor(Math.random() * 2)); // 50% chance of loot
        }

        encounterType = 'Danger';
        encounterIcon = '⚔️';
        encounter.description = `A ${encounteredMonster} appears and ${damageTypeDesc}!\n\tYou deal ${exileDamage} damage and take ${mitigatedDamage} damage.`;
        break;
      }
      
      case 'treasure': {
        const gold = Math.floor(Math.random() * 50) * difficulty.lootMultiplier;
        gameEngine.updateGold(gold);
        gameEngine.addExperience(calculateScaledExperience(5, charLevel, areaLevel));
        gameEngine.addLoot(Math.floor(Math.random() * 5)); // 20% chance of 0 loot

        encounterType = 'Treasure';
        encounterIcon = '🪙';
        break;
      }
      
      case 'trap': {
        const trapDamage = Math.floor(Math.random() * 15) * difficulty.dangerMultiplier;
        gameEngine.takeDamage(trapDamage);
        // gameEngine.modifyStat('fortitude', -1);
        gameEngine.addExperience(calculateScaledExperience(2, charLevel, areaLevel));
        
        encounterType = 'Danger';
        encounterIcon = '🏹';
        break;
      }
      
      case 'corrupted': {
        const corruptionDamage = Math.floor(Math.random() * 30) * difficulty.dangerMultiplier;
        gameEngine.takeDamage(corruptionDamage);
        // gameEngine.modifyStat('affinity', -2);
        // gameEngine.modifyStat('fortitude', -2);
        gameEngine.addExperience(calculateScaledExperience(25, charLevel, areaLevel));

        encounterType = 'Danger';
        encounterIcon = '🌋';
        break;
      }
      
      case 'none': {
        gameEngine.heal(10);
        gameEngine.addExperience(calculateScaledExperience(1, charLevel, areaLevel));
        
        encounterType = 'Generic';
        encounterIcon = '🔎';
        break;
      }
    }
    
    return { encounter: encounter.description, encounterType: encounterType, encounterIcon: encounterIcon };
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
    
    const entry: IJournalEntry = {
      message: `[${new Date(Date.now()).toLocaleTimeString('en-AU', { hour12: false}) }] 🤺 You embark on your adventure at ${selectedLevel.name}`,
      type: 'Safe',
    }
    adventureJournal.value.push(entry);
    adventureIntervalId.value = setInterval(
      () => doAdventuring(selectedLevel),
      ADVENTURE_TICK_DELTA,
    );
  }

  function doAdventuring(selectedLevel: ILevel) {
    if (adventureInterval.value <= 0) {
    
      const entry: IJournalEntry = {
        message: `[${new Date(Date.now()).toLocaleTimeString('en-AU', { hour12: false}) }] 🏘️ You returned from your adventure`,
        type: 'Safe',
      }
      adventureJournal.value.push(entry);
      clearInterval(adventureIntervalId.value);
      adventureIntervalId.value = -1;
      isAdventuring.value = false;
      return;
    }

    const tickResult = generateEncounter(selectedLevel);
    
    const entry: IJournalEntry = {
      message: `[${new Date(Date.now()).toLocaleTimeString('en-AU', { hour12: false}) }] ${tickResult.encounterIcon} ${tickResult.encounter}`,
      type: tickResult.encounterType,
    }
    adventureJournal.value.push(entry);
    adventureInterval.value--;

    // Check if character is dead
    if (gameEngine.isDead) {
    
      const entry: IJournalEntry = {
        message: `[${new Date(Date.now()).toLocaleTimeString('en-AU', { hour12: false}) }] 💀 You have fallen in battle!`,
        type: 'Danger',
      }
      adventureJournal.value.push(entry);
      clearInterval(adventureIntervalId.value);
      adventureIntervalId.value = -1;
      isAdventuring.value = false;
      return;
    }
  }

  function reset() {
    adventureInterval.value = 0;
    adventureIntervalId.value = -1;
    adventureJournal.value = [];
  }

  return {
    reset,
    isAdventuring,
    adventureJournal,
    startAdventuring,
    doAdventuring
  };
}); 