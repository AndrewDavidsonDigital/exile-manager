import type { AffixCategory, IAffix, IBaseAffix } from './affixTypes';
import { AffixType, allAffixes, isAffixRange } from './affixTypes';
import type { AffixValue } from './affixTypes';

/**
 * Represents the available difficulty levels for the game
 */
export type DifficultyType = 
  'Easy' 
| 'Normal' 
| 'Hard'
;

/**
 * Represents the different categories of loot that can be found
 */
export type LootType = 
  'armor' 
| 'weapons' 
| 'accessory' 
| 'currency'
;

/**
 * Represents the different types of journal entries that can be encountered
 */
export type JournalEntryType = 
'Danger' 
| 'DangerLite' 
| 'Generic' 
| 'Safe' 
| 'Treasure' 
| 'Horror'
;

/**
 * Represents all possible item types that can be equipped or found
 */
export type ItemType = 
  'Sword'
| 'Shield'
| 'Amulet'
| 'Ring'
| 'Boots'
| 'Gloves'
| 'Helmet'
| 'Armor'
| 'Shoulders'
| 'Pants'
;

/**
 * Represents the available character classes in the game
 */
export type ExileClassType = 
  'Spellsword' 
| 'Chaos Mage' 
| 'Reaver'
;

/**
 * Represents the different types of monsters that can be encountered
 */
export type MonsterType = 
  'undead' 
| 'beast' 
| 'humanoid' 
| 'elemental' 
| 'abomination'
;

/**
 * Represents a journal entry with its type and message
 */
export interface IJournalEntry {
  type: JournalEntryType;
  message: string;
}

/**
 * Represents a game level with its properties and configuration
 */
export interface ILevel {
  areaLevel: number;
  name: string;
  description: string;
  lootTags: LootType[];
  areaLuckDelta?: number;
  encounterBase: number;
  encounterRangeDeltas: number;
  monsterTypes: MonsterType[];
}

/**
 * List of all available game levels
 */
export const levels: ILevel[] = [
  {
    areaLevel: 0,
    description: "Washed up on the edge of a reef.",
    name: "The first last stand",
    lootTags: ['armor', 'weapons'],
    areaLuckDelta: 0.3,
    encounterBase: 4,
    encounterRangeDeltas: 1,
    monsterTypes: ['undead']
  },
  {
    areaLevel: 1,
    description: "Having survived the last stand you progress on towards tomorrow",
    name: "Beach",
    lootTags: ['armor', 'weapons'],
    encounterBase: 5,
    encounterRangeDeltas: 1,
    monsterTypes: ['beast', 'humanoid']
  },
  {
    areaLevel: 2,
    description: "LORE TBD",
    name: "Mini Boss",
    lootTags: ['currency', 'accessory'],
    encounterBase: 6,
    encounterRangeDeltas: 2,
    monsterTypes: ['beast', 'elemental']
  },
  {
    areaLevel: 3,
    description: "LORE TBD",
    name: "Beach3",
    lootTags: ['weapons'],
    encounterBase: 7,
    encounterRangeDeltas: 2,
    monsterTypes: ['undead', 'abomination']
  },
  {
    areaLevel: 4,
    description: "LORE TBD",
    name: "Boss",
    lootTags: ['currency', 'accessory'],
    encounterBase: 8,
    encounterRangeDeltas: 3,
    monsterTypes: ['abomination']
  },
];

/**
 * Represents the different tiers of items in the game
 * 
 * basic: No affixes
 * 
 * enhanced: 1 embedded, 1 suffix
 * 
 * exceptional: 2 embedded, 1 prefix, 1 suffix
 * 
 * abstract: 1 embedded, 3 prefixes
 * 
 * infused: 1 embedded, 3 suffixes
 */
export type ItemTierType = 
    'basic' //            0|0|0
  | 'enhanced' //         1|0|1
  | 'exceptional' //      2|1|1
  | 'abstract' //         1|3|0
  | 'infused'//           1|0|3
;

/**
 * Represents the different types of item mutations
 * 
 * crystallized: Adds elemental properties
 * 
 * corrupted: Adds corruption properties
 * 
 * voided: Adds void properties
 * 
 * cursed: Adds curse properties
 */
export type ItemMutationType = 
    'crystallized'  // 
  | 'corrupted'     //
  | 'voided'        //
  | 'cursed'        //
;

/**
 * Represents a damage mitigation value for a specific type
 */
export interface IMitigation {
  key: MitigationType;
  value: number;
}

/**
 * Default mitigation values for different damage types
 */
