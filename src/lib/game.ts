import type { IAffix } from './affixTypes';
import { AffixType, allAffixes, isAffixRange } from './affixTypes';
import type { AffixValue } from './affixTypes';

export type ExileClassType = 'Spellsword' | 'Chaos Mage' | 'Reaver';
export type DifficultyType = 'Easy' | 'Normal' | 'Hard';
export type LootType = 'armor' | 'weapons' | 'jewelry' | 'currency';
export type MonsterType = 'undead' | 'beast' | 'humanoid' | 'elemental' | 'abomination';
export type JournalEntryType = 'Danger' | 'DangerLite' | 'Generic' | 'Safe' | 'Treasure';
export type ItemType = 'Sword'| 'Shield'| 'Amulet'| 'Ring'| 'Boots'| 'Gloves'| 'Helmet'| 'Armor'| 'Shoulders'| 'Pants';

export interface IJournalEntry {
  type: JournalEntryType;
  message: string;
}

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
    lootTags: ['currency', 'jewelry'],
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
    lootTags: ['currency', 'jewelry'],
    encounterBase: 8,
    encounterRangeDeltas: 3,
    monsterTypes: ['abomination']
  },
];

// affixes [embedded | pre | suf]:
export type ItemTierType = 
    'basic' //            0|0|0
  | 'enhanced' //         1|0|1
  | 'exceptional' //      2|1|1
  | 'abstract' //         1|3|0
  | 'infused'//           1|0|3
;

export type ItemMutationType = 
    'crystallized'  // 
  | 'corrupted'     //
  | 'voided'        //
  | 'cursed'        //
;

export interface IMitigation {
  key: MitigationType;
  value: number;
}

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

export type MitigationType = 
  'evasion' 
| 'block'
| 'physical'
| 'elemental_fire'
| 'elemental_cold'
| 'elemental_lightning'
| 'corruption_void'
| 'corruption_mental'

export interface ICombatStat {
  baseDamagePerTick: number;
  damagePerTick: number;
  accuracy: number;
  health: number;
  mana: number;
  maxHealth: number;
  maxMana: number;
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

export interface IDifficulty {
  name: DifficultyType;
  dangerMultiplier: number;
  lootMultiplier: number;
}

export interface ICharacterStats {
  currentHealth: number; // current health
  currentMana: number;   // current mana

  health: number;        // max health
  mana: number;          // max mana
  fortitude: number;     // Mental and physical endurance
  fortune: number;       // Luck and chance-based outcomes
  wrath: number;         // Combat prowess and rage
  affinity: number;      // Connection to magical forces
  
