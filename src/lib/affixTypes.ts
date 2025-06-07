import { type ItemTierType, type ItemMutationType, type ItemBase, AffixTypes } from './core';
import { allItemTypes } from './itemUtils';
import type { OneOf } from './typescript';


/**
 * Represents an additive value modifier
 */
export type AdditiveValue = {
  type: AffixTypes.ADDITIVE;
  value: number;
}

/**
 * Represents a multiplicative value modifier
 */
export type MultiplicativeValue = {
  type: AffixTypes.MULTIPLICATIVE;
  value: number;
}

/**
 * Represents a range of possible values
 */
export type RangeValue = {
  type: AffixTypes.RANGE;
  minValue: number;
  maxValue: number;
}

export enum BaseItemAffix {
  /** Base Armor Affix for increasing Armor */
  ARM_ARMOR = 'armor',
  /** Base Armor Affix for increasing Evasion */
  ARM_EVASION = 'evasion',
  /** Base Armor Affix for increasing Health */
  ARM_HEALTH = 'health',

  /** Base Weapon Affix for replacing base-attack value with one of Physical */
  WEA_PHYS_PHYSICAL = 'physical',
  /** Base Weapon Affix for replacing base-attack value with one of Fire */
  WEA_FIRE = 'fire',
  /** Base Weapon Affix for replacing base-attack value with one of Cold */
  WEA_COLD = 'cold',
  /** Base Weapon Affix for replacing base-attack value with one of Lightning */
  WEA_LIGHTNING = 'lightning',

  /** Base Accessory Affix for adding base Physical Resistance */
  ACC_RES_PHYSICAL = 'res_physical',
  /** Base Accessory Affix for adding base Fire Resistance */
  ACC_RES_FIRE= 'res_fire',
  /** Base Accessory Affix for adding base Cold Resistance */
  ACC_RES_COLD = 'res_cold',
  /** Base Accessory Affix for adding base Lightning Resistance */
  ACC_RES_LIGHTNING = 'res_lightning',
}

/**
 * Represents a base affix with its name and value
 */
export interface IBaseAffix {
  affix: BaseItemAffix;
  name: string;
  value: AdditiveValue | MultiplicativeValue| RangeValue;
}

/**
 * Configuration for base affixes by item type
 */
interface IBaseAffixConfig {
  ARMOUR: IBaseAffix[];
  WEAPON: IBaseAffix[];
  ACCESSORY: IBaseAffix[];
}

/**
 * Configuration for base item affixes
 */
export const BASE_ITEM_AFFIX_CONFIG: Readonly<IBaseAffixConfig> = {
  ARMOUR: [
    {
      affix: BaseItemAffix.ARM_ARMOR,
      name: 'Armour',
      value: {
        type: AffixTypes.ADDITIVE,
        value: 5,
      },
    },
    {
      affix: BaseItemAffix.ARM_EVASION,
      name: 'Evasion',
      value: {
        type: AffixTypes.ADDITIVE,
        value: 8,
      },
    },
    {
      affix: BaseItemAffix.ARM_HEALTH,
      name: 'Health',
      value: {
        type: AffixTypes.ADDITIVE,
        value: 8,
      },
    }
  ],
  WEAPON: [
    {
      affix: BaseItemAffix.WEA_PHYS_PHYSICAL,
      name: 'Physical Damage',
      value: {
        type: AffixTypes.ADDITIVE,
        value: 15,
      },
    },
    {
      affix: BaseItemAffix.WEA_FIRE,
      name: 'Fire Damage',
      value: {
        type: AffixTypes.ADDITIVE,
        value: 15,
      },
    },
    {
      affix: BaseItemAffix.WEA_COLD,
      name: 'Cold Damage',
      value: {
        type: AffixTypes.ADDITIVE,
        value: 15,
      },
    },
    {
      affix: BaseItemAffix.WEA_LIGHTNING,
      name: 'Lightning Damage',
      value: {
        type: AffixTypes.ADDITIVE,
        value: 15,
      },
    }
  ],
  ACCESSORY: [
    {
      affix: BaseItemAffix.ACC_RES_PHYSICAL,
      name: 'Physical Resistance',
      value: {
        type: AffixTypes.ADDITIVE,
        value: 5,
      },
    },
    {
      affix: BaseItemAffix.ACC_RES_FIRE,
      name: 'Fire Resistance',
      value: {
        type: AffixTypes.ADDITIVE,
        value: 5,
      },
    },
    {
      affix: BaseItemAffix.ACC_RES_COLD,
      name: 'Cold Resistance',
      value: {
        type: AffixTypes.ADDITIVE,
        value: 5,
      },
    },
    {
      affix: BaseItemAffix.ACC_RES_LIGHTNING,
      name: 'Lightning Resistance',
      value: {
        type: AffixTypes.ADDITIVE,
        value: 5,
      },
    }
  ]
};

