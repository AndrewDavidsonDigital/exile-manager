import type { IBaseAffix, IItemAffix } from './affixTypes';
import { AffixLevelTiers, allAffixes, allAffixesById } from '@/data/affixes';
import type { AffixValue } from './affixTypes';
import { 
  AffixCategory,
  AffixSubCategory,
  AffixType,
  AffixTypes,
  Attributes,
  MonsterTypes,
  TIER_SEPARATOR,
  type ExileClassType, 
  type IAffix, 
  type ICharacterStats, 
  type IClassStatRanges, 
  type IMitigation, 
  type ItemBase, 
  type ItemMutationType, 
  type ItemTierType, 
  type MitigationType,
  type SkillActivationLayer, 
  type SkillResource, 
  type SkillTarget, 
  type SkillTiming, 
  type SkillTriggers,
} from './core';
import { isAffixRange } from './affixTypes';


/**
 * Represents a character's combat statistics and attributes
 */
export interface ICombatStat {
  baseDamagePerTick: number;
  damagePerTick: number;
  accuracy: number;
  health: number;
  mana: number;
  maxHealth: number;
  maxMana: number;
  healthRegen: number;
  manaRegen: number;
  criticalStrike: number;
  deflection?: number;
  mitigation: IMitigation[];  // TODO: this really needs to be a map; new Map<MitigationType, number>()
  attributes: {
    fortitude: number;    // Mental and physical endurance
    fortune: number;      // Luck and chance-based outcomes
    wrath: number;        // Combat prowess and rage
    affinity: number;     // Connection to magical forces
  };
  damage: {
    physical: number;     // Base physical damage
    elemental: {
      fire: number;       // Fire damage
      cold: number;       // Cold damage
      lightning: number;  // Lightning damage
    };
    corruption: {
      void: number;       // Void corruption damage
      mental: number;     // Mental corruption damage
    };
  };
}


/**
 * Represents a character's equipped items
 */
export interface ICharacterEquipment {
  weapon?: ILoot;
  head?: ILoot;
  shoulders?: ILoot;
  arms?: ILoot;
  chest?: ILoot;
  legs?: ILoot;
  feet?: ILoot;
  neck?: ILoot;
  leftHand?: ILoot;
  rightHand?: ILoot;
}

/**
 * Represents an item with its affixes and properties
 */
export interface IItem {
  tier: ItemTierType;              // magic common .... (total affix configuration)
  mutations: ItemMutationType[];   // types of affix subsets to allow
  baseDetails?: IBaseAffix,
  affixes: {
    embedded: Array<{
      id: string;
      category: AffixCategory;
      subCategory?: AffixSubCategory;
      value: AffixValue;
    }>;
    prefix: Array<{
      id: string;
      category: AffixCategory;
      subCategory?: AffixSubCategory;
      value: AffixValue;
    }>;
    suffix: Array<{
      id: string;
      category: AffixCategory;
      subCategory?: AffixSubCategory;
      value: AffixValue;
    }>;
  }
}

/**
 * Represents a loot item with its properties
 */
export interface ILoot {
  identified: boolean;
  name: string;
  _identifier: string;
  type: ItemBase;
  iLvl: number;
  itemDetails?: IItem;
  _hidden: {
    isCorrupted: boolean;
    isCursed: boolean;
    isVoidTouched: boolean;
  }
}


export interface IStatBuff {
  target: AffixCategory | Attributes;
  change: number;
  type: AffixTypes.ADDITIVE | AffixTypes.MULTIPLICATIVE | AffixTypes.RANGE;
}

export interface IPassive {
  _identifier: string;      // unique identifier usually same as name, but immutable to allow for possible name changes 
  name: string;
  effect: IStatBuff;
  minCharLevel?: number;
  requiredClass?: ExileClassType[];
}

export interface ISkill {
  _identifier: string;      // unique identifier usually same as name, but immutable to allow for possible name changes 
  name: string;
  target: SkillTarget;
  activationLayer: SkillActivationLayer;
  triggerStates: SkillTriggers[];
  setTrigger?:SkillTriggers;
  isEnabled?: boolean;
  minCharLevel?: number;
  requiredClass?: ExileClassType[];
  duration?: {
    count: number;
    timing: SkillTiming,
  };
  cooldown: {
    count: number,
    timing: SkillTiming,
    startCooldownInstantly: boolean,
  };
  cost: ISkillCost,
  effect: IStatBuff;
}

export interface ISkillCost {
  amount: number;
  resource: SkillResource;
}

/**
 * Represents a character in the game with their stats, equipment, and inventory
 */