export const DEFAULT_MITIGATION: IMitigation[] = [
  {
    key: 'evasion',
    value: 5,
  },
  {
    key: 'physical',
    value: 0,
  },
  {
    key: 'block',
    value: 0,
  },
  {
    key: 'elemental_fire',
    value: 15,
  },
  {
    key: 'elemental_cold',
    value: 15,
  },
  {
    key: 'elemental_lightning',
    value: 15,
  },
  {
    key: 'corruption_void',
    value: -10,
  },
  {
    key: 'corruption_mental',
    value: -10,
  }
];

/**
 * Represents the different types of damage mitigation
 */
export type MitigationType = 
  'evasion' 
| 'block'
| 'physical'
| 'elemental_fire'
| 'elemental_cold'
| 'elemental_lightning'
| 'corruption_void'
| 'corruption_mental'

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
  criticalStrike: number;
  mitigation: IMitigation[];
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
 * Represents the difficulty settings for the game
 */
export interface IDifficulty {
  name: DifficultyType;
  dangerMultiplier: number;
  lootMultiplier: number;
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
 * Represents the character's core statistics and attributes
 */
export interface ICharacterStats {
  currentHealth: number; // current health
  currentMana: number;   // current mana

  health: number;        // max health
  mana: number;          // max mana

  fortitude: number;     // Mental and physical endurance
  fortune: number;       // Luck and chance-based outcomes
  wrath: number;         // Combat prowess and rage
  affinity: number;      // Connection to magical forces
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
      value: AffixValue;
    }>;
    prefix: Array<{
      id: string;
      category: AffixCategory;
      value: AffixValue;
    }>;
    suffix: Array<{
      id: string;
      category: AffixCategory;
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
  type: ItemType;
  iLvl: number;
  itemDetails?: IItem;
  _hidden: {
    isCorrupted: boolean;
    isCursed: boolean;
    isVoidTouched: boolean;
  }
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
  equipment: ICharacterEquipment;
  skills: string[];
  gold: number;
  loot: ILoot[];
}

/**
 * Difficulty settings for the game with their respective multipliers
 */
export const DIFFICULTY_SETTINGS: ReadonlyMap<DifficultyType, IDifficulty> = new Map<DifficultyType, IDifficulty>([
  ['Easy', { name: 'Easy', dangerMultiplier: 0.5, lootMultiplier: 1.0 }],
  ['Normal', { name: 'Normal', dangerMultiplier: 1.0, lootMultiplier: 1.0 }],
  ['Hard', { name: 'Hard', dangerMultiplier: 2.0, lootMultiplier: 0.8 }]
]);

/**
 * List of available character classes in the game
 */
export const EXILE_CLASSES: ExileClassType[] = ['Spellsword', 'Chaos Mage', 'Reaver'];

/**
 * Descriptions for each character class
 */
export const CLASS_DESCRIPTIONS: Record<ExileClassType, string> = {
  'Spellsword': 'A master of both blade and magic, combining physical prowess with arcane abilities.',
  'Chaos Mage': 'A wielder of unpredictable and powerful magic, harnessing the forces of chaos.',
  'Reaver': 'A fierce warrior who channels their rage into devastating combat abilities.'
};

/**
 * Base statistics for a new character
 */
export const BASE_STATS: ICharacterStats = {
  currentHealth: 100,
  currentMana: 100,
  health: 100,
  mana: 100,
  fortitude: 10,
  fortune: 10,
  wrath: 10,
  affinity: 10,
};

/**
 * Represents a range of possible values for a stat
 */
export interface IStatRange {
  min: number;
  max: number;
}

/**
 * Represents the possible stat ranges for each class
 */
export interface IClassStatRanges {
  health: IStatRange;
  mana: IStatRange;
  affinity: IStatRange;
  wrath: IStatRange;
  fortune: IStatRange;
  fortitude: IStatRange;
}

/**
 * Stat ranges for each character class
 */
export const CLASS_STAT_RANGES: Record<ExileClassType, IClassStatRanges> = {
  'Spellsword': {
    health: { min: 10, max: 20 },
    mana: { min: 10, max: 20 },
    affinity: { min: 3, max: 5 },    // Aligned 3-5 to maintain relative difference
    wrath: { min: 1, max: 3 },       // Aligned 2-4
    fortune: { min: -2, max: 0 },    // Non-aligned
    fortitude: { min: -2, max: 0 }   // Non-aligned
  },
  'Chaos Mage': {
    health: { min: 5, max: 10 },
    mana: { min: 15, max: 30 },
    affinity: { min: 4, max: 6 },    // Aligned 4-6
    fortune: { min: 1, max: 3 },     // Aligned 1-3
    wrath: { min: -3, max: -1 },     // Non-aligned
    fortitude: { min: -3, max: -1 }  // Non-aligned
  },
  'Reaver': {
    health: { min: 15, max: 30 },
    mana: { min: 5, max: 10 },
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
export const MONSTER_DAMAGE_TYPES: Record<MonsterType, IMonsterDamage> = {
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
    secondary: 'block',
    damageMultiplier: 0.9,
    damageSplit: 85 // 85% physical, 15% block
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
): Array<{ id: string; category: AffixCategory; value: AffixValue }> {
  const generatedAffixes: Array<{ id: string; category: AffixCategory; value: AffixValue }> = [];
  const typeAffixes = allowedAffixes.filter((affix: IAffix) => affix.type === affixType);

  for (let i = 0; i < maxCount; i++) {
    // Increasing chance to stop (20% base + 15% per affix)
    if (i > 0 && Math.random() < (0.2 + (i * 0.15))) {
      break;
    }
    if (typeAffixes.length > 0) {
      const randomAffix = randomlySelectAffixFromCollection(typeAffixes);
      generatedAffixes.push({
        id: randomAffix.id,
        category: randomAffix.category,
        value: generateAffixValue(randomAffix)
      });
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
  affix: { id: string; category: string; value: AffixValue },
  options: { showRange?: boolean } = {}
): string {
  // Find the matching affix definition to get min/max values and original description
  let affixDef = allAffixes.find(a => a.id === affix.id);
  
  // If not found and it's a tier -1 affix, try to find the original affix by type and category
  if (!affixDef && affix.id.endsWith('_-1')) {
    const [type, category] = affix.id.split('_');
    affixDef = allAffixes.find(a => a.type === type && a.category === category);
  }
  
  if (!affixDef) return 'Unknown Affix';

  let description = affixDef.description;

  // Check how many times {value} appears in the description template
  const valuePlaceholderCount = (description.match(/\{\s*value\s*\}/gi) || []).length;
  const affixValue = affix.value;

  if (valuePlaceholderCount === 1 && !isAffixRange(affixValue)) {
    // If {value} appears once, replace it with the value
    description = description.replace(/\{\s*value\s*\}/gi, affixValue.value.toString());
  } else if (valuePlaceholderCount === 2) {
    if (isAffixRange(affixValue)) {
      // If showing range, replace first with value and second with maxValue
      let replacedOnce = false;
      description = description.replace(/\{\s*value\s*\}/gi, (_match) => {
        if (!replacedOnce) {
          replacedOnce = true;
          return affixValue.minValue.toString();
        } else {
          return affixValue.maxValue.toString();
        }
      });

      if (options.showRange){
        // Append the full range in parentheses
        description += ` (${affixDef.minValue}-${affixDef.maxValue})`;
      }
    }
  }

  return description;
}

/**
 * Formats an affix description by replacing the {value} placeholder with the actual value and showing the range if applicable.
 * @param affix The affix object containing id, category, and value (the rolled value).
 * @returns Formatted description string.
 */
export function formatAffixDescription(affix: { id: string; category: string; value: AffixValue }): string {
  return formatAffixCore(affix, { showRange: true });
}

/**
 * Formats a consolidated affix description, showing only the total value without ranges.
 * @param affix The affix object containing id, category, and value (the total value).
 * @returns Formatted description string.
 */
export function formatConsolidatedAffix(affix: { id: string; category: string; value: AffixValue }): string {
  return formatAffixCore(affix, { showRange: false });
}

/**
 * Generates appropriate affixes for an item based on its tier and type
 * @param tier The item's tier
 * @param _type NYI: The item's type (currently unused but kept for future use)
 * @returns Object containing arrays of generated affixes with their roll values
 */
export function generateAffixesForTier(tier: ItemTierType, _type: string) {
  const affixes = {
    embedded: [] as Array<{
      id: string;
      category: AffixCategory;
      value: AffixValue;
    }>,
    prefix: [] as Array<{
      id: string;
      category: AffixCategory;
      value: AffixValue;
    }>,
    suffix: [] as Array<{
      id: string;
      category: AffixCategory;
      value: AffixValue;
    }>
  };

  // Get the expected affix counts for this tier
  const affixCounts = ITEM_TIER_INFO[tier].affixCount;

  // Filter affixes that are allowed for this tier
  const allowedAffixes = allAffixes.filter((affix: IAffix) => 
    affix.allowedTiers.includes(tier)
  );

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