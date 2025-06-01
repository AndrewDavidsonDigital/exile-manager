import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useGameEngine } from './game';
import type { 
  IDifficulty, 
  IJournalEntry, 
  ILevel, 
  JournalEntryType, 
  MonsterType, 
  IMonsterDamage,
  ICharacter,
  ICombatStat,
  IMitigation
} from '@/lib/game';
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

  type MobTierType = ['basic', 1.0] | ['elite', 2.5] | ['boss', 5];
  interface ISimMonster {
    type: MonsterType,
    health: number,
    experience: number,
    damageInfo: IMonsterDamage
  }

  interface ICombatResult {
    exileHealth: number;
    monsterHealth: number;
    combatLog: string[];
    combatOutcome: string;
    totalDamageDealt: number;
    totalDamageReceived: number;
    usedMitigations: Set<string>;
    lootLossPercent: number | undefined;
  }

  function simulateCombat(
    char: ICharacter,
    exileStats: ICombatStat,
    simMonster: ISimMonster,
    areaLevel: number,
    difficulty: IDifficulty,
    mobTier: MobTierType
  ): ICombatResult {
    let exileHealth = exileStats.health;
    let monsterHealth = simMonster.health;
    let round = 1;
    let combatLog: string[] = [];
    let combatOutcome = '';
    let totalDamageDealt = 0;
    let totalDamageReceived = 0;
    let usedMitigations = new Set<string>();
    let lootLossPercent: number | undefined = undefined;

    let shouldBail = false;

    // Simulate combat rounds until someone dies
    while (exileHealth > 0 && monsterHealth > 0 && !shouldBail) {
      // Check if exile is about to die (less than 20% health)
      if (exileHealth <= exileStats.health * 0.2 && Math.random() < 0.3) { // 30% chance to escape when below 20% health
        // Calculate loot loss (30-50% of current loot)
        lootLossPercent = Math.floor(30 + Math.random() * 20);

        // Set health to 1 and stop adventuring
        exileHealth = 1;
        combatLog.push(
          `\nYou narrowly escape with your life, losing ${lootLossPercent}% of your loot in the process!\n` +
          `Returning to town with 1 HP...`
        );

        // need to fully exist here.
        shouldBail = true;
        break;
      }

      if (!shouldBail) {  // Monster's turn
        const baseMonsterDamage = Math.floor((5 + Math.random() * 10) * areaLevel * mobTier[1] * difficulty.dangerMultiplier);
        const monsterDamage = Math.floor(baseMonsterDamage * simMonster.damageInfo.damageMultiplier);
        // console.log('Combat Debug - Monster Damage:', { baseMonsterDamage, monsterDamage, areaLevel, mobTier, difficulty });
        
        // Calculate exile's attack damage based on combat stats
        const exileDamage = Math.floor(exileStats.damagePerTick * (0.9 + Math.random() * 0.2));
        // console.log('Combat Debug - Exile Damage:', { exileDamage, damagePerTick: exileStats.damagePerTick });
        
        // Apply damage to exile, considering specific damage type mitigation
        let mitigatedDamage = 0;
        let damageTypeDesc = '';
        
        // First check for evasion (complete damage negation)
        const evasionMitigation = exileStats.mitigation.find(m => m.key === 'evasion')?.value || 0;
        const evasionRoll = Math.random() * 100;
        const evaded = evasionRoll < evasionMitigation;
        // console.log('Combat Debug - Evasion Check:', { evasionMitigation, evasionRoll, evaded });
        
        
        if (!evaded) {
          if (simMonster.damageInfo.secondary && simMonster.damageInfo.damageSplit) {
            // Split damage between primary and secondary types
            const primaryDamage = Math.floor(monsterDamage * (simMonster.damageInfo.damageSplit / 100));
            const secondaryDamage = monsterDamage - primaryDamage;
            // console.log('Combat Debug - Split Damage:', { primaryDamage, secondaryDamage, damageSplit: simMonster.damageInfo.damageSplit });
            
            // Check for block (80% damage reduction)
            const blockMitigation = exileStats.mitigation.find(m => m.key === 'block')?.value || 0;
            const blockRoll = Math.random() * 100;
            const blocked = blockRoll < blockMitigation;
            // console.log('Combat Debug - Block Check:', { blockMitigation, blockRoll, blocked });
            
            if (blocked) {
              usedMitigations.add('block');
            }
            
            // Get percentage-based mitigations
            const primaryMitigation = exileStats.mitigation.find((m: IMitigation) => m.key === simMonster.damageInfo.primary)?.value || 0;
            const secondaryMitigation = exileStats.mitigation.find((m: IMitigation) => m.key === simMonster.damageInfo.secondary)?.value || 0;
            // console.log('Combat Debug - Mitigations:', { primaryMitigation, secondaryMitigation });
            
            if (primaryMitigation > 0) {
              usedMitigations.add(simMonster.damageInfo.primary);
            }
            if (secondaryMitigation > 0) {
              usedMitigations.add(simMonster.damageInfo.secondary);
            }
            
            // Apply block if successful
            const blockMultiplier = blocked ? 0.2 : 1.0; // 80% reduction if blocked
            
            // Calculate final damage with all mitigations
            const mitigatedPrimaryDamage = Math.max(1, Math.floor(primaryDamage * blockMultiplier * (1 - (primaryMitigation / 100))));
            const mitigatedSecondaryDamage = Math.max(1, Math.floor(secondaryDamage * blockMultiplier * (1 - (secondaryMitigation / 100))));
            // console.log('Combat Debug - Final Mitigated Damage:', { mitigatedPrimaryDamage, mitigatedSecondaryDamage });
            
            mitigatedDamage = mitigatedPrimaryDamage + mitigatedSecondaryDamage;
            
            // Update damage description with all mitigation info
            const blockText = blocked ? ' (80% blocked)' : '';
            damageTypeDesc = `attacks with ${simMonster.damageInfo.primary} (${primaryDamage}, ${primaryMitigation}% mitigated) and ${simMonster.damageInfo.secondary} (${secondaryDamage}, ${secondaryMitigation}% mitigated)${blockText}`;
          } else {
            // Single damage type
            const primaryMitigation = exileStats.mitigation.find((m: IMitigation) => m.key === simMonster.damageInfo.primary)?.value || 0;
            // console.log('Combat Debug - Single Damage Type:', { primaryMitigation, monsterDamage });
            
            if (primaryMitigation > 0) {
              usedMitigations.add(simMonster.damageInfo.primary);
            }
            
            // Check for block (80% damage reduction)
            const blockMitigation = exileStats.mitigation.find(m => m.key === 'block')?.value || 0;
            const blockRoll = Math.random() * 100;
            const blocked = blockRoll < blockMitigation;
            // console.log('Combat Debug - Block Check:', { blockMitigation, blockRoll, blocked });
            
            if (blocked) {
              usedMitigations.add('block');
            }
            
            // Apply block if successful
            const blockMultiplier = blocked ? 0.2 : 1.0; // 80% reduction if blocked
            
            // Calculate final damage with all mitigations
            mitigatedDamage = Math.max(1, Math.floor(monsterDamage * blockMultiplier * (1 - (primaryMitigation / 100))));
            // console.log('Combat Debug - Final Mitigated Damage:', { mitigatedDamage });
            
            // Update damage description with all mitigation info
            const blockText = blocked ? ' (80% blocked)' : '';
            damageTypeDesc = `attacks with ${simMonster.damageInfo.primary} (${monsterDamage}, ${primaryMitigation}% mitigated)${blockText}`;
          }
        } else {
          usedMitigations.add('evasion');
          mitigatedDamage = 0;
          damageTypeDesc = 'attacks but misses (evaded)';
        }

        // Apply damage to exile
        exileHealth -= mitigatedDamage;
        totalDamageReceived += mitigatedDamage;
        // console.log('Combat Debug - Damage Applied:', { exileHealth, totalDamageReceived });
        
        // Check if exile is defeated after taking damage
        if (exileHealth <= 0) {
          // Check for miraculous escape based on fortune
          const fortune = char.stats.fortune;
          const baseEscapeChance = 1; // 1% base chance
          const fortuneBonus = Math.min(4, Math.floor(fortune / 10)); // +1% per 10 fortune, max +4%
          const totalEscapeChance = baseEscapeChance + fortuneBonus;
          
          if (Math.random() * 100 < totalEscapeChance) {
            // Miraculous escape!
            exileHealth = 1;
            const lootLossPercent = Math.floor(50 + Math.random() * 30); // 50-80% loot loss for near-death escape
            const lootToLose = Math.floor(char.loot.length * (lootLossPercent / 100));
            
            if (lootToLose > 0) {
              char.loot.splice(-lootToLose);
            }
            
            combatLog.push(
              `Round ${round}:\n` +
              `\tMonster ${damageTypeDesc}!\n` +
              `\tYou deal ${exileDamage} damage and take ${mitigatedDamage} damage.\n` +
              `\tMonster Health: ${Math.max(0, monsterHealth)} | Your Health: 1\n\n` +
              `Miraculous Escape! Your fortune (${fortune}) saved you from certain death!\n` +
              `You lose ${lootLossPercent}% of your loot in your desperate escape...`
            );
            break;
          } else {

            // No escape, defeat occurs
            exileHealth = 0;
            combatLog.push(
              `Round ${round}:\n` +
              `\tMonster ${damageTypeDesc}!\n` +
              `\tYou deal ${exileDamage} damage and take ${mitigatedDamage} damage.\n` +
              `\tMonster Health: ${Math.max(0, monsterHealth)} | Your Health: 0\n\n` +
              `Defeat! The ${simMonster.type} has bested you!`
            );
            break;
          }
        }
        
        // Exile's turn
        monsterHealth -= exileDamage;
        totalDamageDealt += exileDamage;
        // console.log('Combat Debug - Monster Damage Applied:', { monsterHealth, totalDamageDealt });

        // Log the round
        combatLog.push(
          `Round ${round}:\n` +
          `\tMonster ${damageTypeDesc}!\n` +
          `\tYou deal ${exileDamage} damage and take ${mitigatedDamage} damage.\n` +
          `\tMonster Health: ${Math.max(0, monsterHealth)} | Your Health: ${Math.max(0, exileHealth)}`
        );
        
        round++;
      }
    }

    // Set combat outcome based on final state
    if (exileHealth <= 0) {
      combatOutcome = `Defeat! The ${simMonster.type} has bested you!`;
    } else if (monsterHealth <= 0) {
      combatOutcome = `Victory! The ${simMonster.type} has been defeated!`;
    } else if (exileHealth === 1) {
      lootLossPercent = Math.floor(50 + Math.random() * 30);
      combatOutcome = `Miraculous Escape! Lost ${lootLossPercent}% of loot.`;
    }

    return {
      exileHealth,
      monsterHealth,
      combatLog,
      combatOutcome,
      totalDamageDealt,
      totalDamageReceived,
      usedMitigations,
      lootLossPercent
    };
  }

  function processEncounter(
    encounter: IEncounter, 
    charLevel: number, 
    level: ILevel, 
    difficulty: IDifficulty
  ): { encounter: string, encounterType: JournalEntryType, encounterIcon: string} {
    let encounterType: JournalEntryType = 'Safe';
    let encounterIcon: string = '';
    const areaLevel = level.areaLevel + 1;

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
          health: Math.floor(15 * areaLevel * mobTier[1]),
          experience: 5 * areaLevel * mobTier[1],
          damageInfo: monsterDamageInfo
        }

        const combatResult = simulateCombat(char, exileStats, simMonster, areaLevel, difficulty, mobTier);

        // remove loot if there was some lost
        if (combatResult.lootLossPercent) {
          const lootToLose = Math.floor(char.loot.length * (combatResult.lootLossPercent / 100));
          
          // Reduce loot array using splice
          if (lootToLose > 0) {
            char.loot.splice(-lootToLose);
          }
        }

        // Apply combat outcome to exile's health
        // trace(`___${combatResult.combatOutcome}`);
        // trace(`___${JSON.stringify(simMonster)}`);
        if (combatResult.combatOutcome.startsWith('Miraculous Escape!') || combatResult.combatOutcome.startsWith('You narrowly escape')) {
          // add reduced experience on miraculous escape
          gameEngine.addExperience(simMonster.experience * 0.2);
          gameEngine.updateStats({ currentHealth: 1 }); // Set health to 1 on miraculous escape
        } else if (combatResult.combatOutcome.startsWith('Defeat!')) {
          gameEngine.updateStats({ currentHealth: 0 }); // Set health to 0 on defeat
          gameEngine.isDead = true; // Also set isDead to true on defeat
        } else {
          // Apply final damage to exile for other outcomes (e.g., victory)
          // Calculate damage taken during the simulation
          gameEngine.addExperience(simMonster.experience);
          const damageTaken = exileStats.health - combatResult.exileHealth;
          if (damageTaken > 0) {
            gameEngine.takeDamage(damageTaken);
          }
        }
        
        // Collect only the mitigations that were used during combat
        const activeMitigations = Array.from(combatResult.usedMitigations)
          .map(key => {
            const mitigation = exileStats.mitigation.find(m => m.key === key);
            return mitigation ? `${key}: ${mitigation.value}%` : '';
          })
          .filter(m => m !== '')
          .join(', ');

        // Format the final combat log
        encounter.description = `A ${encounteredMonster} appears!\n${combatResult.combatOutcome}\nCombat Stats:\n- Active Mitigations: ${activeMitigations || 'None'}\n- Damage Dealt: ${combatResult.totalDamageDealt}\n- Damage Received: ${combatResult.totalDamageReceived}`;
        
        // Set encounter type and icon based on outcome and damage taken
        const damageThreshold = Math.max(20, exileStats.health * 0.2); // 20% of max health or 20, whichever is higher
        const isDangerous = combatResult.exileHealth <= 0 || combatResult.totalDamageReceived >= damageThreshold;
        encounterType = isDangerous ? 'Danger' : 'DangerLite';
        encounterIcon = isDangerous ? '💀' : '⚔️';
        
        // If escaped or defeated, stop adventuring
        if (combatResult.exileHealth <= 1) {
          clearInterval(adventureIntervalId.value);
          adventureIntervalId.value = -1;
          isAdventuring.value = false;
        }
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
      gameEngine.heal(100, true);
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