export interface ICharacter {
  name: string;
  class: ExileClassType;
  level: number;
  experience: number;
  stats: ICharacterStats;
  temporalEffects: ITemporalEffect[];
  equipment: ICharacterEquipment;
  gold: number;
  loot: ILoot[];
  passives: IPassive[];
  skills: ISkill[];
  pendingRewards: IUpgrades,
  cooldowns: ICooldown[];
  refreshes: number;  
}

export interface ITemporalEffect extends IBaseTemporalEffect{
  effect: IStatBuff;
}
export interface ICooldown extends IBaseTemporalEffect{
  _identifier: string;
}

interface IBaseTemporalEffect {
  name: string;
  timing: SkillTiming,
  remaining: number;
}

interface IUpgrades{
  skills: number,
  passives: number,
  stats: number,
}

/**
 * Stat ranges for each character class
 */
export const CLASS_STAT_RANGES: Record<ExileClassType, IClassStatRanges> = {
  'Spellsword': {
    health: { min: 10, max: 20 },
    mana: { min: 5, max: 10 },
    affinity: { min: 3, max: 5 },    // Aligned 3-5 to maintain relative difference
    wrath: { min: 1, max: 3 },       // Aligned 2-4
    fortune: { min: -2, max: 0 },    // Non-aligned
    fortitude: { min: -2, max: 0 }   // Non-aligned
  },
  'Chaos Mage': {
    health: { min: 5, max: 10 },
    mana: { min: 5, max: 30 },
    affinity: { min: 4, max: 6 },    // Aligned 4-6
    fortune: { min: 1, max: 3 },     // Aligned 1-3
    wrath: { min: -3, max: -1 },     // Non-aligned
    fortitude: { min: -3, max: -1 }  // Non-aligned
  },
  'Reaver': {
    health: { min: 15, max: 30 },
    mana: { min: 2, max: 5 },
    wrath: { min: 4, max: 6 },       // Aligned 4-6
    fortitude: { min: 1, max: 3 },   // Aligned 1-3
    affinity: { min: -3, max: -1 },  // Non-aligned
    fortune: { min: -2, max: 0 }     // Non-aligned
  }
};

/**
 * Aligned stats for each character class
 */
export const CLASS_ALIGNED_STATS: Record<ExileClassType, (keyof IClassStatRanges)[]> = {
  'Spellsword': ['health','mana','affinity', 'wrath'],
  'Chaos Mage': ['health','mana','affinity', 'fortune'],
  'Reaver': ['health','mana','wrath', 'fortitude']
};

/**
 * Generates random stat bonuses for a given class
 * @param classType The class to generate stats for
 * @returns `Partial<ICharacterStats>` with random bonuses within the class's ranges
 */
export function generateClassStats(classType: ExileClassType): Partial<ICharacterStats> {
  const ranges = CLASS_STAT_RANGES[classType];
  const alignedStats = CLASS_ALIGNED_STATS[classType];
  const stats: Partial<ICharacterStats> = {};

  // Generate random value within range only for aligned stats
  alignedStats.forEach((stat) => {
    const range = ranges[stat as keyof IClassStatRanges];
    stats[stat] = Math.floor(
      Math.random() * (range.max - range.min + 1) + range.min
    );
  });

  // Handle non-aligned stats with 30% chance of +1
  const allStats = Object.keys(ranges) as (keyof IClassStatRanges)[];
  const nonAlignedStats = allStats.filter(stat => !alignedStats.includes(stat));
  
  nonAlignedStats.forEach(stat => {
    if (Math.random() < 0.3) { // 30% chance
      stats[stat] = 1;
    }
  });

  stats.currentHealth = stats.health;
  stats.currentMana = stats.mana;

  return stats;
}

/**
 * Represents the damage configuration for a monster type
 */
export interface IMonsterDamage {
  primary: MitigationType;
  secondary?: MitigationType;
  damageMultiplier: number;
  damageSplit?: number; // Percentage of damage that comes from primary source (0-100)
}

/**
 * Damage configurations for each monster type
 */
export const MONSTER_DAMAGE_TYPES: Record<MonsterTypes, IMonsterDamage> = {
  'undead': {
    primary: 'physical',
    secondary: 'corruption_void',
    damageMultiplier: 1.2,
    damageSplit: 70 // 70% physical, 30% void corruption
  },
  'beast': {
    primary: 'physical',
    damageMultiplier: 1.0
  },
  'humanoid': {
    primary: 'physical',
    secondary: 'elemental_lightning',
    damageMultiplier: 0.9,
    damageSplit: 95 // 95% physical, 5% lightning
  },
  'elemental': {
    primary: 'elemental_fire',
    secondary: 'elemental_cold',
    damageMultiplier: 1,
    damageSplit: 60 // 60% fire, 40% cold
  },
  'abomination': {
    primary: 'corruption_mental',
    secondary: 'corruption_void',
    damageMultiplier: 1.2,
    damageSplit: 50 // 50% mental, 50% void corruption
  }
};

