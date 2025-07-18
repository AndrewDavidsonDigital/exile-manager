import { trace } from '@/lib/logging';
import { defineStore } from 'pinia';
import type { 
  ICharacter, 
  ILoot,
  ICombatStat,
  IStatBuff,
  IPassive,
  ITemporalEffect,
  ISkill,
  ICooldown,
} from '@/lib/game';
import { 
  generateClassStats,
  ITEM_TIER_COSTS,
  generateAffixesForTierAndType,
  RARITY_BIASING,
} from '@/lib/game';
import { useGameState } from '@/lib/storage';
import { BaseItemAffix } from '@/lib/affixTypes';
import { allAffixesById } from '@/data/affixes';
import { _cloneDeep } from '@/lib/object';
import { getAffixValue, getAffixValueRange, resolveAffixMultiplierValue, resolveAverageOfRange } from '@/lib/affixUtils';
import { allItemTypes, slotMap, generateItemLevel, getWeightedItemType, generateItemTier, resolveBaseAffixFromTypeAndTier } from '@/lib/itemUtils';
import { calculateDeflectionAttempts, calculateDodgeChance, getAdditionalEvasionForDodgeIncrease, getArmourForDeflectionCount } from '@/lib/combatMechanics';
import { passives } from '@/data/passives';
import { skills } from '@/data/skills';
import { ErrorNumber } from '@/lib/typescript';
import { AffixCategory, AffixType, AffixTypes, allItemTiers, Attributes, DEFAULT_MITIGATION, DIFFICULTY_SETTINGS, BaseStats, ItemBase, ItemTiers, resolveAffixChange, SkillTiming, SkillTriggers, type DifficultyType, type ICharacterStats, type IDifficulty, type ILevel, type IMitigation, type LootType, AddLevelCondition, exileClassCritSkillName, ExileClass, smearWordIntoId, AffixSubCategory } from '@/lib/core';
import { levels } from '@/data/levels';
import { nextTick } from 'vue';
import { chooseWeightedRandom } from '@/lib/array';

const LOGGING_PREFIX = '🎮 Game Engine:\t';
const VERSION_NUMBER = '0.1.6';

const DEFAULT_STATE = <Readonly<IGameEngine>> {
  version: VERSION_NUMBER,
  runs: 0,
  difficulty: 'Easy',
  character: null,
  isDead: false,
  knownLocations: [],
  nextRewards: {
    passives: [],
    skills: [],
  },
  autoSalvageTier: ItemTiers.BASIC,
  autoSalvage: false,
}

interface INextRewards {
  passives: IPassive[],
  skills: ISkill[],
}

interface IGameEngine {
  version: string;
  runs: number;
  character: ICharacter | null;
  difficulty: DifficultyType;
  isDead: boolean;
  stash?: ILoot[];  
  knownLocations: ILevel[],
  nextRewards: INextRewards,
  autoSalvageTier: ItemTiers,
  autoSalvage: boolean;
}

