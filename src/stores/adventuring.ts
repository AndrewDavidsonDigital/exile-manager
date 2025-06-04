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
import { generateGoldWithBias, generateNormalGold } from '@/lib/itemUtils';
import { calculateCriticalChance, CRITICAL_STRIKE_CONSTANTS, EnemyTier } from '@/lib/combatMechanics';
import { trace } from '@/lib/logging';

type EncounterType = 
  'combat'
| 'treasure'
| 'trap'
| 'corrupted'
| 'recover'
| 'customA'
| 'customB'
| 'customC'
;

interface IEncounter {
  type: EncounterType;
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
    description: 'You discover a hidden cache!',
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
    type: 'recover',
    description: 'The path ahead is quiet and uneventful...',
    weight: 25,
    minLevel: 0,
    alignment: 'neutral'
  },
  {
    type: 'customA',
    description: 'You meet a mythical fisherman, Roiden, who serves up some of his catch',
    weight: 1,
    minLevel: 0,
    alignment: 'neutral'
  },
  {
    type: 'customB',
    description: 'You encounter a mythical fisherman, Roiden, who force-feeds you his bait',
    weight: 1,
    minLevel: 2,
    alignment: 'neutral'
  },
  // update this to be a force activation of a new mission once mission revamp is done,
  // think goblin-queen from d3
  // treasure map to Archie's Perch, signed Vedorys / Syrodev
  {
    type: 'customC',
    description: 'You spy a Long necked loot turtle, miraculously speeding out of sight.\n In its wake, you find a trail of coins seemingly forming the word Vedorys',
    weight: 0.5,
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
  const ADVENTURE_TICK_DELTA = 1500;


  function calculateScaledExperience(baseExp: number, characterLevel: number, areaLevel: number): number {
    const levelDiff = areaLevel - characterLevel;
    const scaleFactor = Math.max(0.1, 1 + (levelDiff * 0.2));
    return Math.floor(baseExp * scaleFactor);
  }

  function generateEncounter(level: ILevel, loggingDetail = false): { encounter: string, encounterType: JournalEntryType, encounterIcon: string } {
    logger(`Generating encounter for level: ${level.name}-${level.areaLevel}, with logging: ${loggingDetail? 'verbose' : 'concise'}`);
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

    return processEncounter(selectedEncounter, character.level, level, difficulty, loggingDetail);
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

      if(!shouldBail){

        // Calculate exile's base attack damage
        const exileDamage = Math.floor(exileStats.damagePerTick * (0.9 + Math.random() * 0.2));

        // Calculate critical strike chance and effect
        const criticalChance = calculateCriticalChance(exileStats.criticalStrike);
        const criticalRoll = Math.random() * 100;
        const isCritical = criticalRoll < criticalChance;
        
        let finalExileDamage = exileDamage;
        let criticalText = '';
        let skipMonsterTurn = false;
        
        if (isCritical) {
          logger('Critical Hit scored');
          // Calculate monster's current health percentage for execution check
          const monsterHealthPercent = (monsterHealth / simMonster.health) * 100;
          
          // Check for super critical (5% chance on any critical)
          const isSuperCritical = Math.random() < CRITICAL_STRIKE_CONSTANTS.SUPER_CRIT_CHANCE;
          
          // Check for execution based on monster tier and health
          const executionThreshold = CRITICAL_STRIKE_CONSTANTS.EXECUTION_THRESHOLDS[mobTier[0] as EnemyTier];
          const isExecution = monsterHealthPercent <= executionThreshold;
          
          if (isExecution) {
            // Execution instantly defeats the monster
            finalExileDamage = monsterHealth;
            criticalText = ' (EXECUTION!)';
          } else {
            // Non-execution critical recovers health
            const healthRecovery = Math.floor(exileStats.maxHealth * CRITICAL_STRIKE_CONSTANTS.CRIT_HEALTH_RECOVERY);
            exileHealth = Math.min(exileStats.maxHealth, exileHealth + healthRecovery);
            criticalText = ` (CRITICAL! Recovered ${healthRecovery} health)`;
            
            if (isSuperCritical) {
              skipMonsterTurn = true;
              criticalText += ' (SUPER CRITICAL! Monster turn skipped)';
            }
          }
        }
        
        // Exile's turn
        monsterHealth -= finalExileDamage;
        totalDamageDealt += finalExileDamage;

        // Log the exile's attack
        combatLog.push(
          `Round ${round}:\n` +
          `\t\t\tYou deal ${finalExileDamage} damage${criticalText}.\n` +
          `\t\t\tMonster Health: ${Math.max(0, monsterHealth)} | Your Health: ${Math.max(0, exileHealth)}`
        );

        // Check if monster is defeated
        if (monsterHealth <= 0) {
          break;
        }

        // Monster's turn (skipped if super critical)
        if (!skipMonsterTurn) {
          const baseMonsterDamage = Math.floor((5 + Math.random() * 10) * areaLevel * mobTier[1] * difficulty.dangerMultiplier);
          const monsterDamage = Math.floor(baseMonsterDamage * simMonster.damageInfo.damageMultiplier);
          
          // Apply damage to exile, considering specific damage type mitigation
          let mitigatedDamage = 0;
          let damageTypeDesc = '';
          
          // First check for evasion (complete damage negation)
          const evasionMitigation = exileStats.mitigation.find(m => m.key === 'evasion')?.value || 0;
          const evasionRoll = Math.random() * 100;
          const evaded = evasionRoll < evasionMitigation;
          
          if (!evaded) {
            if (simMonster.damageInfo.secondary && simMonster.damageInfo.damageSplit) {
              // Split damage between primary and secondary types
              const primaryDamage = Math.floor(monsterDamage * (simMonster.damageInfo.damageSplit / 100));
              const secondaryDamage = monsterDamage - primaryDamage;
              
              // Check for block (80% damage reduction)
              const blockMitigation = exileStats.mitigation.find(m => m.key === 'block')?.value || 0;
              const blockRoll = Math.random() * 100;
              const blocked = blockRoll < blockMitigation;
              
              if (blocked) {
                usedMitigations.add('block');
              }
              
              // Get percentage-based mitigations
              const primaryMitigation = exileStats.mitigation.find((m: IMitigation) => m.key === simMonster.damageInfo.primary)?.value || 0;
              const secondaryMitigation = exileStats.mitigation.find((m: IMitigation) => m.key === simMonster.damageInfo.secondary)?.value || 0;
              
              if (primaryMitigation > 0) {
                usedMitigations.add(simMonster.damageInfo.primary);
              }
              if (secondaryMitigation > 0) {
                usedMitigations.add(simMonster.damageInfo.secondary);
              }
              
              // Apply block if successful
              const blockMultiplier = blocked ? 0.2 : 1.0;
              
              // Calculate final damage with all mitigations
              const mitigatedPrimaryDamage = Math.max(1, Math.floor(primaryDamage * blockMultiplier * (1 - (primaryMitigation / 100))));
              const mitigatedSecondaryDamage = Math.max(1, Math.floor(secondaryDamage * blockMultiplier * (1 - (secondaryMitigation / 100))));
              
              mitigatedDamage = mitigatedPrimaryDamage + mitigatedSecondaryDamage;
              
              // Update damage description with all mitigation info
              const blockText = blocked ? ' (80% blocked)' : '';
              damageTypeDesc = `attacks with ${simMonster.damageInfo.primary} (${primaryDamage}, ${primaryMitigation}% mitigated) and ${simMonster.damageInfo.secondary} (${secondaryDamage}, ${secondaryMitigation}% mitigated)${blockText}`;
            } else {
              // Single damage type
              const primaryMitigation = exileStats.mitigation.find((m: IMitigation) => m.key === simMonster.damageInfo.primary)?.value || 0;
              
              if (primaryMitigation > 0) {
                usedMitigations.add(simMonster.damageInfo.primary);
              }
              
              // Check for block (80% damage reduction)
              const blockMitigation = exileStats.mitigation.find(m => m.key === 'block')?.value || 0;
              const blockRoll = Math.random() * 100;
              const blocked = blockRoll < blockMitigation;
              
              if (blocked) {
                usedMitigations.add('block');
              }
              
              // Apply block if successful
              const blockMultiplier = blocked ? 0.2 : 1.0;
              
              // Calculate final damage with all mitigations
              mitigatedDamage = Math.max(1, Math.floor(monsterDamage * blockMultiplier * (1 - (primaryMitigation / 100))));
              
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
          
          // Log the monster's attack
          combatLog.push(
            `\tMonster ${damageTypeDesc}!\n` +
            `\t\t\tYou take ${mitigatedDamage} damage.\n` +
            `\t\t\tMonster Health: ${Math.max(0, monsterHealth)} | Your Health: ${Math.max(0, exileHealth)}`
          );
          
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
              lootLossPercent = Math.floor(50 + Math.random() * 30); // 50-80% loot loss for near-death escape
              
              combatLog.push(
                `Miraculous Escape! Your fortune (${fortune}) saved you from certain death!\n` +
                `You lose ${lootLossPercent}% of your loot in your desperate escape...`
              );
              break;
            } else {
              // No escape, defeat occurs
              exileHealth = 0;
              combatLog.push(
                `Defeat! The ${simMonster.type} has bested you!`
              );
              break;
            }
          }
        }
      }
      round++;

    }

    // Set combat outcome based on final state
    if (exileHealth <= 0) {
      combatOutcome = `Defeat! The ${simMonster.type} has bested you!`;
    } else if (monsterHealth <= 0) {
      combatOutcome = `Victory! The ${simMonster.type} has been defeated!`;
    } else if (exileHealth === 1) {
      if (lootLossPercent !> 0){
        // how have we gotten an escape with no loot loss, re-roll loss
        lootLossPercent = Math.floor(50 + Math.random() * 30);
      }
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
    difficulty: IDifficulty,
    loggingDetail = false
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

          // Add loot and gold rewards for victory
          if (typeof char !== 'number') {
            // 30% chance for loot drop
            if (Math.random() < 0.3) {
              gameEngine.addLoot(1, level.areaLevel); // Add 1 loot item using existing function
            }

            // Gold reward based on monster exp and fortune
            const baseGold = Math.floor(simMonster.experience * 2); // Base gold is 2x monster exp
            const fortuneBonus = Math.min(1.5, 1 + (char.stats.fortune / 100)); // Fortune adds up to 50% more gold
            const goldRange = Math.floor(baseGold * fortuneBonus);
            const goldReward = Math.floor(Math.random() * goldRange);
            
            if (goldReward > 0) {
              gameEngine.updateGold(goldReward);
            }
          }

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
        logger(JSON.stringify(combatResult.combatLog));
        

        if (loggingDetail){
          encounter.description += '\n\t\t'
          encounter.description += combatResult.combatLog.join('\n\t\t')
        }

        // Set encounter type and icon based on outcome and damage taken
        const damageThreshold = exileStats.health * 0.3; // 20% of max health or 20, whichever is higher
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
        const gold = generateGoldWithBias(
          Math.floor(Math.random() * 50) * difficulty.lootMultiplier, 
          level.lootTags,
        );
        gameEngine.updateGold(gold);
        gameEngine.addExperience(calculateScaledExperience(5, charLevel, areaLevel));
        const loot = Math.floor(Math.random() * 5);
        // Use weighted item type based on level's loot tags
        gameEngine.addLoot(loot, level.areaLevel, level.lootTags); // Pass loot tags to addLoot

        if (gold > 0){
          encounter.description += `\n- ${gold} Gold`
        }
        if (loot > 0){
          encounter.description += `\n- ${loot} Item${loot === 1 ? '' : 's'}`
        }

        encounterType = 'Treasure';
        encounterIcon = '🪙';
        break;
      }
      
      case 'trap': {
        const trapDamage = Math.floor(Math.random() * 15) * difficulty.dangerMultiplier;
        gameEngine.takeDamage(trapDamage);
        // gameEngine.modifyStat('fortitude', -1);
        gameEngine.addExperience(calculateScaledExperience(2, charLevel, areaLevel));

        encounter.description += `\n- Damage Received: ${trapDamage}`
        
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
        
        encounter.description += `\n- Damage Received: ${corruptionDamage}`

        encounterType = 'Danger';
        encounterIcon = '🌋';
        break;
      }
      
      case 'recover': {
        const restoreAmount = Math.floor(Math.random() * 9) + 7; // Random number between 7 and 15
        gameEngine.heal(restoreAmount, true);
        gameEngine.recoverMana(restoreAmount, true);
        gameEngine.addExperience(calculateScaledExperience(1, charLevel, areaLevel));
        
        encounter.description += `\n- Restored ${restoreAmount}% Health and Mana`

        encounterType = 'Generic';
        encounterIcon = '🔎';
        break;
      }
      
      // custom Roiden event Good
      case 'customA': {
        const restoreAmount = Math.floor(Math.random() * 51) + 10; // Random number between 10 and 60
        gameEngine.heal(restoreAmount, true);
        gameEngine.addExperience(calculateScaledExperience(10, charLevel, areaLevel));
        
        encounter.description += `\n- Restored ${restoreAmount}% Health`

        encounterType = 'Generic';
        encounterIcon = '🍣';
        break;
      }
      
      // custom Roiden event Bad
      case 'customB': {
        if (! (gameEngine.character)){
          break;
        }
        const halfCurrentHealth = (gameEngine.character.stats.currentHealth) / 2
        gameEngine.takeDamage(halfCurrentHealth, false);
        
        // encounter.description += `\n- lost 50% of health`

        encounterType = 'Horror';
        encounterIcon = '🤢';
        break;
      }
      
      // custom Vedorys event
      case 'customC': {
        const charBasedGold = (gameEngine.character?.level || 1) * 100;
        const goldChange = generateNormalGold() + charBasedGold;
        gameEngine.updateGold(goldChange);
        
        encounter.description += `\n- quickly collect ${goldChange} gold`

        encounterType = 'Treasure';
        encounterIcon = '💰';
        break;
      }
    }
    
    return { encounter: encounter.description, encounterType: encounterType, encounterIcon: encounterIcon };
  }

  function startAdventuring(selectedLevel: ILevel, loggingDetail = false) {
    isAdventuring.value = true;
    const { encounterBase, encounterRangeDeltas } = selectedLevel;
    const minEncounters = Math.max(0, encounterBase - encounterRangeDeltas);
    const maxEncounters = encounterBase + encounterRangeDeltas;
    const encounters = Math.floor(Math.random() * (maxEncounters - minEncounters + 1)) + minEncounters;
    
    logger(`Starting Adventure to: ${selectedLevel.name}`);
    logger(`Encounters: ${encounters}`);
    adventureInterval.value = encounters;
    
    const entry: IJournalEntry = {
      message: `[${new Date(Date.now()).toLocaleTimeString('en-AU', { hour12: false}) }] 🤺 You embark on your adventure at ${selectedLevel.name}`,
      type: 'Safe',
    }
    adventureJournal.value.push(entry);
    adventureIntervalId.value = setInterval(
      () => doAdventuring(selectedLevel, loggingDetail),
      ADVENTURE_TICK_DELTA,
    );
  }

  function doAdventuring(selectedLevel: ILevel, loggingDetail = false) {
    if (adventureInterval.value <= 0) {
    
      const entry: IJournalEntry = {
        message: `[${new Date(Date.now()).toLocaleTimeString('en-AU', { hour12: false}) }] 🏘️ You returned from your adventure`,
        type: 'Safe',
      }
      adventureJournal.value.push(entry);
      clearInterval(adventureIntervalId.value);
      adventureIntervalId.value = -1;
      isAdventuring.value = false;
      gameEngine.heal(50, true);
      gameEngine.recoverMana(50, true);

      gameEngine.incrementRuns();
      return;
    }

    const tickResult = generateEncounter(selectedLevel, loggingDetail);
    
    const entry: IJournalEntry = {
      message: `[${new Date(Date.now()).toLocaleTimeString('en-AU', { hour12: false}) }] ${tickResult.encounterIcon} ${tickResult.encounter}`,
      type: tickResult.encounterType,
    }
    

    if (loggingDetail){
      // entry.message += tickResult.encounter.
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

const LOGGING_PREFIX = '🥷 Adventure:\t';
function logger(message: string) {
  trace(`${LOGGING_PREFIX}${message}`);
}