/**
 * Union type of all possible affix value types
 */
export type AffixValue = OneOf<[AdditiveValue, MultiplicativeValue, RangeValue]>;

/**
 * Type guard to check if a value is a range value
 * @param value The value to check
 * @returns True if the value is a range value
 */
export function isAffixRange(value: AdditiveValue | MultiplicativeValue| RangeValue ): value is RangeValue {
  return value.type === AffixTypes.RANGE;
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
  /** Flag to denote if affix is singleValued then it should be a multiplicative affix */
  isMultiplicative?: boolean;
  /** Tier level of the affix (higher tiers are more powerful) */
  tier: number;
  /** Minimum possible value for this affix */
  minValue: number;
  /** Maximum possible value for this affix */
  maxValue: number;
  /** Description template with {value} placeholder for the actual value */
  description: string;
  /** Tags for filtering and categorization */
  tags: string[];
  /** Item tiers that this affix can appear on */
  minILevel?: number,
  /** Item tiers that this affix can appear on */
  maxILevel?: number,
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

/**
 * List of all available embedded affixes
 */
export const embeddedAffixes: IAffix[] = [
  // Defense Category
  {
    id: 'embedded_armor_1',
    name: 'Reinforced',
    type: AffixType.EMBEDDED,
    category: AffixCategory.ARMOR,
    tier: 1,
    minValue: 5,
    maxValue: 8,
    minILevel: 0,
    maxILevel: 10,
    description: '+{value} to Armor',
    tags: ['defense', 'armor'],
    allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused'],
    allowedBases: [...allItemTypes],
  },
  {
    id: 'embedded_armor_2',
    name: 'Fortified',
    type: AffixType.EMBEDDED,
    category: AffixCategory.ARMOR,
    tier: 2,
    minValue: 8,
    maxValue: 12,
    minILevel: 5,
    maxILevel: 15,
    description: '+{value} to Armor',
    tags: ['defense', 'armor'],
    allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused'],
    allowedBases: [...allItemTypes],
  },
  {
    id: 'embedded_armor_3',
    name: 'Impenetrable',
    type: AffixType.EMBEDDED,
    category: AffixCategory.ARMOR,
    tier: 3,
    minValue: 12,
    maxValue: 18,
    minILevel: 10,
    maxILevel: Infinity,
    description: '+{value} to Armor',
    tags: ['defense', 'armor'],
    allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused'],
    allowedBases: [...allItemTypes],
  },
  // Elemental Category
  {
    id: 'embedded_elemental_1',
    name: 'Crystallized',
    type: AffixType.EMBEDDED,
    category: AffixCategory.ELEMENTAL,
    tier: 1,
    minValue: 1,
    maxValue: 3,
    minILevel: 0,
    maxILevel: 10,
    description: '+{value}% to all Elemental Resistances',
    tags: ['elemental', 'resistance'],
    allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused'],
    allowedMutations: ['crystallized'],
    allowedBases: [...allItemTypes],
  },
  {
    id: 'embedded_elemental_2',
    name: 'Prismatic',
    type: AffixType.EMBEDDED,
    category: AffixCategory.ELEMENTAL,
    tier: 2,
    minValue: 2,
    maxValue: 5,
    minILevel: 5,
    maxILevel: 15,
    description: '+{value}% to all Elemental Resistances',
    tags: ['elemental', 'resistance'],
    allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused'],
    allowedMutations: ['crystallized'],
    allowedBases: [...allItemTypes],
  },
  {
    id: 'embedded_elemental_3',
    name: 'Crystalline',
    type: AffixType.EMBEDDED,
    category: AffixCategory.ELEMENTAL,
    tier: 3,
    minValue: 3,
    maxValue: 7,
    minILevel: 10,
    maxILevel: Infinity,
    description: '+{value}% to all Elemental Resistances',
    tags: ['elemental', 'resistance'],
    allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused'],
    allowedMutations: ['crystallized'],
    allowedBases: [...allItemTypes],
  },
  // Evasion Category
  {
    id: 'embedded_evasion_1',
    name: 'Agile',
    type: AffixType.EMBEDDED,
    category: AffixCategory.EVASION,
    tier: 1,
    minValue: 5,
    maxValue: 8,
    minILevel: 0,
    maxILevel: 10,
    description: '+{value} to Evasion',
    tags: ['defense', 'evasion'],
    allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused'],
    allowedBases: [...allItemTypes],
  },
  {
    id: 'embedded_evasion_2',
    name: 'Nimble',
    type: AffixType.EMBEDDED,
    category: AffixCategory.EVASION,
    tier: 2,
    minValue: 8,
    maxValue: 12,
    minILevel: 5,
    maxILevel: 15,
    description: '+{value} to Evasion',
    tags: ['defense', 'evasion'],
    allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused'],
    allowedBases: [...allItemTypes],
  },
  {
    id: 'embedded_evasion_3',
    name: 'Elusive',
    type: AffixType.EMBEDDED,
    category: AffixCategory.EVASION,
    tier: 3,
    minValue: 12,
    maxValue: 18,
    minILevel: 10,
    maxILevel: Infinity,
    description: '+{value} to Evasion',
    tags: ['defense', 'evasion'],
    allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused'],
    allowedBases: [...allItemTypes],
  }
];

/**
 * List of all available prefix affixes
 */
export const prefixAffixes: IAffix[] = [
  // Physical Category
  {
    id: 'prefix_physical_1',
    name: 'Brutal',
    type: AffixType.PREFIX,
    category: AffixCategory.PHYSICAL,
    tier: 1,
    minValue: 1,
    maxValue: 2,
    minILevel: 0,
    maxILevel: 10,
    description: 'Adds {value} to {value} Physical Damage',
    tags: ['physical', 'attack', 'weapon'],
    allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused'],
    allowedBases: [...allItemTypes],
  },
  {
    id: 'prefix_physical_2',
    name: 'Savage',
    type: AffixType.PREFIX,
    category: AffixCategory.PHYSICAL,
    tier: 2,
    minValue: 2,
    maxValue: 4,
    minILevel: 5,
    maxILevel: 15,
    description: 'Adds {value} to {value} Physical Damage',
    tags: ['physical', 'attack', 'weapon'],
    allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused'],
    allowedBases: [...allItemTypes],
  },
  {
    id: 'prefix_physical_3',
    name: 'Merciless',
    type: AffixType.PREFIX,
    category: AffixCategory.PHYSICAL,
    tier: 3,
    minValue: 4,
    maxValue: 7,
    minILevel: 10,
    maxILevel: Infinity,
    description: 'Adds {value} to {value} Physical Damage',
    tags: ['physical', 'attack', 'weapon'],
    allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused'],
    allowedBases: [...allItemTypes],
  },
  // Elemental Category
  {
    id: 'prefix_elemental_1',
    name: 'Burning',
    type: AffixType.PREFIX,
    category: AffixCategory.ELEMENTAL,
    tier: 1,
    minValue: 1,
    maxValue: 3,
    minILevel: 0,
    maxILevel: 10,
    description: 'Adds {value} to {value} Fire Damage',
    tags: ['elemental', 'fire', 'attack', 'weapon'],
    allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused'],
    allowedBases: [...allItemTypes],
  },
  {
    id: 'prefix_elemental_2',
    name: 'Flaming',
    type: AffixType.PREFIX,
    category: AffixCategory.ELEMENTAL,
    tier: 2,
    minValue: 3,
    maxValue: 6,
    minILevel: 5,
    maxILevel: 15,
    description: 'Adds {value} to {value} Fire Damage',
    tags: ['elemental', 'fire', 'attack', 'weapon'],
    allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused'],
    allowedBases: [...allItemTypes],
  },
  {
    id: 'prefix_elemental_3',
    name: 'Infernal',
    type: AffixType.PREFIX,
    category: AffixCategory.ELEMENTAL,
    tier: 3,
    minValue: 5,
    maxValue: 9,
    minILevel: 10,
    maxILevel: Infinity,
    description: 'Adds {value} to {value} Fire Damage',
    tags: ['elemental', 'fire', 'attack', 'weapon'],
    allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused'],
    allowedBases: [...allItemTypes],
  },
  // Critical Category
  {
    id: 'prefix_critical_1',
    name: 'Precise',
    isMultiplicative: true,
    type: AffixType.PREFIX,
    category: AffixCategory.CRITICAL,
    tier: 1,
    minValue: 10,
    maxValue: 20,
    minILevel: 0,
    maxILevel: 10,
    description: '{value}% increase Critical Strike Chance',
    tags: ['critical', 'attack', 'weapon'],
    allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused'],
    allowedBases: [...allItemTypes],
  },
  {
    id: 'prefix_critical_2',
    name: 'Deadly',
    isMultiplicative: true,
    type: AffixType.PREFIX,
    category: AffixCategory.CRITICAL,
    tier: 2,
    minValue: 20,
    maxValue: 40,
    minILevel: 5,
    maxILevel: 15,
    description: '{value}% increase Critical Strike Chance',
    tags: ['critical', 'attack', 'weapon'],
    allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused'],
    allowedBases: [...allItemTypes],
  },
  {
    id: 'prefix_critical_3',
    name: 'Merciless',
    isMultiplicative: true,
    type: AffixType.PREFIX,
    category: AffixCategory.CRITICAL,
    tier: 3,
    minValue: 40,
    maxValue: 60,
    minILevel: 10,
    maxILevel: Infinity,
    description: '{value}% increase Critical Strike Chance',
    tags: ['critical', 'attack', 'weapon'],
    allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused'],
    allowedBases: [...allItemTypes],
  }
];

/**
 * List of all available suffix affixes
 */
export const suffixAffixes: IAffix[] = [
  // Defense Category
  {
    id: 'suffix_armor_1',
    name: 'of the Turtle',
    type: AffixType.SUFFIX,
    category: AffixCategory.ARMOR,
    tier: 1,
    minValue: 5,
    maxValue: 8,
    minILevel: 0,
    maxILevel: 10,
    description: '+{value}% to Physical Damage Reduction',
    tags: ['defense', 'physical'],
    allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused'],
    allowedBases: [...allItemTypes],
  },
  {
    id: 'suffix_armor_2',
    name: 'of the Rhino',
    type: AffixType.SUFFIX,
    category: AffixCategory.ARMOR,
    tier: 2,
    minValue: 8,
    maxValue: 12,
    minILevel: 5,
    maxILevel: 15,
    description: '+{value}% to Physical Damage Reduction',
    tags: ['defense', 'physical'],
    allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused'],
    allowedBases: [...allItemTypes],
  },
  {
    id: 'suffix_armor_3',
    name: 'of the Dragon',
    type: AffixType.SUFFIX,
    category: AffixCategory.ARMOR,
    tier: 3,
    minValue: 12,
    maxValue: 18,
    minILevel: 10,
    maxILevel: Infinity,
    description: '+{value}% to Physical Damage Reduction',
    tags: ['defense', 'physical'],
    allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused'],
    allowedBases: [...allItemTypes],
  },
  // Life Category
  {
    id: 'suffix_life_1',
    name: 'of the Bear',
    type: AffixType.SUFFIX,
    category: AffixCategory.LIFE,
    tier: 1,
    minValue: 5,
    maxValue: 8,
    minILevel: 0,
    maxILevel: 10,
    description: '+{value} to Maximum Life',
    tags: ['life', 'defense'],
    allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused'],
    allowedBases: [...allItemTypes],
  },
  {
    id: 'suffix_life_2',
    name: 'of the Whale',
    type: AffixType.SUFFIX,
    category: AffixCategory.LIFE,
    tier: 2,
    minValue: 8,
    maxValue: 12,
    minILevel: 5,
    maxILevel: 15,
    description: '+{value} to Maximum Life',
    tags: ['life', 'defense'],
    allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused'],
    allowedBases: [...allItemTypes],
  },
  {
    id: 'suffix_life_3',
    name: 'of the Phoenix',
    type: AffixType.SUFFIX,
    category: AffixCategory.LIFE,
    tier: 3,
    minValue: 12,
    maxValue: 18,
    minILevel: 10,
    maxILevel: Infinity,
    description: '+{value} to Maximum Life',
    tags: ['life', 'defense'],
    allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused'],
    allowedBases: [...allItemTypes],
  },
  // Mana Category
  {
    id: 'suffix_mana_1',
    name: 'of the Mind',
    type: AffixType.SUFFIX,
    category: AffixCategory.MANA,
    tier: 1,
    minValue: 5,
    maxValue: 8,
    minILevel: 0,
    maxILevel: 10,
    description: '+{value} to Maximum Mana',
    tags: ['mana', 'spell'],
    allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused'],
    allowedBases: [...allItemTypes],
  },
  {
    id: 'suffix_mana_2',
    name: 'of the Sage',
    type: AffixType.SUFFIX,
    category: AffixCategory.MANA,
    tier: 2,
    minValue: 8,
    maxValue: 12,
    minILevel: 5,
    maxILevel: 15,
    description: '+{value} to Maximum Mana',
    tags: ['mana', 'spell'],
    allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused'],
    allowedBases: [...allItemTypes],
  },
  {
    id: 'suffix_mana_3',
    name: 'of the Archmage',
    type: AffixType.SUFFIX,
    category: AffixCategory.MANA,
    tier: 3,
    minValue: 12,
    maxValue: 18,
    minILevel: 10,
    maxILevel: Infinity,
    description: '+{value} to Maximum Mana',
    tags: ['mana', 'spell'],
    allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused'],
    allowedBases: [...allItemTypes],
  }
];

/**
 * Combined list of all affixes
 */
export const allAffixes: IAffix[] = [
  ...embeddedAffixes,
  ...prefixAffixes,
  ...suffixAffixes
];