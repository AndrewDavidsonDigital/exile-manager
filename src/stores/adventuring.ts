import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useGameEngine } from './game';
import type { 
  IMonsterDamage,
  ICombatStat,
  ICooldown,
  ITemporalEffect,
  ICharacter,
  ISkillCost,
} from '@/lib/game';
import { MONSTER_DAMAGE_TYPES } from '@/lib/game';
import { generateGoldWithBias, generateNormalGold } from '@/lib/itemUtils';
import { armorMitigation, calculateCriticalChance, calculateDamageTick, CRITICAL_STRIKE_CONSTANTS, EnemyTier } from '@/lib/combatMechanics';
import { trace } from '@/lib/logging';
import { ErrorNumber } from '@/lib/typescript';
import { AffixCategory, Attributes, baseDamageFunction, MonsterTypes, resolveAffixChange, SkillActivationLayer, SkillResource, SkillTarget, SkillTiming, SkillTriggers, type IDifficulty, type IJournalEntry, type ILevel, type IMitigation, type JournalEntryType, calculateScaledExperience, LevelEncounters, type IEncounter, DynamicZoneLevelAnchor, type LootType, DynamicZone, generateRandomId, LevelType, BaseStats, AddLevelCondition, TownUnlockable } from '@/lib/core';
import { CUSTOM_LEVELS, ENCOUNTERS, levels } from '@/data/levels';
import { _cloneDeep } from '@/lib/object';
import { useWorldEngine } from './world';


  export const useAdventuringStore = defineStore('adventuring', () => {
  const gameEngine = useGameEngine();
  const worldEngine = useWorldEngine();
  const isAdventuring = ref(false);
  const adventureIntervalId = ref<ReturnType<typeof setInterval> | ErrorNumber.NOT_FOUND>();
  const adventureInterval = ref<number>(0);
  const adventureJournal = ref<IJournalEntry[]>([]);
  const ADVENTURE_TICK_DELTA = 1500;

  function generateEncounter(level: ILevel, loggingDetail = false): IEcounter {
    logger(`Generating encounter for level: ${level.name}-${level.areaLevel}, with logging: ${loggingDetail? 'verbose' : 'concise'}`);
    const difficulty = gameEngine.getDifficulty;
    if (difficulty === ErrorNumber.NOT_FOUND) return {encounter: 'Something went wrong...', encounterType: 'Danger', encounterIcon: '', abortConfig: null };

    const levelTypes = level.encounters.map(e => e.type);

    const levelWeightingTypes: Record<LevelEncounters, number> = Object.fromEntries(
      level.encounters.map(enc => [enc.type, enc.weighting])
    ) as Record<LevelEncounters, number>;
  
    
    const availableEncounters = ENCOUNTERS
      .filter(
        enc => (
           enc.minLevel <= ( level.areaLevel !== -1 ? level.areaLevel : gameEngine.character?.level || 0 )
        && levelTypes.includes(enc.type)
        )
      )
      .map(enc => {
        const adjustedEncounter = { ...enc };
        adjustedEncounter.weight = levelWeightingTypes[enc.type];
        if (enc.alignment === 'negative') {
          adjustedEncounter.weight = Math.floor(levelWeightingTypes[enc.type] * difficulty.dangerMultiplier);
        }
        return adjustedEncounter;
      });


    const totalWeight = availableEncounters.reduce((sum, enc) => sum + levelWeightingTypes[enc.type], 0);
    const random = Math.random() * totalWeight;
    
    let weightSum = 0;
    let selectedEncounter: IEncounter | null = null;


    for (const encounter of availableEncounters) {
      weightSum += (encounter.weight || 0);
      if (random <= weightSum) {
        selectedEncounter = encounter;
        break;
      }
    }
    
    if (!selectedEncounter) {
      selectedEncounter = availableEncounters[0];
    }

    const character = gameEngine.getCharacter;
    if (typeof character === 'number') return {encounter: 'Something went wrong...', encounterType: 'Danger', encounterIcon: '', abortConfig: null };

    return processEncounter(selectedEncounter, character.level, level, difficulty, loggingDetail);
  }

  type MobTierType = ['basic', 1.0] | ['elite', 2.5] | ['boss', 5];

  interface ISimMonster {
    type: MonsterTypes,
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
      gameEngine.processGameTick(SkillTiming.TURN);

      // Check if exile is about to die (less than 20% health)
      if (exileHealth <= exileStats.health * 0.2 && Math.random() < 0.3) { // 30% chance to escape when below 20% health
        // Calculate loot loss (30-50% of current loot)
        lootLossPercent = Math.floor(30 + Math.random() * 20);

        // Set health to 1 and stop adventuring
        exileHealth = 1;
        combatLog.push(
          `\nYou narrowly escape with your life, losing ${lootLossPercent}% of your loot in the process!\n` +
          `Escaping with 1 HP...`
        );

        // need to fully exist here.
        shouldBail = true;
        break;
      }

      if(!shouldBail){
        let spellDescription = '';
        // check to see if we should use skill
        const availableSkills = char.skills.filter(el => {
          if (el.activationLayer !== SkillActivationLayer.COMBAT) return;
          let canUse = el.isEnabled;
          // console.log(`___:CD ${isOffCooldown(char, el._identifier)}`);
          // console.log(`___:TR ${checkTriggerable(char, el.setTrigger || SkillTriggers.NONE)}`);
          canUse = canUse && isOffCooldown(char, el._identifier);
          canUse = canUse && checkTriggerable(char, el.setTrigger || SkillTriggers.NONE);
          canUse = canUse && isAbleToAffordSkill(char, el.cost);

          return canUse;
        });
        // console.log('___ all:', availableSkills);

        // Randomly select a skill if any are available
        const selectedSkill = availableSkills.length > 0 
          ? availableSkills[Math.floor(Math.random() * availableSkills.length)]
          : null;

          
        if (selectedSkill) {
          switch (selectedSkill.cost.resource) {
            case SkillResource.HEALTH:
              exileHealth -= selectedSkill.cost.amount;
              break;

            case SkillResource.MANA:
              char.stats.currentMana -= selectedSkill.cost.amount
              break;

            case SkillResource.GOLD:
              char.gold -= selectedSkill.cost.amount
              break;
          
            default:
              break;
          }

          // PIVOT on Target
          switch (selectedSkill.target) {

            // Enemy
            case SkillTarget.ENEMY:

              switch (selectedSkill.effect.target) {
                case Attributes.HEALTH: {
                  const dmg = resolveAffixChange(monsterHealth, selectedSkill.effect.change, selectedSkill.effect.type);;
                  spellDescription = `Casting: ${selectedSkill.name}: dealing ${dmg}`;
                  logger(spellDescription);
                  monsterHealth = dmg;
                  break;
                }

                default:
                  break;
              }

              break;

            // Exile
            case SkillTarget.SELF:

              switch (selectedSkill.effect.target) {
                case Attributes.HEALTH: {
                  const dmg = resolveAffixChange(exileHealth, selectedSkill.effect.change, selectedSkill.effect.type);
                  spellDescription = `Casting: ${selectedSkill.name}: healing ${selectedSkill.effect.change}`;
                  logger(spellDescription);
                  gameEngine.heal(dmg);
                  break;
                }
                case Attributes.WRATH: {
                  // push buff to state
                  if (selectedSkill.duration){
                    spellDescription = `Casting: ${selectedSkill.name}: buffing ${Attributes.WRATH} by ${selectedSkill.effect.change} for ${selectedSkill.duration.count} ${selectedSkill.duration.timing}'s`;
                    logger(spellDescription);
                    const newBuff: ITemporalEffect = {
                      effect: selectedSkill.effect,
                      name: selectedSkill.name,
                      timing: selectedSkill.duration.timing,
                      remaining: selectedSkill.duration.count,
                    }
                    gameEngine.addTemporalEffect(newBuff);
                  }
                  break;
                }

                case AffixCategory.PHYSICAL:{
                  if (selectedSkill.duration){
                    spellDescription = `Casting: ${selectedSkill.name}: buffing ${AffixCategory.PHYSICAL} damage by ${selectedSkill.effect.change} for ${selectedSkill.duration.count} ${selectedSkill.duration.timing}'s`;
                    logger(spellDescription);
                    const newBuff: ITemporalEffect = {
                      effect: selectedSkill.effect,
                      name: selectedSkill.name,
                      timing: selectedSkill.duration.timing,
                      remaining: selectedSkill.duration.count,
                    }
                    gameEngine.addTemporalEffect(newBuff);
                  }
                  break;
                }

                case AffixCategory.ELEMENTAL:{
                  if (selectedSkill.duration){
                    spellDescription = `Casting: ${selectedSkill.name}: buffing ${AffixCategory.ELEMENTAL} damage by ${selectedSkill.effect.change} for ${selectedSkill.duration.count} ${selectedSkill.duration.timing}'s`;
                    logger(spellDescription);
                    const newBuff: ITemporalEffect = {
                      effect: selectedSkill.effect,
                      name: selectedSkill.name,
                      timing: selectedSkill.duration.timing,
                      remaining: selectedSkill.duration.count,
                    }
                    gameEngine.addTemporalEffect(newBuff);
                  }
                  break;
                }
                default:
                  break;

              }
              
              break;
          
            default:
              break;
          }

          const cooldownTime = selectedSkill.cooldown.startCooldownInstantly ? selectedSkill.cooldown.count : (selectedSkill.cooldown.count + (selectedSkill.duration?.count || 0));
          logger(`new cooldown for: ${selectedSkill.name} with timing: ${cooldownTime}`);
          // set on cooldown:
          const newCooldown: ICooldown = {
            _identifier: selectedSkill._identifier,
            name: selectedSkill.name,
            timing: selectedSkill.cooldown.timing,
            remaining: cooldownTime,
          }
          
          gameEngine.addCooldown(newCooldown)
          // char.cooldowns.push(newCooldown);

        // Log spell cast
        combatLog.push(
          `Round ${round}:\n` +
          `\t\t\tYou cast ${selectedSkill.name}\n` +
          `\t\t\t${spellDescription}`
        );

        }

        //------------------------------------------

        // Calculate exile's base attack damage
        const exileDamage = calculateDamageTick(exileStats.damagePerTick);

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
          const baseMonsterDamage = armorMitigation(() => baseDamageFunction(areaLevel, mobTier[1], difficulty.dangerMultiplier), exileStats.mitigation.find(e => e.key === 'armor')?.value || 0 ,char.level);
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
              
              // Get percentage-based mitigations
              const primaryMitigation = Math.min(BaseStats.BASE_MAX_RESISTANCE, (exileStats.mitigation.find((m: IMitigation) => m.key === simMonster.damageInfo.primary)?.value || 0));
              const secondaryMitigation = Math.min(BaseStats.BASE_MAX_RESISTANCE, (exileStats.mitigation.find((m: IMitigation) => m.key === simMonster.damageInfo.secondary)?.value || 0));

              if (primaryMitigation > 0) {
                usedMitigations.add(simMonster.damageInfo.primary);
              }
              if (secondaryMitigation > 0) {
                usedMitigations.add(simMonster.damageInfo.secondary);
              }
              
              // Calculate final damage with all mitigations
              const mitigatedPrimaryDamage = Math.max(1, Math.floor(primaryDamage * (1 - (primaryMitigation / 100))));
              const mitigatedSecondaryDamage = Math.max(1, Math.floor(secondaryDamage * (1 - (secondaryMitigation / 100))));
              
              mitigatedDamage = mitigatedPrimaryDamage + mitigatedSecondaryDamage;
              
              // Update damage description with all mitigation info
              damageTypeDesc = `attacks with ${simMonster.damageInfo.primary} (${primaryDamage}, ${primaryMitigation}% mitigated) and ${simMonster.damageInfo.secondary} (${secondaryDamage}, ${secondaryMitigation}% mitigated)`;
            } else {
              // Single damage type
              const primaryMitigation = exileStats.mitigation.find((m: IMitigation) => m.key === simMonster.damageInfo.primary)?.value || 0;
              
              if (primaryMitigation > 0) {
                usedMitigations.add(simMonster.damageInfo.primary);
              }

              // Calculate final damage with all mitigations
              mitigatedDamage = Math.max(1, Math.floor(monsterDamage * (1 - (primaryMitigation / 100))));
              
              // Update damage description with all mitigation info
              damageTypeDesc = `attacks with ${simMonster.damageInfo.primary} (${monsterDamage}, ${primaryMitigation}% mitigated)`;
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

  interface IEcounterAbort{
    shouldConcludeAdventure: boolean;
    shouldRemoveMap: boolean;
  };

  
  interface IEcounter{ 
    encounter: string, 
    encounterType: JournalEntryType, 
    encounterIcon: string,
    abortConfig: IEcounterAbort | null,
  }

  function processEncounter(
    encounter: IEncounter, 
    charLevel: number, 
    level: ILevel, 
    difficulty: IDifficulty,
    loggingDetail = false,
  ): IEcounter {
    let encounterType: JournalEntryType = 'Safe';
    let encounterIcon: string = '';
    let abortConfig: IEcounterAbort | null = null;
    const areaLevel = level.areaLevel + 1;

    switch (encounter.type) {
      case LevelEncounters.COMBAT: {
        const encounteredMonster = level.monsterTypes[Math.floor(Math.random() * level.monsterTypes.length)];
        const mobTier: MobTierType = ['basic', 1.0];
        const char = gameEngine.getCharacter;
        const exileStats = gameEngine.getCombatStats;

        if (char === ErrorNumber.NOT_FOUND || exileStats === ErrorNumber.NOT_FOUND) break;

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
          gameEngine.removeLoot(combatResult.lootLossPercent, true);
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
              const areaDelta = level.areaLuckDelta || 1;
              gameEngine.addLoot(1, level.areaLevel, areaDelta, worldEngine.townConfigurations.Smithy.find(el => el.key === 'autoSalvage')?.state || false); // Add 1 loot item using existing function
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
            return mitigation ? `${key}: ${Math.min(BaseStats.BASE_MAX_RESISTANCE,mitigation.value)}%` : '';
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
          adventureIntervalId.value = ErrorNumber.NOT_FOUND;
          isAdventuring.value = false;
        }
        break;
      }
      
      case LevelEncounters.TREASURE: {
        const gold = generateGoldWithBias(
          Math.floor(Math.random() * 50) * difficulty.lootMultiplier, 
          level.lootTags,
        );
        gameEngine.updateGold(gold);
        gameEngine.addExperience(calculateScaledExperience(5, charLevel, areaLevel));
        const loot = Math.floor(Math.random() * 5);

        const oldLootCount = gameEngine.character?.loot.length || 0;
        // Use weighted item type based on level's loot tags
        const areaDelta = level.areaLuckDelta || 1;
        gameEngine.addLoot(loot, level.areaLevel, areaDelta, worldEngine.townConfigurations.Smithy.find(el => el.key === 'autoSalvage')?.state || false, level.lootTags); // Pass loot tags to addLoot

        if (gold > 0){
          encounter.description += `\n- ${gold} Gold`
        }
        if (loot > 0){
          if ( gameEngine.character?.loot.length && oldLootCount < gameEngine.character.loot.length){
            const lootDelta = gameEngine.character.loot.length - oldLootCount;
            encounter.description += `\n- ${lootDelta} Item${lootDelta === 1 ? '' : 's'}`
          } else {
            encounter.description += `\n- ${loot} Item${loot === 1 ? '' : 's'} salvaged to gold`
          }
        }
        
        if (gold === 0 && loot === 0 ){
          encounter.description += `\n- but it would seem that it has already been looted :(`
        }

        encounterType = 'Treasure';
        encounterIcon = '🪙';
        break;
      }
      
      case LevelEncounters.TRAP: {
        const trapDamage = Math.floor((Math.random() * 10) + 5) * difficulty.dangerMultiplier;
        gameEngine.takeDamage(trapDamage);
        // gameEngine.modifyStat('fortitude', -1);
        gameEngine.addExperience(calculateScaledExperience(2, charLevel, areaLevel));

        encounter.description += `\n- Damage Received: ${trapDamage}`
        
        encounterType = 'Danger';
        encounterIcon = '🏹';
        break;
      }
      
      case LevelEncounters.CORRUPTED: {
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
      
      case LevelEncounters.RECOVERY: {
        const restoreAmount = Math.floor(Math.random() * 9) + 7; // Random number between 7 and 15
        gameEngine.heal(restoreAmount, true);
        gameEngine.recoverMana(restoreAmount, true);
        gameEngine.addExperience(calculateScaledExperience(1, charLevel, areaLevel));
        
        encounter.description += `\n- Restored ${restoreAmount}% Health and Mana`

        encounterType = 'Generic';
        encounterIcon = '🔎';
        break;
      }

      case LevelEncounters.RUINS_0: {

        encounter.description += `You are unable to make out anything from this rubble`

        encounterType = 'Generic';
        encounterIcon = '❔';

        break;
      }

      case LevelEncounters.RUINS_1: {
        if (worldEngine.isTownFeatureKnown(TownUnlockable.SMITH)){
          encounter.description += `You are unable to make out anything from this rubble`
          encounterIcon = '❔';
          encounterType = 'Generic';
        }else{
          encounter.description += `From the rumble and scattered tools this ruin appears to be of a forge`
          encounterIcon = '🛠️';
          encounterType = 'Safe';
          worldEngine.knowAboutTownFeature(TownUnlockable.SMITH);
        }
        break;
      }

      case LevelEncounters.RUINS_2: {
        if (worldEngine.isTownFeatureKnown(TownUnlockable.ARCANUM)){
          encounter.description += `You are unable to make out anything from this rubble`
          encounterIcon = '❔';
          encounterType = 'Generic';
        }else{
          encounter.description += `You are presume from the strewn tattered parchment that this was once an Arcanum`
          encounterIcon = '✨';
          encounterType = 'Safe';
          worldEngine.knowAboutTownFeature(TownUnlockable.ARCANUM);
        }
        break;
      }

/************************ CUSTOM EVENTS ************************/
      
      // custom Roiden event Good
      case LevelEncounters.CUSTOM_A: {
        const restoreAmount = Math.floor(Math.random() * 51) + 10; // Random number between 10 and 60
        gameEngine.heal(restoreAmount, true);
        gameEngine.addExperience(calculateScaledExperience(10, charLevel, areaLevel));
        
        encounter.description += `\n- Restored ${restoreAmount}% Health`

        encounterType = 'Generic';
        encounterIcon = '🍣';
        break;
      }
      
      // custom Roiden event Bad
      case LevelEncounters.CUSTOM_B: {
        if (! (gameEngine.character)){
          break;
        }
        const halfCurrentHealth = Math.floor((gameEngine.character.stats.currentHealth) / 2)
        gameEngine.takeDamage(halfCurrentHealth, false);
        
        encounter.description += `\n- lost ${halfCurrentHealth} of health`

        encounterType = 'Horror';
        encounterIcon = '🤢';
        break;
      }
      
      // custom Vedorys event
      case LevelEncounters.CUSTOM_C: {
        const charBasedGold = (gameEngine.character?.level || 1) * 100;
        // reduce to a third since we now get the mission
        const goldChange = Math.floor((generateNormalGold() + charBasedGold) / 3);
        gameEngine.updateGold(goldChange);
        
        encounter.description += `\n- quickly collect ${goldChange} gold`

        encounterType = 'Treasure';
        encounterIcon = '💰';

        if (CUSTOM_LEVELS.has('CUSTOM_C') ){
          const level = _cloneDeep(CUSTOM_LEVELS.get('CUSTOM_C'));
          if (level) gameEngine.addLocationIff(level, AddLevelCondition.NOT_EXISTING);
        }
        break;
      }
      // custom Vedorys event Level
      case LevelEncounters.CUSTOM_C_BOSS: {
        // loose 50% of loot and 20% from stash and 70% of gold and 20% of health

        encounter.description += `\n- ARCHIE NOOOOOoooooooooo!`

        const lootLost = gameEngine.removeLoot(50, true);
        const stashLootLost = gameEngine.removeStashLoot(20, true);

        let lostGold = 0;
        if (gameEngine.character){
          lostGold = Math.floor(gameEngine.character.gold * 0.7);
          gameEngine.updateGold(lostGold, false);
          const damageToTake = Math.floor(gameEngine.character.stats.currentHealth * 0.75);
          gameEngine.takeDamage(damageToTake, false);
        }


        encounter.description += `\n- The treasure cat plunders your loot ${lootLost} and ${lostGold ? '-' + lostGold + ' gold,' : ''} wounding you in the process.`;
        if (stashLootLost) encounter.description += ` You also sense your stash is not as full as you remember.`;

        encounterType = 'Danger';
        encounterIcon = '🐈‍⬛';

        abortConfig = {
          shouldConcludeAdventure: true,
          shouldRemoveMap: true,
        };

        break;
      }
    }
    
    if (encounter.type !== LevelEncounters.COMBAT){
      gameEngine.processGameTick(SkillTiming.TURN);
    }
    return { encounter: encounter.description, encounterType: encounterType, encounterIcon: encounterIcon, abortConfig: abortConfig };
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
    if (selectedLevel.uses){
      selectedLevel.uses--;
    }
    
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

  function processLevelCompletionEvents(levelId: string){
    switch (levelId) {
      case 'init_ruins_2':
        logger('Found ruins enable town-camp');
        worldEngine.unlockTown();
        break;
    
      default:
        break;
    }
  }

  function doAdventuring(selectedLevel: ILevel, loggingDetail = false) {
    if (adventureInterval.value <= 0) {
    
      const entry: IJournalEntry = {
        message: `[${new Date(Date.now()).toLocaleTimeString('en-AU', { hour12: false}) }] 🏘️ You returned from your adventure`,
        type: 'Safe',
      }
      adventureJournal.value.push(entry);
      clearInterval(adventureIntervalId.value);
      adventureIntervalId.value = ErrorNumber.NOT_FOUND;
      isAdventuring.value = false;
      gameEngine.heal(50, true);
      gameEngine.recoverMana(50, true);

      if (selectedLevel.uses === 0){
        // need to remove limited location.
        gameEngine.removeLocation(selectedLevel);
      }

      gameEngine.incrementRuns();

      const shouldCascade = (Math.random() > 0.5 ? true : false);

      if (selectedLevel.completionRules.length > 0){
        // Select next level based on weighted probabilities
        const totalWeight = Math.max(100, selectedLevel.completionRules.reduce((sum, rule) => sum + rule.weighting, 0));
        const random = Math.random() * totalWeight;
        let weightSum = 0;
        let selectedRule = null; // Default to first rule if something goes wrong

        for (const rule of selectedLevel.completionRules) {
          weightSum += rule.weighting;
          if (random <= weightSum) {
            selectedRule = rule;
            break;
          }
        }

        processLevelCompletionEvents(selectedLevel._identifier);

        // Find the next level based on the selected rule's identifier
        if (selectedRule){
          const nextLevel = levels.find((level: ILevel) => level._identifier === selectedRule._identifier);
          if (nextLevel){
            if(selectedRule.limits){
              nextLevel.uses = selectedRule.limits;
            }
            nextLevel.type = LevelType.DEFAULT;
            if (! gameEngine.getAvailableLevels.find(el => el._identifier === nextLevel._identifier)){
              logger(`Add new level ${nextLevel.name}`);
              gameEngine.addLocation(nextLevel);
            }else{
              logger(`Don't need to add an already added level ${nextLevel.name}`);
            }
          }
        }
      } else if (selectedLevel?.type !== LevelType.BONUS && shouldCascade){
        // for now add a temp infinite progression
        let areaLevel = gameEngine.character?.level || selectedLevel.areaLevel;
        areaLevel+= Math.ceil(Math.random() * 2);

        const randomEncounterCounts = 2 + Math.random() * 4;
        const randomEncounterCountDelta = Math.random() * 3;

        // Randomly select 1-2 item types
        const randomLoots: LootType[] = ['armor', 'weapons', 'accessory']
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.floor(Math.random() * 2) + 1) as LootType[];

        // Randomly select 1-2 monster types
        const randomMonsters = Object.values(MonsterTypes)
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.floor(Math.random() * 2) + 1);


        const uses = Math.ceil(1 + Math.random()  * (Math.random() > 0.5 ? -1 : 1));
        const description = `An unknown location`;
        const id = generateRandomId();
        const name = `Unknown: ${id}`;

        const placeholderContent: ILevel = {
          _identifier: `unknown_location_${id}`,
          description: description,
          name: name,
          areaLevel,
          areaLuckDelta: 0,
          encounterBase: Math.floor(randomEncounterCounts),
          encounterRangeDeltas: Math.floor(randomEncounterCountDelta),
          lootTags: randomLoots,
          monsterTypes: randomMonsters,
          encounters: [
            {
              type: LevelEncounters.COMBAT,
              weighting: 55,
            },
            {
              type: LevelEncounters.RECOVERY,
              weighting: 20,
            },
            {
              type: LevelEncounters.TRAP,
              weighting: 10,
            },
            {
              type: LevelEncounters.TREASURE,
              weighting: 14,
            },
            {
              type: LevelEncounters.CUSTOM_A,
              weighting: 0.33,
            },
            {
              type: LevelEncounters.CUSTOM_B,
              weighting: 0.33,
            },
            {
              type: LevelEncounters.CUSTOM_C,
              weighting: 0.33,
            },
          ],
          uses: uses,
          maxUses: uses,
          dynamicCompletions: [
            {
              _identifier: 'init_cave',
              type: DynamicZone.CAVE,
              areaLevelDelta: 2,
              limits: 2,
              weighting: 15,
              areaLevelAnchor: DynamicZoneLevelAnchor.ZONE,
              areaLuckDelta: 1.2,
              encounters: [
                {
                  type: LevelEncounters.COMBAT,
                  weighting: 45,
                },
                {
                  type: LevelEncounters.CUSTOM_C,
                  weighting: 1,
                },
                {
                  type: LevelEncounters.TRAP,
                  weighting: 20,
                },
                {
                  type: LevelEncounters.TREASURE,
                  weighting: 25,
                },
              ]
            },
            {
              _identifier: 'init_island',
              type: DynamicZone.ISLAND,
              areaLevelDelta: 5,
              limits: 5,
              weighting: 10,
              areaLevelAnchor: DynamicZoneLevelAnchor.ZONE,
              areaLuckDelta: 1.5,
              encounters: [
                {
                  type: LevelEncounters.COMBAT,
                  weighting: 55,
                },
                {
                  type: LevelEncounters.CUSTOM_C,
                  weighting: 1,
                },
                {
                  type: LevelEncounters.TRAP,
                  weighting: 10,
                },
                {
                  type: LevelEncounters.TREASURE,
                  weighting: 25,
                },
              ]
            },
            {
              _identifier: 'init_rift',
              type: DynamicZone.RIFT,
              areaLevelDelta: 0,
              limits: 2,
              weighting: 30,
              areaLevelAnchor: DynamicZoneLevelAnchor.CHARACTER,
              areaLuckDelta: 2.0,
              encounters: [
                {
                  type: LevelEncounters.COMBAT,
                  weighting: 40,
                },
                {
                  type: LevelEncounters.TREASURE,
                  weighting: 20,
                },
                {
                  type: LevelEncounters.RECOVERY,
                  weighting: 25,
                },
                {
                  type: LevelEncounters.CORRUPTED,
                  weighting: 15,
                },
              ]
            }],
          completionRules: [],
          type: LevelType.INFINITE,
        }

        logger(`Add new PLACEHOLDER level ${placeholderContent.name}`);
        gameEngine.addLocation(placeholderContent);
      }

      if (selectedLevel.dynamicCompletions.length > 0){
        // Calculate total weight of all dynamic completions
        const totalWeight = Math.max(100, selectedLevel.dynamicCompletions.reduce((sum, completion) => sum + completion.weighting, 0));
        const random = Math.random() * totalWeight;
        let weightSum = 0;
        let selectedBonus = null;

        // Select a completion based on weighted probability
        for (const completion of selectedLevel.dynamicCompletions) {
          weightSum += completion.weighting;
          if (random <= weightSum) {
            selectedBonus = completion;
            break;
          }
        }

        // Find the next level based on the selected completion's identifier
        if (selectedBonus) {
          let areaLevel = selectedBonus.areaLevelAnchor === DynamicZoneLevelAnchor.CHARACTER ? gameEngine.character?.level || selectedLevel.areaLevel :  selectedLevel.areaLevel;
          areaLevel+= selectedBonus.areaLevelDelta;

          const randomEncounterCounts = 2 + Math.random() * 4;
          const randomEncounterCountDelta = Math.random() * 3;

          // Randomly select 1-2 item types
          const randomLoots: LootType[] = ['armor', 'weapons', 'accessory']
            .sort(() => Math.random() - 0.5)
            .slice(0, Math.floor(Math.random() * 2) + 1) as LootType[];

          // Randomly select 1-2 monster types
          const randomMonsters = Object.values(MonsterTypes)
            .sort(() => Math.random() - 0.5)
            .slice(0, Math.floor(Math.random() * 2) + 1);

          let description = '';
          let name = '';
          let preface = '';
          const id = generateRandomId();
          const uses = Math.ceil(selectedBonus.limits + (Math.random() * 2)  * (Math.random() > 0.5 ? -1 : 1));
          switch (selectedBonus.type) {
            case DynamicZone.CAVE:
              description = `An entrance to a secluded cave`;
              name = `${DynamicZone.CAVE}: ${id}`;
              preface = 'Approach the ';
              break;

            case DynamicZone.ISLAND:
              description = `You can make out an Island just off-shore`;
              name = `${DynamicZone.ISLAND}: ${id}`;
              preface = 'Explore the ';
              break;

            case DynamicZone.RIFT:
              description = `This rift hums with a sense of urgency`;
              name = `${DynamicZone.RIFT}: ${id}`;
              preface = 'Investigate the ';
              break;
          
            default:
              description = `An unknown location`;
              name = id;
              break;
          }

          const bonusContent: ILevel = {
            _identifier: `${selectedBonus._identifier}_${id}`,
            description: description,
            name: name,
            areaLevel,
            preface,
            areaLuckDelta: selectedBonus.areaLevelDelta,
            encounterBase: Math.floor(randomEncounterCounts),
            encounterRangeDeltas: Math.floor(randomEncounterCountDelta),
            lootTags: randomLoots,
            monsterTypes: randomMonsters,
            encounters: selectedBonus.encounters, 
            uses: uses,
            maxUses: uses,
            dynamicCompletions: [],
            completionRules: [],
            type: LevelType.BONUS,
            zone: selectedBonus.type,
          }
          if (!gameEngine.getAvailableLevels.find(el => el._identifier === bonusContent._identifier)) {
            logger(`Add new bonus level ${bonusContent.name}`);
            gameEngine.addLocation(bonusContent);
          } else {
            logger(`Don't need to add an already added bonus level ${bonusContent.name}`);
          }
        }
      }
      
      return;
    }

    const tickResult = generateEncounter(selectedLevel, loggingDetail);

    if (tickResult.encounter.includes('Escape')){
      if (selectedLevel.uses === 0){
        // need to remove limited location.
        gameEngine.removeLocation(selectedLevel);
      }
      console.log('ESCAPED: ',tickResult);
    }

    const entry: IJournalEntry = {
      message: `[${new Date(Date.now()).toLocaleTimeString('en-AU', { hour12: false}) }] ${tickResult.encounterIcon} ${tickResult.encounter}`,
      type: tickResult.encounterType,
    }

    adventureJournal.value.push(entry);

    if (tickResult.abortConfig !== null) {
      if (tickResult.abortConfig.shouldRemoveMap){
        gameEngine.removeLocation(selectedLevel, true);
      }
      if (tickResult.abortConfig.shouldConcludeAdventure){
        adventureInterval.value = 0;
        return;
      }
    }
    adventureInterval.value--;

    // Check if character is dead
    if (gameEngine.isDead) {
    
      const entry: IJournalEntry = {
        message: `[${new Date(Date.now()).toLocaleTimeString('en-AU', { hour12: false}) }] 💀 You have fallen in battle!`,
        type: 'Danger',
      }
      adventureJournal.value.push(entry);
      clearInterval(adventureIntervalId.value);
      adventureIntervalId.value = ErrorNumber.NOT_FOUND;
      isAdventuring.value = false;
      return;
    }
  }

  function reset() {
    adventureInterval.value = 0;
    adventureIntervalId.value = ErrorNumber.NOT_FOUND;
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
export function checkTriggerable(char: ICharacter, trigger: SkillTriggers): boolean{
  switch (trigger) {
    case SkillTriggers.ALWAYS:
      return true;
    
    case SkillTriggers.LOW_HEALTH:{
      const healPercentage = (char.stats.currentHealth / char.stats.health)*100;
      // console.log(`___\t currentHP: ${healPercentage}%`);
      return healPercentage < 40
    }

    case SkillTriggers.MED_HEALTH:{
      const healPercentage = (char.stats.currentHealth / char.stats.health)*100;
      // console.log(`___\t currentHP: ${healPercentage}%`);
      return healPercentage > 30 && healPercentage < 60
    }

    case SkillTriggers.HIGH_HEALTH:{
      const healPercentage = (char.stats.currentHealth / char.stats.health)*100;
      // console.log(`___\t currentHP: ${healPercentage}%`);
      return healPercentage > 60
    }

    default:
      break;
  }
  return false;
}

export function isOffCooldown(char: ICharacter, identifier: string): boolean {
  return !(char.cooldowns?.find(cd => cd._identifier === identifier));
}

export function isAbleToAffordSkill(char: ICharacter, skillCost : ISkillCost):boolean{
  switch (skillCost.resource) {
    case SkillResource.GOLD:
      return char.gold >= skillCost.amount;

    case SkillResource.HEALTH:
      return char.stats.currentHealth >= skillCost.amount;

    case SkillResource.MANA:
      return char.stats.currentMana >= skillCost.amount;
  }
}