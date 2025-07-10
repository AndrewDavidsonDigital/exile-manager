// -------------------------------------------------------------------------------
// -------------------------------GAME CONFIG-------------------------------------
// -------------------------------------------------------------------------------

export const EVENT_AUDIO_KEY = '__audio';

export enum AudioKey {
  DEFAULT = 0,
  GOLD,
  SCROLL,
  BRUSH,
  LOCK,
  SWOOSH_UP,
  SWOOSH_DOWN,
  ARMOUR,
  JEWELLERY,
  SMITH,
  RESET,
}

export type EventWithAudio = TouchEvent & MouseEvent & KeyboardEvent & Event &{
  [EVENT_AUDIO_KEY]: AudioKey;
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
 * Represents the available difficulty levels for the game
 */
export type DifficultyType = 
  'Easy' 
| 'Normal' 
| 'Hard'
;

/**
 * Difficulty settings for the game with their respective multipliers
 */
export const DIFFICULTY_SETTINGS: ReadonlyMap<DifficultyType, IDifficulty> = new Map<DifficultyType, IDifficulty>([
  ['Easy', { name: 'Easy', dangerMultiplier: 0.5, lootMultiplier: 1.0 }],
  ['Normal', { name: 'Normal', dangerMultiplier: 1.0, lootMultiplier: 1.0 }],
  ['Hard', { name: 'Hard', dangerMultiplier: 2.0, lootMultiplier: 0.8 }]
]);

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

// -------------------------------------------------------------------------------
// ---------------------------------CHARACTER-------------------------------------
// -------------------------------------------------------------------------------


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

export const exileClassCritSkillName: Record<ExileClass, string> = {
  [ExileClass.SPELLSWORD]: 'Elemental Barrage',
  [ExileClass.CHAOS_MAGE]: 'Abyssal Embrace',
  [ExileClass.REAVER]: 'Blood Reap',
};

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
;

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


// -------------------------------------------------------------------------------
// -----------------------------------ITEMS---------------------------------------
// -------------------------------------------------------------------------------


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
export enum BaseStats {
  BASE_DAMAGE = 12,
  BASE_HEALTH_REGEN = 3,
  BASE_MANA_REGEN = 2,
  BASE_MAX_RESISTANCE = 75,
};


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
 * Represents the damage configuration for a monster type
 */
export interface IMonsterDamage {
  primary: MitigationType;
  secondary?: MitigationType;
  damageMultiplier: number;
  damageSplit?: number; // Percentage of damage that comes from primary source (0-100)
}


export function baseDamageFunction(areaMulti:number, tierMulti:number, difficultyMulti:number ): number{
  return Math.floor((5 + Math.random() * 10) * areaMulti * tierMulti * difficultyMulti);
}


// -------------------------------------------------------------------------------
// -----------------------------------AFFIXES-------------------------------------
// -------------------------------------------------------------------------------

export enum AffixTiers {
  ONE = 1,
  TWO,
  THREE,
  FOUR,
  FIVE,
  SIX,
  SEVEN,
  EIGHT,
  NINE,
  TEN,
  ELEVEN,
}

export const TIER_SEPARATOR = '_-_';

export function resolveAffixChange(rawValue: number,delta: number, direction: AffixTypes): number{
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
/**
 * Represents the different categories of affixes
 */
export enum AffixSubCategory {
  /** Affixes relating to dodge */
  DODGE = 'dodge',
  /** Affixes relating deflection */
  DEFLECTION = 'deflection',
  /** Affixes relating fire damage, both offensively and defensibly */
  FIRE = 'fire',
  /** Affixes relating cold damage, both offensively and defensibly */
  COLD = 'cold',
  /** Affixes relating lightning damage, both offensively and defensibly */
  LIGHTNING = 'lightning',
  /** Attribute Affixes relating wrath */
  WRATH = 'wrath',
  /** Attribute Affixes relating fortune */
  FORTUNE = 'fortune',
  /** Attribute Affixes relating fortitude */
  FORTITUDE = 'fortitude',
  /** Attribute Affixes relating affinity */
  AFFINITY = 'affinity',
  /** Attribute Affixes relating affinity */
  REGEN_LIFE = 'healthRegen',
  /** Attribute Affixes relating affinity */
  REGEN_MANA = 'manaRegen',
}


/**
 * Represents an affix that can be applied to an item
 */
export interface IAffix {
  /** Unique identifier for the affix in format {type}_{category}_{tier} */
  id: string;
  /** Display name of the affix */
  name: string;
  /** Type of affix (embedded, prefix, or suffix) */
  type: AffixType;
  /** Category of the affix (attack, defense, etc.) */
  category: AffixCategory;
  subCategory?: AffixSubCategory;
  /** Flag to denote if affix is singleValued then it should be a multiplicative affix */
  isMultiplicative?: boolean;
  /** Tier level of the affix (higher tiers are more powerful) */
  tier: AffixTiers;
  /** Minimum possible value for this affix */
  minValue: number;
  /** Maximum possible value for this affix */
  maxValue: number;
  /** Description template with {value} placeholder for the actual value */
  description: string;
  /** Tags for filtering and categorization */
  tags: string[];
  /** Item tiers that this affix can appear on */
  allowedTiers: ItemTierType[];
  /** Item bases that this affix can appear on */
  allowedBases: ItemBase[];
  /** Optional mutations that this affix is compatible with */
  allowedMutations?: ItemMutationType[];
  /** Optional requirements for using this affix */
  requirements?: {
    /** Minimum character level required */
    level?: number;
    /** Required attribute values */
    attributes?: {
      /** Required fortitude value - Mental and physical endurance */
      fortitude?: number;
      /** Required fortune value - Luck and chance-based outcomes */
      fortune?: number;
      /** Required wrath value - Combat prowess and rage */
      wrath?: number;
      /** Required affinity value - Connection to magical forces */
      affinity?: number;
    };
  };
}

// -------------------------------------------------------------------------------
// -----------------------------------LEVELS--------------------------------------
// -------------------------------------------------------------------------------


/**
 * Represents a game level with its properties and configuration
 */
export interface ILevel {
  _identifier: string;
  areaLevel: number;
  name: string;
  description: string;
  preface?: string;
  lootTags: LootType[];
  areaLuckDelta?: number;
  encounterBase: number;
  encounterRangeDeltas: number;
  monsterTypes: MonsterTypes[];
  encounters: IEncounterConfig[];
  completionRules: IProgression[];
  dynamicCompletions: IDynamicProgression[];
  maxUses?: number;
  uses?: number;
  type?: LevelType;
  zone?: DynamicZone;
}

export enum LevelType {
  DEFAULT = 'Default',
  BONUS = 'Bonus',
  INFINITE = 'Infinite',
}

export enum DynamicZone {
  CAVE = 'Cave',
  FORREST = 'Forrest',
  ISLAND = 'Island',

  RIFT = 'Rift',

  CORRUPTED = 'Corrupted',
  VOID = 'Void Touched',
  CRYSTALLIZED = 'Crystallized',
  ABYSS = 'Abyss',
}

export enum DynamicZoneLevelAnchor {
  CHARACTER = 0,
  ZONE
}

export interface IDynamicProgression {
  _identifier: string;
  type: DynamicZone;
  weighting: number;
  limits: number;
  areaLevelDelta: number;
  areaLevelAnchor: DynamicZoneLevelAnchor;
  name?: string;
  description?: string;
  dynamicCompletions?: IDynamicProgression[];
  encounters: IEncounterConfig[];
  lootTags?: LootType[];
  areaLuckDelta?: number;

}

export interface IProgression {
  _identifier: string;
  weighting: number;
  limits?: number;
}

export interface IEncounterConfig {
  type: LevelEncounters,
  weighting: number,
}

export enum LevelEncounters {
  COMBAT = 0,
  RECOVERY,
  TRAP,
  TREASURE,
  CORRUPTED,

  RUINS_0,
  RUINS_1, // Smithy
  RUINS_2, // Arcanum

  CUSTOM_A,
  CUSTOM_B,
  CUSTOM_C,
  CUSTOM_C_BOSS,

}


export interface IEncounter {
  type: LevelEncounters;
  description: string;
  minLevel: number;
  alignment: 'positive' | 'negative' | 'neutral';
  weight?: number, // never instantiate this
}


// -------------------------------------------------------------------------------
// ------------------------------------NEXT---------------------------------------
// -------------------------------------------------------------------------------

/**
 * Calculates scaled experience based on character level and area level
 * @param baseExp The base experience amount
 * @param characterLevel The character's current level
 * @param areaLevel The level of the area
 * @returns The scaled experience amount
 */
export function calculateScaledExperience(baseExp: number, characterLevel: number, areaLevel: number): number {
  const levelDiff = areaLevel - characterLevel;
  const MAX_BONUS_LEVEL_DIFF = 5; // The level difference at which max bonus is achieved
  const MIN_SCALE_FACTOR = 0.1; // Minimum experience multiplier (10% of baseExp)
  const DECAY_RANGE_LEVELS = 10; // Number of levels over which XP decays after peak

  let scaleFactor: number;

  if (levelDiff <= 0) {
    // Area level is equal to or less than character level
    // Experience scales down aggressively, capping at MIN_SCALE_FACTOR
    scaleFactor = Math.max(MIN_SCALE_FACTOR, 1 + (levelDiff * 0.4));
  } else if (levelDiff <= MAX_BONUS_LEVEL_DIFF) {
    // Area level is higher than character level, up to MAX_BONUS_LEVEL_DIFF
    // Experience increases linearly with a 20% bonus per level difference
    scaleFactor = 1 + (levelDiff * 0.2);
  } else {
    // Area level is more than MAX_BONUS_LEVEL_DIFF higher than character level
    // Experience decreases from the peak bonus down to the minimum
    const peakScaleFactor = 1 + (MAX_BONUS_LEVEL_DIFF * 0.2); // Calculate the max bonus achieved at MAX_BONUS_LEVEL_DIFF
    const decaySlope = (peakScaleFactor - MIN_SCALE_FACTOR) / DECAY_RANGE_LEVELS; // Rate of decay

    // Calculate the scaled factor based on the difference from the decay start
    scaleFactor = peakScaleFactor - (decaySlope * (levelDiff - MAX_BONUS_LEVEL_DIFF));

    // Ensure the scale factor does not drop below the minimum
    scaleFactor = Math.max(MIN_SCALE_FACTOR, scaleFactor);
  }

  return Math.floor(baseExp * scaleFactor);
}

/**
 * Generates a random string using the last segment of a UUID and replaces random characters with special symbols
 * @returns {string} Random string with potential special characters
 */
export function generateRandomId(): string {
  let baseId = '';
  try {
    baseId = crypto.randomUUID().split('-')[4]; // Get the last segment instead of first
  }
  catch {
    console.log(`falling back to alternative ID generation as we dont have access to crypto`);
    baseId = generateFallbackId();
  }
  
  const specialChars = '!@#$%^&*';
  const numReplacements = Math.floor(Math.random() * 5); // 0 to 4 replacements
  
  let result = baseId;
  for (let i = 0; i < numReplacements; i++) {
    // Pick a random index between 1 and length-2 to avoid first and last characters
    const randomIndex = Math.floor(Math.random() * (result.length - 2)) + 1;
    const randomSpecialChar = specialChars[Math.floor(Math.random() * specialChars.length)];
    result = result.substring(0, randomIndex) + randomSpecialChar + result.substring(randomIndex + 1);
  }
  
  return result;
}

/**
 * Injects a random subset of letters from the given word into random positions of the given id string.
 * The first and last characters of the id are never replaced.
 * @param word The word to inject letters from (e.g., 'smithy')
 * @param id The base id to inject into (e.g., from generateRandomId())
 * @returns The id with a random spattering of letters from the word
 */
export function smearWordIntoId(word: string): string {
  const id = generateRandomId();
  if (!word || !id || id.length < 3) return id;

  // Randomly select a subset of unique letters from the word (at least 1, at most word.length)
  const wordLetters = Array.from(new Set(word.split('')));
  const numToInject = Math.max(1, Math.floor(Math.random() * wordLetters.length));
  // Pick the first numToInject letters in order
  const lettersToInject = wordLetters.slice(0, numToInject);

  // Get possible positions (excluding first and last)
  const possiblePositions = Array.from({ length: id.length - 2 }, (_, i) => i + 1);
  // Shuffle and pick positions for injection
  const shuffledPositions = possiblePositions.sort(() => Math.random() - 0.5);
  const positionsToInject = shuffledPositions.slice(0, lettersToInject.length).sort((a, b) => a - b);

  // Convert id to array for mutation
  const idArr = id.split('');
  for (let i = 0; i < lettersToInject.length; i++) {
    idArr[positionsToInject[i]] = lettersToInject[i];
  }

  return idArr.join('');
}


/**
 * Generates a fallback unique ID when crypto.randomUUID() is not available
 * Uses timestamp, random numbers, and Math.random() to create a unique string
 * @returns {string} A unique string ID
 */
function generateFallbackId(): string {
  const randomStr = Math.random().toString(36).substring(2, 8); // Get 6 random chars
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(6, '0'); // 6 digit random number
  
  // Combine and shuffle the segments
  const combined = randomStr + randomNum;
  const shuffled = combined.split('')
    .sort(() => Math.random() - 0.5)
    .join('');
  
  return shuffled;
}



export enum BackgroundTypes {
  DEFAULT = 0,
  WAVE,
  STARS,
  FIREFLIES,
}


export enum AddLevelCondition {
  NOT_EXISTING = 0,
  NO_MORE_THAN_TWO,
}

// -------------------------------------------------------------------------------
// ------------------------------------World--------------------------------------
// -------------------------------------------------------------------------------


export enum WorldUnlockable {
  TOWN = 'town',
}

export enum TownUnlockable {
  SMITH = 'Smithy',
  ARCANUM = 'Arcanum',
}

// -------------------------------------------------------------------------------
// ---------------------------------Onboarding------------------------------------
// -------------------------------------------------------------------------------

export const ONBOARDING_CANVAS_ID = 'onboarding_canvas';
