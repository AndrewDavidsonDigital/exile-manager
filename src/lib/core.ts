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
 * Represents possible item types that can be equipped or found
 */
export enum ItemBase { 
  DAGGERS = 'Daggers',
  SHIELD = 'Sword & Shield',
  AMULET = 'Amulet',
  RING = 'Ring',
  BOOTS = 'Boots',
  GLOVES = 'Gloves',
  HELMET = 'Helmet',
  ARMOR = 'Armor',
  SHOULDER = 'Shoulders',
  PANTS = 'Pants',
};


/**
 * Represents possible item types that can be equipped or found
 */
export enum IBaseStats {
  BASE_DAMAGE = 12,
};

export enum ExileClass {
  SPELLSWORD = 'Spellsword',
  CHAOS_MAGE= 'Chaos Mage',
  REAVER = 'Reaver',
};
/**
 * Represents the available character classes in the game
 */
export type ExileClassType = 
  ExileClass.SPELLSWORD 
| ExileClass.CHAOS_MAGE 
| ExileClass.REAVER
;

/**
 * Represents the different types of monsters that can be encountered
 */
export enum MonsterTypes { 
  UNDEAD = 'undead' ,
  BEAST = 'beast' ,
  HUMANOID = 'humanoid' ,
  ELEMENTAL = 'elemental' ,
  ABOMINATION = 'abomination',
}

/**
 * Represents a journal entry with its type and message
 */
export interface IJournalEntry {
  type: JournalEntryType;
  message: string;
}


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

export enum ItemTiers { 
  BASIC = 'basic',              // 0|0|0
  ENHANCED =  'enhanced',       // 1|0|1
  EXCEPTIONAL =  'exceptional', // 2|1|1
  ABSTRACT =  'abstract',       // 1|3|0
  INFUSED =  'infused',         // 1|0|3
};
export const allItemTiers: ItemTiers[] = Object.values(ItemTiers);

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
    key: 'armor',
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
| 'armor'
| 'physical'
| 'elemental_fire'
| 'elemental_cold'
| 'elemental_lightning'
| 'corruption_void'
| 'corruption_mental'

export enum Attributes {
  FORTITUDE = 'fortitude',
  FORTUNE = 'fortune',
  AFFINITY = 'affinity',
  WRATH = 'wrath',
  HEALTH = 'health',
  MANA = 'mana',
}

export type CharacterAttributeType = 'fortitude' | 'fortune' | 'affinity' | 'wrath' | 'health' | 'mana';

export const attributeIncrease = {
  health: 5,
  mana: 5,
  fortitude: 2,
  fortune: 2,
  wrath: 2,
  affinity: 2,
}

export enum SkillTarget {
  ENEMY = 'enemy',
  SELF = 'self',
}

export enum SkillTiming {
  RUN = 'run',
  TURN = 'turn',
  EVENT = 'event',
}

export enum SkillResource {
  HEALTH = 'health',
  MANA = 'mana',
  GOLD = 'gold',
}
export enum SkillActivationLayer {
  COMBAT = 'combat',
  RESTING = 'resting',
  WORLD = 'world',
}
export enum SkillTriggers {
  NONE = 'none',
  ALWAYS = 'always',
  CRITICAL_HEALTH = 'Health Critical',
  LOW_HEALTH = 'Low Health',
  LOW_MANA = 'Low Mana',
  MED_HEALTH = 'Medium Health',
  MED_MANA = 'Medium Mana',
  HIGH_HEALTH = 'High Health',
  HIGH_MANA = 'High Mana',
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
export const EXILE_CLASSES: ExileClass[] = Object.values(ExileClass);


/**
 * Descriptions for each character class
 */
export const CLASS_DESCRIPTIONS: Record<ExileClassType, string> = {
  'Spellsword': 'A master of both blade and magic, combining physical prowess with arcane abilities.',
  'Chaos Mage': 'A wielder of unpredictable and powerful magic, harnessing the forces of chaos.',
  'Reaver': 'A fierce warrior who channels their rage into devastating combat abilities.'
};

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
 * Base statistics for a new character
 */
export const BASE_STATS: ICharacterStats = {
  currentHealth: 100,
  currentMana: 40,
  health: 100,
  mana: 40,
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
 * Represents the damage configuration for a monster type
 */
export interface IMonsterDamage {
  primary: MitigationType;
  secondary?: MitigationType;
  damageMultiplier: number;
  damageSplit?: number; // Percentage of damage that comes from primary source (0-100)
}


export function baseDamageFunction(areaMulti:number, tierMulti:number, difficultyMulti:number ){
  return Math.floor((5 + Math.random() * 10) * areaMulti * tierMulti * difficultyMulti);
}

export const TIER_SEPARATOR = '_-_';

export function resolveAffixChange(rawValue: number,delta: number, direction: AffixTypes){
  switch (direction) {
    case AffixTypes.ADDITIVE:
      return rawValue + delta;
      
    case AffixTypes.MULTIPLICATIVE:
      return rawValue * (1 + delta/100);
  
    default:
      break;
  }
  return rawValue;
}

export enum AffixTypes {
  ADDITIVE = 'additive',
  MULTIPLICATIVE = 'multiplicative',
  RANGE = 'range',
}



/**
 * Represents the different types of affixes that can be applied to items
 */
export enum AffixType {
  /** Immutable affixes that are inherent to the item, similar to Path of Exile's implicit modifiers */
  EMBEDDED = 'embedded',
  /** Primarily offensive stats but can include some highly effective defensive stats */
  PREFIX = 'prefix',
  /** Primarily defensive stats but can include some highly effective offensive stats */
  SUFFIX = 'suffix'
}

/**
 * Represents the different categories of affixes
 */
export enum AffixCategory {
  /** Affixes relating to specifically offensive values */
  ATTACK = 'attack',
  /** Affixes relating to specifically defensive values */
  DEFENSE = 'defense',
  /** Affixes pertaining to armor rating values */
  ARMOR = 'armor',
  /** Affixes pertaining to evasion rating values */
  EVASION = 'evasion',
  /** Affixes relating the characters life */
  LIFE = 'life',
  /** Affixes relating the characters mana */
  MANA = 'mana',
  /** Affixes relating resistances explicity @deprecated not yet implemented */
  RESISTANCE = 'resistance',
  /** Affixes relating the characters base attributes */
  ATTRIBUTE = 'attribute',
  /** Affixes relating utility elements @deprecated not yet implemented */
  UTILITY = 'utility',
  /** Affixes relating elemental damage, both offensively and defensibly */
  ELEMENTAL = 'elemental',
  /** Affixes relating physical damage, both offensively and defensibly */
  PHYSICAL = 'physical',
  /** Affixes pertaining to critical strike chance */
  CRITICAL = 'critical',
  /** Affixes relating spell @deprecated not yet implemented */
  SPELL = 'spell',
  /** Affixes relating movement @deprecated not yet implemented */
  MOVEMENT = 'movement',
  /** Affixes relating crafting @deprecated not yet implemented */
  CRAFTING = 'crafting'
}