export const useGameEngine = defineStore('gameEngine', {
  state: () => {
    const gameState = useGameState();
    const savedState = gameState.get();
    
    // Initialize state from storage if it exists
    if (savedState) {
      if (! savedState.version){
        savedState.version = '0.0.0';
      }
      return savedState as IGameEngine;
    }
    
    return { 
      ...DEFAULT_STATE,
      stash: [],
    } as IGameEngine
  },

  getters: {
    isVersionSaveOutOfDate(): boolean {
      logger('Checking version')
      return this.version !== VERSION_NUMBER;
    },
    hasRefreshes():boolean {
      if (!(this.character && this.character.refreshes)) return false;

      return this.character.refreshes > 0
    },
    getVersions(): {save: string;game:string} {
      logger('Resolving version')
      return {
        'save' : this.version,
        'game' : VERSION_NUMBER,
      };
    },
    /**
     * Retrieves the current difficulty settings including multipliers
     * @returns {IDifficulty | -1} The current difficulty settings or -1 if not found
     */
    getDifficulty(): IDifficulty | ErrorNumber.NOT_FOUND {
      logger('Resolving difficulty')
      const retval = DIFFICULTY_SETTINGS.get(this.difficulty);
      if (retval)
        return retval;
      return ErrorNumber.NOT_FOUND;
    },

    getAvailableLevels(): ILevel[] {
      if (! this.knownLocations) return [];
      return this.knownLocations;
    },

    /**
     * Retrieves the current character
     * @returns {ICharacter | -1} The current character or -1 if none exists
     */
    getCharacter(): ICharacter | ErrorNumber.NOT_FOUND {
      logger(`Retrieving character: ${this.character?.name || 'none'}`);
      if (!this.character) return ErrorNumber.NOT_FOUND;
      return this.character;
    },

    getLootWorth(): number | ErrorNumber.NOT_FOUND {
      if (!this.character) return ErrorNumber.NOT_FOUND;
      return this.character.loot.reduce((a,b) => a + ITEM_TIER_COSTS[b.itemDetails?.tier || ItemTiers.BASIC], 0) || 0;
    },
    getAffordIdAll(): boolean {
      if (!this.character) return false;
      return (this.character.loot.reduce((a,b) => a + ITEM_TIER_COSTS[b.itemDetails?.tier || ItemTiers.BASIC], 0) || 0) < this.character.gold;
    },

    getAvailablePassives(): IPassive[]{
      if (!this.character) return [];

      const charLevel = this.character.level;
      const charPassives = this.character.passives;
      const charClass = this.character.class;

      if (this.nextRewards.passives.length === 0){
        // Filter eligible passives
        const eligible = passives.filter(
          el => (
            charLevel >= (el.minCharLevel || 0)
            && !(charPassives.find(f => f._identifier === el._identifier))
            && (!el.requiredClass || el.requiredClass && el.requiredClass.includes(charClass))
          )
        );
        // Prepare weights based on rarity
        const weights = eligible.map(el => RARITY_BIASING[el.rarity || 'DEFAULT']);
        // Select up to 3 unique passives using weighted random
        const selected: IPassive[] = [];
        const usedIndexes = new Set<number>();
        for (let i = 0; i < 3 && eligible.length > 0 && usedIndexes.size < eligible.length; i++) {
          // Remove already selected
          const pool = eligible.filter((_, idx) => !usedIndexes.has(idx));
          const poolWeights = weights.filter((_, idx) => !usedIndexes.has(idx));
          const chosen = chooseWeightedRandom(pool, poolWeights, null);
          if (chosen) {
            const chosenIdx = eligible.indexOf(chosen);
            if (chosenIdx !== -1) usedIndexes.add(chosenIdx);
            selected.push(chosen);
          }
        }
        this.nextRewards.passives = selected;
      }

      return this.nextRewards.passives;
    },
    getAvailableSkills(): ISkill[]{
      if (!this.character) return [];

      const charLevel = this.character.level;
      const charSkills = this.character.skills;
      const charClass = this.character.class;

      if (this.nextRewards.skills.length === 0){
        this.nextRewards.skills = skills.filter(
          el => 
            charLevel >= (el.minCharLevel || 0) 
          && !(charSkills.find(f => f._identifier === el._identifier))
          && (!el.requiredClass || el.requiredClass && el.requiredClass.includes(charClass))
        ).toSorted(
          () => 0.5 - Math.random()
        ).slice(0, 3);
      }
      return this.nextRewards.skills;
    },

    getPassiveIds():string[]{
      if (!this.character) return [];

      return this.character.passives.map(el => el._identifier);
    },

    getSkillIds():string[]{
      if (!this.character) return [];

      return this.character.skills.map(el => el._identifier);
    },

    /**
     * Retrieves the current character
     * @returns {ICharacter | -1} The current character or -1 if none exists
     */
    getCombatStats(): ICombatStat | ErrorNumber.NOT_FOUND {
      logger(`Retrieving character: ${this.character?.name || 'none'}`);
      if (!this.character) return ErrorNumber.NOT_FOUND;

      let retval: ICombatStat = {
        health: this.character.stats.currentHealth,
        mana: this.character.stats.currentMana,
        maxHealth: this.character.stats.health,
        maxMana: this.character.stats.mana,
        healthRegen: BaseStats.BASE_HEALTH_REGEN,
        manaRegen: BaseStats.BASE_MANA_REGEN,
        mitigation: resolveMitigation(this.character),
        attributes: {
          fortitude: this.character.stats.fortitude,
          fortune: this.character.stats.fortune,
          wrath: this.character.stats.wrath,
          affinity: this.character.stats.affinity
        },
        accuracy: 100,
        criticalStrike: 0,
        baseDamagePerTick: BaseStats.BASE_DAMAGE,
        damagePerTick: 0,
        damage: {
          physical: 0,
          elemental: {
            fire: 0,
            cold: 0,
            lightning: 0
          },
          corruption: {
            void: 0,
            mental: 0
          }
        }
      };

      let localEvasion = 0;
      let localArmor = 0;

      //---------------------
      // ADD all ITEM values
      //---------------------

      // Check all equipped items for bonuses
      Object.values(this.character.equipment).forEach(item => {
        if (!item?.itemDetails?.affixes) return;

        // Check all affix types (embedded, prefix, suffix)
        const itemAffixes = [
          ...item.itemDetails.affixes.embedded,
          ...item.itemDetails.affixes.prefix,
          ...item.itemDetails.affixes.suffix
        ];

        

        itemAffixes.forEach(affix => {
          // Look up the full affix definition to get the type
          const affixDef = allAffixesById.get(affix.id);
          if (!affixDef) return;

          let multiplier = 1;

          switch (affixDef.type) {
            case AffixType.EMBEDDED:
              multiplier = resolveAffixMultiplierValue(affix, item.itemDetails?.affixes.embedded || []);
              break;
            case AffixType.PREFIX:
              multiplier = resolveAffixMultiplierValue(affix, item.itemDetails?.affixes.prefix || []);
              break;
            case AffixType.SUFFIX:
              multiplier = resolveAffixMultiplierValue(affix, item.itemDetails?.affixes.suffix || []);
              break;
          
            default:
              break;
          }

          // console.log(`Multi: ${multiplier}`);
          // console.log(`Cat: ${affix.category}`);

          switch (affix.category) {
            case AffixCategory.LIFE:
              if (affixDef.type === AffixType.PREFIX) {
                retval.healthRegen += (getAffixValue(affix) * multiplier);
              } else if (affixDef.type === AffixType.SUFFIX) {
                retval.health += (getAffixValue(affix) * multiplier);
                retval.maxHealth += (getAffixValue(affix) * multiplier);
              }
              break;
            case AffixCategory.MANA:
              if (affixDef.type === AffixType.PREFIX) {
                retval.manaRegen += (getAffixValue(affix) * multiplier);
              } else if (affixDef.type === AffixType.SUFFIX) {
                retval.mana += (getAffixValue(affix) * multiplier);
                retval.maxMana += (getAffixValue(affix) * multiplier);
              }
              break;
            case AffixCategory.ATTRIBUTE:
              // Check the affix tags to determine which attribute it affects
              if (affixDef.tags.includes('fortitude')) {
                retval.attributes.fortitude += (getAffixValue(affix) * multiplier);
              } else if (affixDef.tags.includes('fortune')) {
                retval.attributes.fortune += (getAffixValue(affix) * multiplier);
              } else if (affixDef.tags.includes('wrath')) {
                retval.attributes.wrath += (getAffixValue(affix) * multiplier);
              } else if (affixDef.tags.includes('affinity')) {
                retval.attributes.affinity += (getAffixValue(affix) * multiplier);
              }
              break;
            case AffixCategory.ARMOR:
              // Physical damage from prefix, Armour Value from EMBEDDED, phys-resist as suffix
              if (affixDef.type === AffixType.EMBEDDED) {
                localArmor += (getAffixValue(affix) * multiplier);
              } else if (affixDef.type === AffixType.PREFIX) {
                retval.damage.physical += (resolveAverageOfRange(getAffixValueRange(affix)) * multiplier);
              } else if (affixDef.type === AffixType.SUFFIX) {
                const mitigation = retval.mitigation.find(m => m.key === 'physical');
                if (mitigation) {
                  mitigation.value += (getAffixValue(affix) * multiplier);
                }
              }
              break;
            case AffixCategory.DEFENSE:
              // Physical damage from prefix, phys resistance from suffix
              if (affixDef.type === AffixType.SUFFIX) {
                const mitigation = retval.mitigation.find(m => m.key === 'physical');
                if (mitigation) {
                  mitigation.value += (getAffixValue(affix) * multiplier);
                }
              }
              break;
            case AffixCategory.EVASION:
              // evasion only on embedded
              if (affixDef.type === AffixType.EMBEDDED) {
                localEvasion += (getAffixValue(affix) * multiplier);
              }
              break;
            case AffixCategory.ELEMENTAL:
              // Elemental damage from prefix/suffix, resistance from embedded
              if (affixDef.type === AffixType.EMBEDDED) {
                // Handle elemental resistances
                if (affixDef.tags.includes('elemental') && affixDef.tags.includes('resistance')){
                  const mitigationFire = retval.mitigation.find(m => m.key === 'elemental_fire');
                  if (mitigationFire) {
                    mitigationFire.value += (getAffixValue(affix) * multiplier);
                  }
                  const mitigationCold = retval.mitigation.find(m => m.key === 'elemental_cold');
                  if (mitigationCold) {
                    mitigationCold.value += (getAffixValue(affix) * multiplier);
                  }
                  const mitigationLightning = retval.mitigation.find(m => m.key === 'elemental_lightning');
                  if (mitigationLightning) {
                    mitigationLightning.value += (getAffixValue(affix) * multiplier);
                  }

                } else if (affixDef.tags.includes('fire')) {
                  const mitigation = retval.mitigation.find(m => m.key === 'elemental_fire');
                  if (mitigation) {
                    mitigation.value += (getAffixValue(affix) * multiplier);
                  }
                } else if (affixDef.tags.includes('cold')) {
                  const mitigation = retval.mitigation.find(m => m.key === 'elemental_cold');
                  if (mitigation) {
                    mitigation.value += (getAffixValue(affix) * multiplier);
                  }
                } else if (affixDef.tags.includes('lightning')) {
                  const mitigation = retval.mitigation.find(m => m.key === 'elemental_lightning');
                  if (mitigation) {
                    mitigation.value += (getAffixValue(affix) * multiplier);
                  }
                }
              } else {
                // Handle elemental damage
                if (affixDef.tags.includes('fire')) {
                  retval.damage.elemental.fire += (resolveAverageOfRange(getAffixValueRange(affix)) * multiplier);
                } else if (affixDef.tags.includes('cold')) {
                  retval.damage.elemental.cold += (resolveAverageOfRange(getAffixValueRange(affix)) * multiplier);
                } else if (affixDef.tags.includes('lightning')) {
                  retval.damage.elemental.lightning  += (resolveAverageOfRange(getAffixValueRange(affix)) * multiplier);
                }
              }
              break;
              case AffixCategory.CRITICAL:
                // evasion only on PREFIX
                if (affixDef.type === AffixType.PREFIX) {
                  retval.criticalStrike += (getAffixValue(affix) * multiplier);
                }
                break;
          }
        });

        if (item.itemDetails.baseDetails){
          const baseAffix = item.itemDetails.baseDetails;
          switch (baseAffix.affix) {
            // ARMOUR
            case BaseItemAffix.ARM_ARMOR:
              localArmor += getAffixValue(baseAffix);
              break;
            case BaseItemAffix.ARM_EVASION:
              localEvasion += getAffixValue(baseAffix);
              break;
            case BaseItemAffix.ARM_HEALTH:
              retval.health += getAffixValue(baseAffix);
              retval.maxHealth += getAffixValue(baseAffix);
              break;

            // WEAPON - this should overwrite your BASE attack value
            case BaseItemAffix.WEA_PHYS_PHYSICAL:
            case BaseItemAffix.WEA_COLD:
            case BaseItemAffix.WEA_FIRE:
            case BaseItemAffix.WEA_LIGHTNING:
              retval.baseDamagePerTick = getAffixValue(baseAffix);
              break;
          
            // ACCESSORY
            case BaseItemAffix.ACC_RES_PHYSICAL:{
              const mitigation = retval.mitigation.find(m => m.key === 'physical');
              if (mitigation) {
                mitigation.value += getAffixValue(baseAffix);
              }
              break;
            }
            case BaseItemAffix.ACC_RES_COLD:{
              const mitigation = retval.mitigation.find(m => m.key === 'elemental_cold');
              if (mitigation) {
                mitigation.value += getAffixValue(baseAffix);
              }
              break;
            }
            case BaseItemAffix.ACC_RES_FIRE:{
              const mitigation = retval.mitigation.find(m => m.key === 'elemental_fire');
              if (mitigation) {
                mitigation.value += getAffixValue(baseAffix);
              }
              break;
            }
            case BaseItemAffix.ACC_RES_LIGHTNING:{
              const mitigation = retval.mitigation.find(m => m.key === 'elemental_lightning');
              if (mitigation) {
                mitigation.value += getAffixValue(baseAffix);
              }
              break;
            }

            default:
              logger(`non-configured affix definition: ${baseAffix.affix}`);
              break;
          }
        }

      });

      //------------------------------
      // ADD all values from PASSIVES
      //------------------------------
      /* passives skills from character progression */

      // 1st pass for NON multiplicative entries.
      for (let index = 0; index < this.character.passives.length; index++) {
        const passive: IPassive = this.character.passives[index];
        // skip multiplicative in first pass
        if (passive.effect.type === AffixTypes.MULTIPLICATIVE){
          continue;
        }
        const target = passive.effect.target;
        switch (target) {
          case Attributes.AFFINITY:
          case Attributes.FORTITUDE:
          case Attributes.FORTUNE:
          case Attributes.WRATH:
            retval.attributes[target] = resolveStatChangeFromPassive(retval.attributes[target] , passive.effect);
            
            break;
          case Attributes.HEALTH:
            retval.health = resolveStatChangeFromPassive(retval.health , passive.effect);
            retval.maxHealth = resolveStatChangeFromPassive(retval.maxHealth , passive.effect);

            break;
          case Attributes.MANA:
            retval.mana = resolveStatChangeFromPassive(retval.mana , passive.effect);
            retval.maxMana = resolveStatChangeFromPassive(retval.maxMana , passive.effect);

            break;
          case AffixCategory.ARMOR:
            localArmor = resolveStatChangeFromPassive(localArmor, passive.effect);

            break;
          case AffixCategory.EVASION:
            localEvasion = resolveStatChangeFromPassive(localEvasion, passive.effect);

            break;
          case AffixCategory.DEFENSE:
            if (passive.effect.subTarget){
              switch (passive.effect.subTarget) {
                case AffixSubCategory.DEFLECTION:
                  localArmor += getArmourForDeflectionCount(passive.effect.change, this.character.level);
                  
                  break;
                case AffixSubCategory.DODGE:
                  localEvasion += getAdditionalEvasionForDodgeIncrease(passive.effect.change, this.character.level, localEvasion);
                  break;
              
                default:
                  break;
              }
            }

            break;
        
          default:
            break;
        }
      }
      
      // 2nd pass for only multiplicative entries.
      for (let index = 0; index < this.character.passives.length; index++) {
        const passive: IPassive = this.character.passives[index];
        if (passive.effect.type !== AffixTypes.MULTIPLICATIVE){
          continue;
        }

        const target = passive.effect.target;
        switch (target) {
          case Attributes.AFFINITY:
          case Attributes.FORTITUDE:
          case Attributes.FORTUNE:
          case Attributes.WRATH:
            logger(`passive effecting: ${target}`);
            retval.attributes[target] = resolveStatChangeFromPassive(retval.attributes[target] , passive.effect);
            
            break;
          case Attributes.HEALTH:
            retval.health = resolveStatChangeFromPassive(retval.health , passive.effect);
            retval.maxHealth = resolveStatChangeFromPassive(retval.maxHealth , passive.effect);
            
            break;
          case Attributes.MANA:
            retval.mana = resolveStatChangeFromPassive(retval.mana , passive.effect);
            retval.maxMana = resolveStatChangeFromPassive(retval.maxMana , passive.effect);

            break;
          case AffixCategory.ARMOR:          
            localArmor = resolveStatChangeFromPassive(localArmor, passive.effect);

            break;
          case AffixCategory.EVASION:
            localEvasion = resolveStatChangeFromPassive(localEvasion, passive.effect);
            
            break;
        
          default:
            break;
        }
        
      }



      //------------------------------------------------
      // ADD all values from temporary buffs / de-buffs
      //------------------------------------------------
      /* effects from mobs (poison, lower resists) . . .  */

      // additive
      this.character.temporalEffects.forEach(eff => {
        if (eff.effect.type !== AffixTypes.MULTIPLICATIVE){
          switch (eff.effect.target) {
            case Attributes.WRATH:
              retval.attributes.wrath = Math.floor(resolveAffixChange(retval.attributes.wrath, eff.effect.change, eff.effect.type));
              break;
            
            case Attributes.HEALTH: 
              retval.health = Math.floor(resolveAffixChange(retval.health, eff.effect.change, eff.effect.type));
              retval.maxHealth = Math.floor(resolveAffixChange(retval.maxHealth, eff.effect.change, eff.effect.type));
              break;

            case AffixCategory.PHYSICAL:
              retval.damage.physical = Math.floor(resolveAffixChange(retval.damage.physical, eff.effect.change, eff.effect.type));

              break;
            
            case AffixCategory.ELEMENTAL:{
              const value = Math.floor(resolveAffixChange(retval.damage.physical, eff.effect.change, eff.effect.type)) / 3;
              retval.damage.elemental.fire = Math.floor(retval.damage.elemental.fire +value);
              retval.damage.elemental.cold = Math.floor(retval.damage.elemental.cold +value);
              retval.damage.elemental.lightning = Math.floor(retval.damage.elemental.lightning +value);
              break;
            }

            default:
              break;
          }
        }
      });

      // multiplicative
      this.character.temporalEffects.forEach(eff => {
        if (eff.effect.type === AffixTypes.MULTIPLICATIVE){
          switch (eff.effect.target) {
            case Attributes.WRATH:
              retval.attributes.wrath = Math.floor(resolveAffixChange(retval.attributes.wrath, eff.effect.change, eff.effect.type));
              break;
            
            case Attributes.HEALTH: 
              retval.health = Math.floor(resolveAffixChange(retval.health, eff.effect.change, eff.effect.type));
              retval.maxHealth = Math.floor(resolveAffixChange(retval.maxHealth, eff.effect.change, eff.effect.type));
              break;

            case AffixCategory.PHYSICAL:
              retval.damage.physical = Math.floor(resolveAffixChange(retval.damage.physical, eff.effect.change, eff.effect.type));

              break;
            
            case AffixCategory.ELEMENTAL:{
              logger(`Temporal effect (x): ${JSON.stringify(eff)}`);
              switch (eff.name) {
                case exileClassCritSkillName[ExileClass.SPELLSWORD]:{
                  const MIN_INCREASE_VALUE = 5;

                  if (retval.damage.elemental.fire > 25){
                    retval.damage.elemental.fire = Math.floor(resolveAffixChange(retval.damage.elemental.fire, eff.effect.change, eff.effect.type));
                  } else {
                    retval.damage.elemental.fire = Math.floor(retval.damage.elemental.fire + MIN_INCREASE_VALUE);
                  }
                  if (retval.damage.elemental.cold > 25){
                    retval.damage.elemental.cold = Math.floor(resolveAffixChange(retval.damage.elemental.cold, eff.effect.change, eff.effect.type));
                  } else {
                    retval.damage.elemental.cold = Math.floor(retval.damage.elemental.cold + MIN_INCREASE_VALUE);
                  }
                  if (retval.damage.elemental.lightning > 25){
                    retval.damage.elemental.lightning = Math.floor(resolveAffixChange(retval.damage.elemental.lightning, eff.effect.change, eff.effect.type));
                  } else {
                    retval.damage.elemental.lightning = Math.floor(retval.damage.elemental.lightning + MIN_INCREASE_VALUE);
                  }
                  
                  break;
                }
              
                default:
                  break;
              }
              break;
            }

            case AffixCategory.DEFENSE:{
              switch (eff.name) {
                case `${exileClassCritSkillName[ExileClass.CHAOS_MAGE]} - Deflection`:{
                  if (this.character){
                    logger(`ABYSSAL: Deflection`);
                    // give armour amount relative to 2 levels of deflection 
                    // this.character.level
                    logger(`ABYSSAL: Armour: ${localArmor}, adding: ${getArmourForDeflectionCount(eff.effect.change, this.character.level)}`);
                    localArmor += getArmourForDeflectionCount(eff.effect.change, this.character.level);
                  }
                  break;
                }

                case `${exileClassCritSkillName[ExileClass.CHAOS_MAGE]} - Dodge`:{
                  if (this.character){
                    logger(`ABYSSAL: Dodge`);
                    // give armour amount relative to 2 levels of deflection 
                    // this.character.level
                    logger(`ABYSSAL: Dodge: ${localEvasion}, adding: ${getAdditionalEvasionForDodgeIncrease(eff.effect.change, this.character.level, localEvasion)}`);

                    localEvasion += getAdditionalEvasionForDodgeIncrease(eff.effect.change, this.character.level, localEvasion)
                  }
                  break;
                }
                default:
                  break;
              }
              break;
            }

          default:
            break;
          }
        }
      });


      //-------------------------------------
      // Finally add run post addition logic
      //-------------------------------------

      retval.attributes.affinity = Math.floor(retval.attributes.affinity);
      retval.attributes.fortitude = Math.floor(retval.attributes.fortitude);
      retval.attributes.fortune = Math.floor(retval.attributes.fortune);
      retval.attributes.wrath = Math.floor(retval.attributes.wrath);

      // Base damage from wrath
      retval.damage.physical += Math.floor(retval.attributes.wrath / 2);
      
      retval.damagePerTick = 
        retval.baseDamagePerTick + 
        retval.damage.physical + 
        retval.damage.elemental.fire + 
        retval.damage.elemental.cold + 
        retval.damage.elemental.lightning + 
        retval.damage.corruption.void + 
        retval.damage.corruption.mental;


      const mitigationEvasion = retval.mitigation.find(m => m.key === 'evasion');
      if (mitigationEvasion) {
        mitigationEvasion.value = calculateDodgeChance(localEvasion, this.character.level);
      }
      const mitigationArmor = retval.mitigation.find(m => m.key === 'armor');
      if (mitigationArmor && this.character) {
        mitigationArmor.value = localArmor;
        retval.deflection = calculateDeflectionAttempts(localArmor, this.character.level);
      }

      
      retval.health = Math.floor(retval.health);
      retval.maxHealth = Math.floor(retval.maxHealth);
      retval.mana = Math.floor(retval.mana);
      retval.maxMana = Math.floor(retval.maxMana);

      return retval;
    },

    /**
     * Calculates damage reduction based on fortitude
     * @returns {number} Damage reduction percentage (0-1)
     */
    getDamageReduction(): number {
      logger(`Calculating damage reduction for ${this.character?.name}`);
      if (!this.character) return 0;
      return Math.min(0.75, this.character.stats.fortitude / 100);
    },
  },

  actions: {
    restart(){
      logger('Restarting game state');
      this.runs = 0;
      this.difficulty = 'Easy';
      this.character = null;
      this.isDead = false;
      this.knownLocations = [];
      this.autoSalvageTier = ItemTiers.BASIC;
      this.autoSalvage = false;
      this.saveState();
    },
    /**
     * Initializes a new game run with the specified character
     * @param character - The character to initialize the game with
     */
    init(character: ICharacter): void {
      logger(`Initializing game with character: ${character.name} (${character.class})`);
      
      this.runs = 0;
      this.character = _cloneDeep(character); // Create a new object to ensure reactivity
      this.isDead = false;

      // reset previous skills-list
      this.nextRewards.skills = [];
      // auto select a skill
      const starters = this.getAvailableSkills;
      // logger(`${JSON.stringify(starters)}`);
      const randomStarterSkill = starters[Math.floor(Math.random() * starters.length)];
      if (randomStarterSkill && this.character) {
        randomStarterSkill.isEnabled = true;
        randomStarterSkill.setTrigger = randomStarterSkill.triggerStates[0];
        this.character.skills.push(randomStarterSkill);
      }

      this.knownLocations = [levels[0]];

      nextTick(() => {
        this.nextRewards.passives = [];
        this.nextRewards.skills = [];
        this.saveState();
      });

      this.saveState();
    },

    setAutoSalvage(enabled: boolean): void{
      this.autoSalvage = enabled;
      this.saveState();
    },

    setAutoSalvageTier(tier: ItemTiers): void{
      this.autoSalvageTier = tier;
      this.saveState();
    },
    addRefresh(): void{
      if(! this.character) return;

      this.character.refreshes += 1;
    },

    refreshPassives(): void{
      if (!this.character) return;

      if (this.character.refreshes !== undefined && this.character.refreshes > 0){
        this.character.refreshes -= 1;
        this.nextRewards.passives = [];
      }
    },
    refreshSkills(): void{
      if (!this.character) return;

      if (this.character.refreshes !== undefined && this.character.refreshes > 0){
        this.character.refreshes -= 1;
        this.nextRewards.skills = [];
      }
    },

    addLocation(level: ILevel): void{
      if (level && this.knownLocations){
        this.knownLocations.push(level);
      }

      this.saveState();
    },

    addLocationIff(level: ILevel, condition: AddLevelCondition): void{
      switch (condition) {
        case AddLevelCondition.NOT_EXISTING:{
          const existing = this.knownLocations.find(el => el._identifier === level._identifier);
          if (!existing){
            return this.addLocation(level);
          }
          return;
        }
        default:
          break;
      }
    },

    removeLocation(level: ILevel, force: boolean = false): void{
      if (this.knownLocations){
        const locationIndex =  this.knownLocations.findIndex(el => el._identifier === level._identifier);
        if (locationIndex !== -1 && (this.knownLocations[locationIndex].uses === 0 || force)){
          this.knownLocations.splice(locationIndex,1);
        }
      }
    },

    addTemporalEffect(effect: ITemporalEffect, overwrite = false): void{
      if(!this.character) return;
      logger(`New temporal for: ${effect.name} with timing: ${effect.remaining} ${effect.timing}'s`);
      if (overwrite){
        const temp = this.character.temporalEffects.findIndex(el => el.name === effect.name);
        if (temp !== -1){
          this.character.temporalEffects[temp] = {...effect};
          return;
        }
      }
      this.character.temporalEffects.push(effect);
    },

    addCooldown(effect: ICooldown): void{
      if(!this.character) return;
      logger(`New cooldown for: ${effect.name} with timing: ${effect.remaining} ${effect.timing}'s`);
      this.character.cooldowns.push(effect);
    },

    processGameTick(timing: SkillTiming): void{
      if (!this.character) return;
      logger(`processGameTick(${timing})`);


      // Cooldowns
      const toRemove: number[] = [];

      this.character.cooldowns.forEach((el, idx) => {
        if (el.timing === timing){
          el.remaining--;
          if (el.remaining <= 0){
            toRemove.push(idx);
          }
        }
      });

      toRemove.toReversed().forEach(idx => {
        logger(`Purge index at [${idx}]`);
        delete this.character?.cooldowns[idx];
      })

      if(toRemove.length > 0){
        this.character.cooldowns = this.character.cooldowns.filter(e=> e);
        logger(`updated CD's: ${JSON.stringify(this.character.cooldowns)})`);
      }
      
      this.saveState();


      // Temporals
      const toRemoveTemporals: number[] = [];      

      this.character.temporalEffects.forEach((el, idx) => {
        if (el.timing === timing){
          el.remaining--;
          if (el.remaining <= 0){
            toRemoveTemporals.push(idx);
          }
        }
      });

      toRemoveTemporals.toReversed().forEach(idx => {
        logger(`Purge index at [${idx}]`);
        delete this.character?.temporalEffects[idx];
      })

      if(toRemoveTemporals.length > 0){
        this.character.temporalEffects = this.character.temporalEffects.filter(e=> e);
        logger(`updated Temporal's: ${JSON.stringify(this.character.temporalEffects)})`);
      }

      // recovery
      const stats = this.getCombatStats;
      if (stats !== ErrorNumber.NOT_FOUND){
        this.heal(Math.max(stats.healthRegen,0));
        this.recoverMana(Math.max(stats.manaRegen,0));
      }

      this.saveState();
    },

    setSkillTrigger(mySkillIndex: number, trigger: SkillTriggers): void{
      if(!this.character)return;
      const skill = this.character.skills[mySkillIndex];

      skill.setTrigger = trigger;
      this.saveState();
    },

    addSkill(skillIdentifier: string): void{
      logger(`Attempting to add skill: [${skillIdentifier}]`);
      if(
          !this.character 
        || this.character.pendingRewards.skills < 1 
        || this.character.skills.find(p => p._identifier === skillIdentifier) !== undefined
      ) return;

      const skill = skills.find(p => p._identifier === skillIdentifier);

      if(skill){
        skill.setTrigger = skill.triggerStates[0];
        this.character.skills.push(skill);
        this.character.pendingRewards.skills--;
        nextTick(() => {
          this.nextRewards.skills = [];
          this.saveState();
        });
        this.saveState();
      }
    },

    addPassive(passiveIdentifier: string): void{
      logger(`Attempting to add passive: [${passiveIdentifier}]`);
      if(
          !this.character 
        || this.character.pendingRewards.passives < 1 
        || this.character.passives.find(p => p._identifier === passiveIdentifier) !== undefined
      ) return;

      const passive = passives.find(p => p._identifier === passiveIdentifier);

      if(passive){
        this.character.passives.push(passive);
        this.character.pendingRewards.passives--;
        nextTick(() => {
          this.nextRewards.passives = [];
          this.saveState();
        });
        this.saveState();
      }
    },

    /**
     * Updates character stats
     * @param stats - The stats to update
     */
    updateStats(stats: Partial<ICharacterStats>): void{
      if (!this.character) return;
      logger(`Updating stats for ${this.character.name}`);
      this.character.stats = { ...this.character.stats, ...stats };
      this.saveState();
    },

    increaseStat(stat: Attributes, change: number): void{
      if (!this.character) return;
      logger(`Updating stat(${stat}) by ${change}`);
      this.character.stats[stat] += change;
      this.saveState();
    },

    /**
     * Takes damage from the character's health
     * @param amount - Amount of damage to take
     * @param applyReduction - optional - Whether to apply damage reduction from fortitude
     */
    takeDamage(amount: number, applyReduction: boolean = true): void{
      if (!this.character) return;
      amount = Math.floor(amount);
      logger(`Taking ${amount} damage`);
      // console.log('takeDamage: Initial health', this.character.stats.currentHealth);
      
      let finalDamage = amount;
      if (applyReduction) {
        const reduction = this.getDamageReduction;
        finalDamage = Math.floor(amount * (1 - reduction));
      }
      // console.log('takeDamage: finalDamage', finalDamage);
      
      const newHealth = Math.max(0, this.character.stats.currentHealth - finalDamage);
      // console.log('takeDamage: newHealth calculated', newHealth);
      this.updateStats({ currentHealth: newHealth });
      // console.log('takeDamage: health after updateStats', this.character.stats.currentHealth);
      
      // Check if character died from this damage
      if (newHealth <= 0) {
        this.isDead = true;
        this.character.stats.currentHealth = 0; // Ensure health is set to 0 when dead
        this.saveState();
      }
    },

    /**
     * Heals the character's health
     * @param amount - Amount of health to restore
     */
    heal(amount: number, isPercent: boolean = false): void{
      const stats = this.getCombatStats;
      if (!this.character || stats === ErrorNumber.NOT_FOUND) return;
      
      let newHealth;
      if (isPercent) {
        newHealth = Math.min(this.character.stats.health, this.character.stats.currentHealth + Math.floor(this.character.stats.health * (amount / 100)));
      }else{
        newHealth = Math.min(this.character.stats.health, this.character.stats.currentHealth + amount);
      }
      logger(`Healing ${amount} health${isPercent ? ' %' : ''} as [${isPercent ? Math.floor(stats.maxHealth * (amount / 100 )) : amount}]`);
      this.updateStats({ currentHealth: newHealth });
    },

    /**
     * Heals the character's health
     * @param amount - Amount of health to restore (can be negative)
     * @param isPercent optional - whether to treat the amount as percentile increase
     */
    recoverMana(amount: number, isPercent: boolean = false): void{
      const stats = this.getCombatStats;
      if (!this.character || stats === ErrorNumber.NOT_FOUND) return;
      
      let newMana;
      if (isPercent) {
        newMana = Math.min(this.character.stats.mana, this.character.stats.currentMana + Math.floor(this.character.stats.mana * (amount / 100)));
      }else{
        newMana = Math.min(this.character.stats.mana, this.character.stats.currentMana + amount);
      }
      logger(`Recovering ${amount} mana${isPercent ? ' %' : ''} as [${isPercent ? Math.floor(stats.maxMana * (amount / 100 )) : amount}]`);
      this.updateStats({ currentMana: newMana });
    },

    /**
     * Updates character gold
     * @param amount - Amount of health to restore (can be negative)
     * @param isGain optional - whether to treat the amount as increase or decrease
     */
    updateGold(amount: number, isGain = true): void{
      if (!this.character) return;
      logger(`Updating gold for ${this.character.name}: ${isGain? '' : '-'}${amount}`);
      if  (isGain){
        this.character.gold += amount;
      } else {
        this.character.gold -= amount;
      }
      this.saveState();
    },

    /**
     * Adds experience to the character and handles level up if needed
     * @param amount - Amount of experience to add
     */
    addExperience(amount: number): void{
      logger(`Adding ${amount} experience to ${this.character?.name}`);
      if (!this.character) return;
      
      this.character.experience += amount;
      const expNeeded = this.character.level * 100;
      
      if (this.character.experience >= expNeeded) {
        this.levelUp();
      }
      
      this.saveState();
    },

    /**
     * Handles character level up and attribute increases
     */
    levelUp(): void{
      if (!this.character) return;
      
      logger(`Leveling up ${this.character.name} to level ${this.character.level + 1}`);
      this.character.level++;
      this.character.experience = 0;
      
      // Generate new stat bonuses for level up
      const statBonus = generateClassStats(this.character.class);
      
      // Apply the new stat bonuses
      Object.entries(statBonus).forEach(([stat, bonus]) => {
        this.character!.stats[stat as keyof ICharacterStats] += bonus;
      });


      // check against 1 as we have already incremented char level
      // custom
      // skill on creation: level-1
      // passive on: level-2
      // else
      // passive every 3 levels 
      //  skill  every 4 levels
      // for any fallthrough levels add stat inc screen
      if (this.character.level === 2) {
        this.character.pendingRewards.passives++;
      } else if (
        (this.character.level % 4 === 1 && this.getAvailableSkills.length > this.character.pendingRewards.skills ) || 
        (this.character.level % 3 === 1 && this.getAvailablePassives.length > this.character.pendingRewards.passives)
      ){
        if (this.character.level % 4 === 1) {
          this.character.pendingRewards.skills++;
        } 
        // skip level-3 as we just got our forced level-2 one
        if (this.character.level !== 3 && this.character.level % 3 === 1) {
          this.character.pendingRewards.passives++;
        }
      } else {
        this.character.pendingRewards.stats++;
      }
      
      logger(`Character leveled up to ${this.character.level}`);
      this.saveState();
    },
    addSpecificLoot(_loot: { type: string; amount: number }[]): void{
      if (!this.character) return;
      logger(`Adding custom loot for char.`);

      this.saveState();
    },

    addLoot(amount: number, areaLevel: number, levelMultiplier: number, worldAutoSalvage:boolean, lootTags?: LootType[]): void{
      if (!this.character) return;
      logger(`Adding ${amount} loot items for ${this.character.name}`);

      if (areaLevel === -1){
        areaLevel = this.character.level;
      }

      // Initialize loot array if it doesn't exist
      if (!this.character.loot) {
        this.character.loot = [];
      }

      // Calculate fortune multiplier (10 is baseline, exponential scaling capped at 2x)
      const fortuneDelta = this.character.stats.fortune - 10;
      const fortuneMultiplier = Math.min(2, Math.max(0.5, 1 + (Math.pow(Math.abs(fortuneDelta), 1.5) / 100) * Math.sign(fortuneDelta)));
      const totalLoot = Math.floor(amount * fortuneMultiplier * levelMultiplier);

      // Generate random loot items
      for (let i = 0; i < totalLoot; i++) {
        // Generate a random item type using weighted system if loot tags are provided
        const type: ItemBase = lootTags ? getWeightedItemType(lootTags) : allItemTypes[Math.floor(Math.random() * allItemTypes.length)];

        const tier = generateItemTier(this.character.level);

        // automatic salvage logic
        if (worldAutoSalvage && this.autoSalvage && (tier === this.autoSalvageTier || allItemTiers.indexOf(tier) < allItemTiers.indexOf(this.autoSalvageTier)))  {
          const lootValue = ITEM_TIER_COSTS[tier] / 10;

          this.updateGold(lootValue);
          logger(`Auto Salvaged a ${tier} item for ${lootValue} gold`);
          continue;
        }

        // const id = generateRandomId(); // Temporary name until identified;
        const id = smearWordIntoId(type.split(' ')[0]); // Temporary name until identified;
        const iLevel = generateItemLevel(areaLevel);
        const newLoot: ILoot = {
          name: id,
          _identifier: id,
          iLvl: iLevel,
          type: type, // Set the type here
          identified: false,
          _hidden: {
            isCursed: Math.random() < 0.05, // 5% chance to be cursed
            isCorrupted: Math.random() < 0.02, // 2% chance to be corrupted
            isVoidTouched: Math.random() < 0.01, // 1% chance to be voidTouched
          },
          itemDetails: {
            tier,
            mutations: [],
            affixes: {
              embedded: [],
              prefix: [],
              suffix: []
            }
          }
        };

        if (newLoot.itemDetails?.tier === 'basic'){
          this._identifyItem(newLoot);
        }
        
        this.character.loot.push(newLoot);
      }

      this.saveState();
    },
    attemptSalvageAll(): void{
      logger('attemptSalvageAll');
      if (!this.character || this.character.loot.length <= 0) return;

      for (let index = this.character.loot.length -1; index >= 0; index--) {
        const loot = this.character.loot[index];

        if(! loot.itemDetails){
          continue;
        }
        const lootValue = ITEM_TIER_COSTS[loot.itemDetails.tier] / 10;
  
        this.updateGold(lootValue);

        this.character.loot.splice(index, 1);
      }
    },
    attemptIdAll(): void{
      logger('attemptIdAll');
      if (!this.getAffordIdAll || !this.character || this.character.loot.length <= 0) return;

      this.character?.loot.forEach(el => {
        this._identifyItem(el);
      });
    },
    /**
     * Internal helper method to handle item identification logic
     * @param loot - The item to identify
     * @returns Whether identification was successful
     */
    _identifyItem(loot: ILoot): boolean {
      if (loot.identified) return false;

      // Calculate identification cost based on tier
      const tier = loot.itemDetails?.tier || 'basic';
      const totalCost = ITEM_TIER_COSTS[tier];

      // Check if character has enough gold
      if (!this.character || this.character.gold < totalCost) {
        logger(`Not enough gold to identify item. Cost: ${totalCost}, Available: ${this.character?.gold || 0}`);
        return false;
      }

      // Deduct the cost
      this.character.gold -= totalCost;
      
      // Generate affixes based on tier
      const affixes = generateAffixesForTierAndType(tier, loot.type, loot.iLvl);
      
      // Update item details with generated affixes
      loot.itemDetails = {
        tier,
        mutations: loot.itemDetails?.mutations || [],
        baseDetails: resolveBaseAffixFromTypeAndTier(tier, loot.type, loot.iLvl),
        affixes: {
          embedded: affixes.embedded,
          prefix: affixes.prefix,
          suffix: affixes.suffix
        }
      };

      // Generate item name based on affixes
      const prefixName = affixes.prefix.length > 0 ? `${affixes.prefix[0].id.split('_')[1].charAt(0).toUpperCase() + affixes.prefix[0].id.split('_')[1].slice(1)} ` : '';
      const suffixName = affixes.suffix.length > 0 ? ` of ${affixes.suffix[0].id.split('_')[1].charAt(0).toUpperCase() + affixes.suffix[0].id.split('_')[1].slice(1)}` : '';
      const embeddedName = affixes.embedded.length > 0 ? `${affixes.embedded[0].id.split('_')[1].charAt(0).toUpperCase() + affixes.embedded[0].id.split('_')[1].slice(1)} ` : '';
      
      // Use the stored type in the name generation
      loot.name = `${prefixName}${embeddedName}${tier.charAt(0).toUpperCase() + tier.slice(1)} ${loot.type}${suffixName}`;
      
      // Mark as identified
      loot.identified = true;
      
      return true;
    },

    identifyLoot(lootIndex: number): void{
      if (!this.character || !this.character.loot[lootIndex]) return;
      logger(`Identifying loot[${lootIndex}]`);
      
      if (this._identifyItem(this.character.loot[lootIndex])) {
        this.saveState();
      }
    },

    identifyStashItem(stashIndex: number): void{
      if (!this.stash || !this.stash[stashIndex]) return;
      logger(`Identifying stash item at index ${stashIndex}`);
      
      if (this._identifyItem(this.stash[stashIndex])) {
        this.saveState();
      }
    },

    /**
     * Moves an item from inventory to stash
     * @param lootIndex - Index of the item in inventory
     */
    stashItem(lootIndex: number): void{
      if (!this.stash || !this.character || !this.character.loot[lootIndex]) return;
      logger(`Stashing item at index ${lootIndex}`);
      
      const item = this.character.loot[lootIndex];
      this.stash.push(item);
      this.character.loot.splice(lootIndex, 1);
      this.saveState();
    },

    /**
     * Moves an item from stash to inventory
     * @param stashIndex - Index of the item in stash
     */
    unstashItem(stashIndex: number): void{
      if (!this.stash || !this.character || !this.stash[stashIndex]) return;
      logger(`Unstashing item at index ${stashIndex}`);
      
      const item = this.stash[stashIndex];
      this.character.loot.push(item);
      this.stash.splice(stashIndex, 1);
      this.saveState();
    },

    /**
     * Removes a specified number of loot items from the Stash
     * @param lootCount - The number of loot items to remove, or percentage if asPercent is true
     * @param asPercent optional - Whether lootCount should be treated as a percentage of total loot
     */
    removeStashLoot(lootCount:number, asPercent: boolean = false): number{
      if(!this.stash) return 0;
      let lootToLose = lootCount;
      if (asPercent){
        lootToLose = Math.floor(this.stash.length * (lootCount / 100));
      }
          
      // Randomly remove loot items
      if (lootToLose > 0) {
        for (let i = 0; i < lootToLose && this.stash.length > 0; i++) {
          const randomIndex = Math.floor(Math.random() * this.stash.length);
          this.stash.splice(randomIndex, 1);
        }
      }

      return lootToLose;
    },

    /**
     * Removes a specified number of loot items from the character's inventory
     * @param lootCount - The number of loot items to remove, or percentage if asPercent is true
     * @param asPercent optional - Whether lootCount should be treated as a percentage of total loot
     */
    removeLoot(lootCount:number, asPercent: boolean = false): number{
      if (!this.character) return 0;
      let lootToLose = lootCount;
      if (asPercent){
        lootToLose = Math.floor(this.character.loot.length * (lootCount / 100));
      }
          
      // Reduce loot array using splice
      if (lootToLose > 0) {
        for (let i = 0; i < lootToLose && this.character.loot.length > 0; i++) {
          const randomIndex = Math.floor(Math.random() * this.character.loot.length);
          this.character.loot.splice(randomIndex, 1);
        }
      }

      return lootToLose;
    },

    /**
     * Increments the number of completed runs
     * @param value optional - The number of runs to add (defaults to 1)
     */
    incrementRuns(value: number = 1): void{
      logger(`New run(s): ${value}`);
      this.runs += value;
      this.saveState();

      this.processGameTick(SkillTiming.RUN);
    },

    /**
     * Saves the current game state to storage
     */
    saveState(_cascade = true): void{
      logger('Saving game state');
      useGameState().$set(this.$state);
    },

    /**
     * Equips an item from inventory or stash
     * @param item - The item to equip
     * @param fromStash - Whether the item is from stash
     * @param isRightRing - Whether the item is from stash
     */
    equipItem(item: ILoot, fromStash: boolean = false, isRightRing = false): void{
      if (!this.character || !item.itemDetails || (!this.stash && fromStash)) return;
      logger(`Equipping item: ${item.name}${fromStash ? ' from stash' : ''}`);
      
      // Use the item's explicit type field
      const itemType = item.type;


      let slot = slotMap[itemType];
      
      // Special handling for rings
      if (itemType === 'Ring') {
        // If left hand is empty, use it
        if (!this.character.equipment.leftHand) {
          slot = 'leftHand';
        }
        // If right hand is empty, use it
        else if (!this.character.equipment.rightHand) {
          slot = 'rightHand';
        }
        // If both hands have rings, replace the left hand ring
        else {
          slot = isRightRing ? 'rightHand' : 'leftHand';
        }
      }

      if (!slot) {
        logger(`Cannot equip item of type ${item.type}. No corresponding equipment slot found.`);
        return;
      }

      // Remove item from source
      if (this.stash && fromStash) {
        const stashIndex = this.stash.findIndex(loot => loot === item);
        if (stashIndex !== ErrorNumber.NOT_FOUND) {
          this.stash.splice(stashIndex, 1);
        }
      } else {
        const lootIndex = this.character.loot.findIndex(loot => loot === item);
        if (lootIndex !== ErrorNumber.NOT_FOUND) {
          this.character.loot.splice(lootIndex, 1);
        }
      }

      // If there's already an item equipped, move it to inventory
      const currentItem = this.character.equipment[slot];
      if (currentItem) {
        this.character.loot.push(currentItem);
      }

      // Equip the new item
      this.character.equipment[slot] = item;
      
      this.saveState();
    },
    migrateSave(): void{
      logger('Running: migrateSave');
      logger('Ensure we are only running this on a miss-match');
      if (!this.isVersionSaveOutOfDate){
        return;
      }

      const currentState:IGameEngine = _cloneDeep(this.$state);
      logger(`Save-state: ${JSON.stringify(currentState)}`);

      const mutableNewState:IGameEngine = _cloneDeep(DEFAULT_STATE);
      logger(`Base-new-state: ${JSON.stringify(mutableNewState)}`);

      mutableNewState.runs = currentState.runs;
      mutableNewState.character = currentState.character;
      mutableNewState.stash = currentState.stash;
      mutableNewState.difficulty = currentState.difficulty;
      mutableNewState.isDead = currentState.isDead;

      // v0.1.0 - passives | skills char bindings
      if (mutableNewState.character && currentState.character && !Object.keys(currentState.character).includes('passives')){
        mutableNewState.character.passives = [];
      }
      if (mutableNewState.character && currentState.character && !Object.keys(currentState.character).includes('skills')){
        mutableNewState.character.skills = [];
      }
      if (mutableNewState.character && currentState.character && !Object.keys(currentState.character).includes('cooldowns')){
        mutableNewState.character.cooldowns = [];
      }
      if (mutableNewState.character && currentState.character && !Object.keys(currentState.character).includes('pendingRewards')){
        mutableNewState.character.pendingRewards = {skills: 0,passives: 0, stats: 0};
      }

      // v0.1.3
      if (mutableNewState.character && currentState.character?.pendingRewards &&  !Object.keys(currentState.character.pendingRewards).includes('stats')){
        mutableNewState.character.pendingRewards.stats = 0;
      }

      // v0.1.4 //force default state
      mutableNewState.autoSalvageTier = DEFAULT_STATE.autoSalvageTier;
      mutableNewState.autoSalvage = DEFAULT_STATE.autoSalvage;

      // v0.1.6
      if (mutableNewState && currentState.nextRewards){
        mutableNewState.nextRewards = currentState.nextRewards;
      }
      if (mutableNewState.character && currentState.character && !Object.keys(currentState.character).includes('refreshes')){
        mutableNewState.character.refreshes = 0;
      }

      logger(`merged-new-state: ${JSON.stringify(mutableNewState)}`);
     
      useGameState().clear();

      // iterate over all our merged 
      Object.entries(mutableNewState).forEach(([key, value]) => {
        if (Object.keys(this).includes(key)){
          (this as any)[key] = value;
        }
      });

      useGameState().$set(this.$state);

    }
  },
});

function logger(message: string): void{
  trace(`${LOGGING_PREFIX}${message}`);
}

function resolveMitigation(_character: ICharacter): IMitigation[]{
  const retval: IMitigation[] = _cloneDeep(DEFAULT_MITIGATION);

  return retval;
}

function resolveStatChangeFromPassive(rawStatValue: number, delta: IStatBuff ): number{
  switch (delta.type) {
    case AffixTypes.ADDITIVE:
      return rawStatValue + delta.change;
    case AffixTypes.MULTIPLICATIVE:
      return rawStatValue * (1 + (delta.change / 100));
    default:
      return rawStatValue;
  }
}