  // Base attributes
  strength: number;      // Physical power and carrying capacity
  dexterity: number;     // Agility and precision
  intelligence: number;  // Mental acuity and magical potential
}

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

export interface IItem {
  tier: ItemTierType;              // magic common .... (total affix configuration)
  mutations: ItemMutationType[];   // types of affix subsets to allow
  affixes: {
    embedded: Array<{
      id: string;
      category: string;
      value: AffixValue;
    }>;
    prefix: Array<{
      id: string;
      category: string;
      value: AffixValue;
    }>;
    suffix: Array<{
      id: string;
      category: string;
      value: AffixValue;
    }>;
  }
}

export interface ILoot {
  identified: boolean;
  name: string;
  type: ItemType;
  itemDetails?: IItem;
  _hidden: {
    isCorrupted: boolean;
    isCursed: boolean;
    isVoidTouched: boolean;
  }
}

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

export const DIFFICULTY_SETTINGS: ReadonlyMap<DifficultyType, IDifficulty> = new Map<DifficultyType, IDifficulty>([
  ['Easy', { name: 'Easy', dangerMultiplier: 0.5, lootMultiplier: 1.0 }],
  ['Normal', { name: 'Normal', dangerMultiplier: 1.0, lootMultiplier: 1.0 }],
  ['Hard', { name: 'Hard', dangerMultiplier: 2.0, lootMultiplier: 0.8 }]
]);

export const EXILE_CLASSES: ExileClassType[] = ['Spellsword', 'Chaos Mage', 'Reaver'];

export const CLASS_DESCRIPTIONS: Record<ExileClassType, string> = {
  'Spellsword': 'A master of both blade and magic, combining physical prowess with arcane abilities.',
  'Chaos Mage': 'A wielder of unpredictable and powerful magic, harnessing the forces of chaos.',
  'Reaver': 'A fierce warrior who channels their rage into devastating combat abilities.'
};

export const BASE_STATS: ICharacterStats = {
  currentHealth: 100,
  currentMana: 100,
  health: 100,
  mana: 100,
  fortitude: 10,
  fortune: 10,
  wrath: 10,
  affinity: 10,
  strength: 10,
  dexterity: 10,
  intelligence: 10
};

export interface IStatRange {
  min: number;
  max: number;
}

export interface IClassStatRanges {
  health: IStatRange;
  mana: IStatRange;
  affinity: IStatRange;
  wrath: IStatRange;
  fortune: IStatRange;
  fortitude: IStatRange;
}

export const CLASS_STAT_RANGES: Record<ExileClassType, IClassStatRanges> = {
  'Spellsword': {
    health: { min: 10, max: 20 },
    mana: { min: 10, max: 20 },
    affinity: { min: 3, max: 5 },    // Reduced from 4-7 to maintain relative difference
    wrath: { min: 1, max: 3 },       // Reduced from 2-4
    fortune: { min: -2, max: 0 },    // Non-aligned
    fortitude: { min: -2, max: 0 }   // Non-aligned
  },
  'Chaos Mage': {
    health: { min: 5, max: 10 },
    mana: { min: 15, max: 30 },
    affinity: { min: 4, max: 6 },    // Reduced from 6-9
    fortune: { min: 1, max: 3 },     // Reduced from 2-5
    wrath: { min: -3, max: -1 },     // Non-aligned
    fortitude: { min: -3, max: -1 }  // Non-aligned
  },
  'Reaver': {
    health: { min: 15, max: 30 },
    mana: { min: 5, max: 10 },
    wrath: { min: 4, max: 6 },       // Reduced from 6-9
    fortitude: { min: 1, max: 3 },   // Reduced from 2-5
    affinity: { min: -3, max: -1 },  // Non-aligned
    fortune: { min: -2, max: 0 }     // Non-aligned
  }
};

export const CLASS_ALIGNED_STATS: Record<ExileClassType, (keyof IClassStatRanges)[]> = {
  'Spellsword': ['health','mana','affinity', 'wrath'],
  'Chaos Mage': ['health','mana','affinity', 'fortune'],
  'Reaver': ['health','mana','wrath', 'fortitude']
};

/**
 * Generates random stat bonuses for a given class
 * @param classType The class to generate stats for
 * @returns Partial<ICharacterStats> with random bonuses within the class's ranges
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

export interface IMonsterDamage {
  primary: MitigationType;
  secondary?: MitigationType;
  damageMultiplier: number;
  damageSplit?: number; // Percentage of damage that comes from primary source (0-100)
}

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
    damageMultiplier: 1.3,
    damageSplit: 60 // 60% fire, 40% cold
  },
  'abomination': {
    primary: 'corruption_mental',
    secondary: 'corruption_void',
    damageMultiplier: 1.5,
    damageSplit: 50 // 50% mental, 50% void corruption
  }
};

export const ITEM_TIER_COSTS: Record<ItemTierType, number> = {
  'basic': 10,
  'enhanced': 25,
  'exceptional': 50,
  'abstract': 100,
  'infused': 200
};

// Define affix counts per tier based on comments
export const ITEM_AFFIX_COUNTS: Record<ItemTierType, { embedded: number, prefix: number, suffix: number }> = {
  'basic': { embedded: 0, prefix: 0, suffix: 0 },
  'enhanced': { embedded: 1, prefix: 0, suffix: 1 },
  'exceptional': { embedded: 2, prefix: 1, suffix: 1 },
  'abstract': { embedded: 1, prefix: 3, suffix: 0 },
  'infused': { embedded: 1, prefix: 0, suffix: 3 }
}; 

/**
 * Generates appropriate affixes for an item based on its tier and type
 * @param tier The item's tier
 * @param _type The item's type (currently unused but kept for future use)
 * @returns Object containing arrays of generated affixes with their roll values
 */
export function generateAffixesForTier(tier: ItemTierType, _type: string) {
  const affixes = {
    embedded: [] as Array<{
      id: string;
      category: string;
      value: AffixValue;
    }>,
    prefix: [] as Array<{
      id: string;
      category: string;
      value: AffixValue;
    }>,
    suffix: [] as Array<{
      id: string;
      category: string;
      value: AffixValue;
    }>
  };

  // Get the expected affix counts for this tier
  const affixCounts = ITEM_AFFIX_COUNTS[tier];

  // Filter affixes that are allowed for this tier
  const allowedAffixes = allAffixes.filter((affix: IAffix) => 
    affix.allowedTiers.includes(tier)
  );

  const generateAffixValue = (affix: IAffix): AffixValue => {
    // Check if the description contains two {value} placeholders
    const isRange = (affix.description.match(/\{\s*value\s*\}/gi) || []).length === 2;
    
    if (isRange) {
      const minValue = Math.floor(Math.random() * (affix.maxValue - affix.minValue + 1)) + affix.minValue;
      const maxValue =  Math.floor(Math.random() * (affix.maxValue - minValue + 1)) + minValue;
      const retval = {
        type: "range",
        minValue,
        maxValue,
      } as AffixValue;
      return retval;

    } else if (affix.description.includes('%')) {
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
  };

  // Generate embedded affixes
  if (affixCounts.embedded > 0) {
    const embeddedAffixes = allowedAffixes.filter((affix: IAffix) => affix.type === AffixType.EMBEDDED);
    for (let i = 0; i < affixCounts.embedded; i++) {
      if (embeddedAffixes.length > 0) {
        const randomEmbedded = embeddedAffixes[Math.floor(Math.random() * embeddedAffixes.length)];
        affixes.embedded.push({
          id: randomEmbedded.id,
          category: randomEmbedded.category,
          value: generateAffixValue(randomEmbedded)
        });
      }
    }
  }

  // Generate prefix affixes
  if (affixCounts.prefix > 0) {
    const prefixAffixes = allowedAffixes.filter((affix: IAffix) => affix.type === AffixType.PREFIX);
    for (let i = 0; i < affixCounts.prefix; i++) {
      if (prefixAffixes.length > 0) {
        const randomPrefix = prefixAffixes[Math.floor(Math.random() * prefixAffixes.length)];
        affixes.prefix.push({
          id: randomPrefix.id,
          category: randomPrefix.category,
          value: generateAffixValue(randomPrefix)
        });
      }
    }
  }

  // Generate suffix affixes
  if (affixCounts.suffix > 0) {
    const suffixAffixes = allowedAffixes.filter((affix: IAffix) => affix.type === AffixType.SUFFIX);
    for (let i = 0; i < affixCounts.suffix; i++) {
      if (suffixAffixes.length > 0) {
        const randomSuffix = suffixAffixes[Math.floor(Math.random() * suffixAffixes.length)];
        affixes.suffix.push({
          id: randomSuffix.id,
          category: randomSuffix.category,
          value: generateAffixValue(randomSuffix)
        });
      }
    }
  }

  return affixes;
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