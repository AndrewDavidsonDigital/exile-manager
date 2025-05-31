export type ExileClassType = 'Spellsword' | 'Chaos Mage' | 'Reaver';
export type DifficultyType = 'Easy' | 'Normal' | 'Hard';
export type LootType = 'armor' | 'weapons' | 'jewelry' | 'currency';
export type MonsterType = 'undead' | 'beast' | 'humanoid' | 'elemental' | 'abomination';
export type JournalEntryType = 'Danger' | 'DangerLite' | 'Generic' | 'Safe' | 'Treasure';

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
  damagePerTick: number;
  accuracy: number;
  health: number;
  mitigation: IMitigation[];
}

export interface IDifficulty {
  name: DifficultyType;
  dangerMultiplier: number;
  lootMultiplier: number;
}

export interface ICharacterStats {
  health: number;
  mana: number;
  fortitude: number;     // Mental and physical endurance
  fortune: number;       // Luck and chance-based outcomes
  wrath: number;         // Combat prowess and rage
  affinity: number;      // Connection to magical forces
}

export interface ICharacterEquipment {
  weapon?: string;
  armor?: string;
  accessory?: string;
}

export interface IItem {
  tier: ItemTierType;              // magic common .... (total affix configuration)
  mutations: ItemMutationType[];   // types of affix subsets to allow
  affixes: {
    embedded: string[];
    prefix: string[];
    suffix: string[];
  }
}

export interface ILoot {
  identified: boolean;
  cursed: boolean;              // de-equipable??
  corrupted: boolean;           // 
  name: string;
  itemDetails?: IItem;
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
  health: 100,
  mana: 100,
  fortitude: 10,
  fortune: 10,
  wrath: 10,
  affinity: 10
};

export interface IStatRange {
  min: number;
  max: number;
}

export interface IClassStatRanges {
  affinity: IStatRange;
  wrath: IStatRange;
  fortune: IStatRange;
  fortitude: IStatRange;
}

export const CLASS_STAT_RANGES: Record<ExileClassType, IClassStatRanges> = {
  'Spellsword': {
    affinity: { min: 3, max: 5 },    // Reduced from 4-7 to maintain relative difference
    wrath: { min: 1, max: 3 },       // Reduced from 2-4
    fortune: { min: -2, max: 0 },    // Non-aligned
    fortitude: { min: -2, max: 0 }   // Non-aligned
  },
  'Chaos Mage': {
    affinity: { min: 4, max: 6 },    // Reduced from 6-9
    fortune: { min: 1, max: 3 },     // Reduced from 2-5
    wrath: { min: -3, max: -1 },     // Non-aligned
    fortitude: { min: -3, max: -1 }  // Non-aligned
  },
  'Reaver': {
    wrath: { min: 4, max: 6 },       // Reduced from 6-9
    fortitude: { min: 1, max: 3 },   // Reduced from 2-5
    affinity: { min: -3, max: -1 },  // Non-aligned
    fortune: { min: -2, max: 0 }     // Non-aligned
  }
};

export const CLASS_ALIGNED_STATS: Record<ExileClassType, (keyof ICharacterStats)[]> = {
  'Spellsword': ['affinity', 'wrath'],
  'Chaos Mage': ['affinity', 'fortune'],
  'Reaver': ['wrath', 'fortitude']
};

/**
 * Generates random stat bonuses for a given class
 * @param classType The class to generate stats for
 * @returns Partial<ICharacterStats> with random bonuses within the class's ranges
 */
export function generateClassStats(classType: ExileClassType): Partial<ICharacterStats> {
  const ranges = CLASS_STAT_RANGES[classType];
  const stats: Partial<ICharacterStats> = {};

  // Generate random value within range for each stat
  Object.entries(ranges).forEach(([stat, range]) => {
    stats[stat as keyof ICharacterStats] = Math.floor(
      Math.random() * (range.max - range.min + 1) + range.min
    );
  });

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