/**
 * Cost multipliers for each item tier
 * 
 * Identification costs 1x
 * 
 * Sale reimbursement 0.5x
 */
export const ITEM_TIER_COSTS: Record<ItemTierType, number> = {
  'basic': 10,
  'enhanced': 25,
  'exceptional': 50,
  'abstract': 100,
  'infused': 100
};

/**
 * Represents information about an item tier
 */
export interface IItemTierInfo {
  tier: ItemTierType;
  numericalTier: number;
  affixCount: {
    embedded: number;
    prefix: number;
    suffix: number;
  };
}

/**
 * Configuration for each item tier
 */
export const ITEM_TIER_INFO: Record<ItemTierType, IItemTierInfo> = {
  'basic': { tier: 'basic', numericalTier: 1, affixCount: { embedded: 0, prefix: 0, suffix: 0 } },
  'enhanced': { tier: 'enhanced', numericalTier: 2, affixCount: { embedded: 1, prefix: 0, suffix: 1 } },
  'exceptional': { tier: 'exceptional', numericalTier: 3, affixCount: { embedded: 2, prefix: 1, suffix: 1 } },
  'abstract': { tier: 'abstract', numericalTier: 4, affixCount: { embedded: 1, prefix: 3, suffix: 0 } },
  'infused': { tier: 'infused', numericalTier: 4, affixCount: { embedded: 1, prefix: 0, suffix: 3 } }
};

/**
 * Generates a random value for an affix based on its type and description
 * @param affix The affix to generate a value for
 * @returns The generated affix value
 */
function generateAffixValue(affix: IAffix): AffixValue {
  // Check if the description contains two {value} placeholders
  const isRange = (affix.description.match(/\{\s*value\s*\}/gi) || []).length === 2;
  
  if (isRange) {
    const minValue = Math.floor(Math.random() * (affix.maxValue - 1 - affix.minValue + 1)) + affix.minValue; // x -> y-1 = a 
    const maxValue =  Math.floor(Math.random() * (affix.maxValue - minValue + 1)) + minValue;                //  a - y
    const retval = {
      type: "range",
      minValue,
      maxValue,
    } as AffixValue;
    return retval;

  } else if (affix.isMultiplicative) {
    const retval = {
      type: "multiplicative",
      value: Math.floor(Math.random() * (affix.maxValue - affix.minValue + 1)) + affix.minValue,
    } as AffixValue;
    return retval;
  } else {
    const retval = {
      type: "additive",
      value: Math.floor(Math.random() * (affix.maxValue - affix.minValue + 1)) + affix.minValue,
    } as AffixValue;
    return retval;
  }
}

/**
 * Helper function to generate affixes of a specific type
 * @param affixType The type of affix to generate (`EMBEDDED`, `PREFIX`, or `SUFFIX`)
 * @param allowedAffixes Collection of all allowed affixes
 * @param maxCount Maximum number of affixes to generate
 * @returns Array of generated affixes
 */
function generateAffixesOfType(
  affixType: AffixType,
  allowedAffixes: IAffix[],
  maxCount: number
): Array<IItemAffix> {
  const generatedAffixes: Array<IItemAffix> = [];
  const typeAffixes = allowedAffixes.filter((affix: IAffix) => affix.type === affixType);

  for (let i = 0; i < maxCount; i++) {
    // Increasing chance to stop (20% base + 15% per affix)
    if (i > 0 && Math.random() < (0.2 + (i * 0.15))) {
      break;
    }
    if (typeAffixes.length > 0) {
      const randomAffix = randomlySelectAffixFromCollection(typeAffixes);
      const croppedAffix:IItemAffix = {
        id: randomAffix.id,
        category: randomAffix.category,
        value: generateAffixValue(randomAffix),
      }
      if (randomAffix.subCategory){
        croppedAffix.subCategory = randomAffix.subCategory
      }
      generatedAffixes.push(croppedAffix);
    }
  }

  return generatedAffixes;
}

function randomlySelectAffixFromCollection(affixCollection: IAffix[]){
  return affixCollection[Math.floor(Math.random() * affixCollection.length)]
}

/**
 * Core logic for formatting affix descriptions
 * @param affix The affix object containing id, category, and value
 * @param options Configuration options for formatting
 * @returns Formatted description string
 */
function formatAffixCore(
  affix: IItemAffix,
  options: { showRange?: boolean } = {},
  saturationMultiplier?: number
): string {
  // Find the matching affix definition to get min/max values and original description
  let affixDef = allAffixesById.get(affix.id);

  const multiplier =  1 + (((saturationMultiplier|| 1) -1) / 4 );
  
  // If not found and it's a tier -1 affix, try to find the original affix by type and category
  if (!affixDef && affix.id.endsWith('_-1')) {

    const tempIdArray = affix.id.split('_');
    tempIdArray[tempIdArray.length - 1] = '1';
    const reconstructedId = tempIdArray.join('_');
    affixDef = allAffixesById.get(reconstructedId);

    // console.log(`finding affix by reconstruction:'${reconstructedId}'`);
  }
  
  if (!affixDef) {
    // console.log(`unknown affix for id [${affix.id}]`);
    return 'Unknown Affix';
  };

  let description = affixDef.description;

  // Check how many times {value} appears in the description template
  const valuePlaceholderCount = (description.match(/\{\s*value\s*\}/gi) || []).length;
  const affixValue = affix.value;

  if (valuePlaceholderCount === 1 && !isAffixRange(affixValue)) {
    // If {value} appears once, replace it with the value
    description = description.replace(/\{\s*value\s*\}/gi, Math.floor(affixValue.value * multiplier).toString());
  } else if (valuePlaceholderCount === 2) {
    if (isAffixRange(affixValue)) {
      // If showing range, replace first with value and second with maxValue
      let replacedOnce = false;
      description = description.replace(/\{\s*value\s*\}/gi, (_match) => {
        if (!replacedOnce) {
          replacedOnce = true;
          return Math.floor(affixValue.minValue * multiplier).toString();
        } else {
          return Math.floor(affixValue.maxValue * multiplier).toString();
        }
      });

      if (options.showRange){
        // Append the full range in parentheses
        description += ` (${affixDef.minValue}-${affixDef.maxValue})`;
      }
    }
  }

  if (!(affix.id.endsWith('_-1'))){
    const segment = affix.id.split('_');
    let tier = segment[segment.length - 1];

    description += `${TIER_SEPARATOR}${tier}`;
  }

  return description;
}


/**
 * Formats an affix description by replacing the {value} placeholder with the actual value and showing the range if applicable.
 * @param affix The affix object containing id, category, and value (the rolled value).
 * @returns Formatted description string.
 */
export function formatAffixDescription(affix: IItemAffix, saturationMultiplier?: number): string {
  return formatAffixCore(affix, { showRange: true }, saturationMultiplier);
}

/**
 * Formats a consolidated affix description, showing only the total value without ranges.
 * @param affix The affix object containing id, category, and value (the total value).
 * @returns Formatted description string.
 */
export function formatConsolidatedAffix(affix: IItemAffix): string {
  return formatAffixCore(affix, { showRange: false });
}

/**
 * Generates appropriate affixes for an item based on its tier and type
 * @param tier The item's tier
 * @param _type NYI: The item's type (currently unused but kept for future use)
 * @returns Object containing arrays of generated affixes with their roll values
 */
export function generateAffixesForTierAndType(tier: ItemTierType, type: ItemBase, iLevel: number) {
  const affixes = {
    embedded: [] as Array<IItemAffix>,
    prefix: [] as Array<IItemAffix>,
    suffix: [] as Array<IItemAffix>
  };

  // Get the expected affix counts for this tier
  const affixCounts = ITEM_TIER_INFO[tier].affixCount;

  // Filter affixes that are allowed for this tier
  const allowedAffixes = allAffixes.filter((affix: IAffix) => 
    affix.allowedTiers.includes(tier) 
      && affix.allowedBases.includes(type)
      && iLevel >= (AffixLevelTiers.get(affix.tier)?.minILevel ||0) && iLevel < (AffixLevelTiers.get(affix.tier)?.maxILevel || Infinity)
  );

  // console.log(`given iLevel: [${iLevel}]`, allowedAffixes);

  // Generate each type of affix using the helper function
  if (affixCounts.embedded > 0) {
    affixes.embedded = generateAffixesOfType(AffixType.EMBEDDED, allowedAffixes, affixCounts.embedded);
  }

  if (affixCounts.prefix > 0) {
    affixes.prefix = generateAffixesOfType(AffixType.PREFIX, allowedAffixes, affixCounts.prefix);
  }

  if (affixCounts.suffix > 0) {
    affixes.suffix = generateAffixesOfType(AffixType.SUFFIX, allowedAffixes, affixCounts.suffix);
  }

  return affixes;
} 