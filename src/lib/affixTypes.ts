import type { ItemTierType, ItemMutationType } from './game';
import type { OneOf } from './typescript';

export type AdditiveValue = {
  type: 'additive';
  value: number;
}

export type MultiplicativeValue = {
  type: 'multiplicative';
  value: number;
}

export type RangeValue = {
  type: 'range';
  minValue: number;
  maxValue: number;
}

export type AffixValue = OneOf<[AdditiveValue, MultiplicativeValue, RangeValue]>;

export function isAffixRange(value: AdditiveValue | MultiplicativeValue| RangeValue ): value is RangeValue {
    return value.type === 'range';
}

/**
 * Represents the different types of affixes that can be applied to items
 * @enum {string}
 */
export enum AffixType {
    /** Immutable affixes that are inherent to the item, similar to Path of Exile's implicit modifiers */
    EMBEDDED = 'embedded',
    /** Primarily offensive stats but can include some highly effective defensive stats */
    PREFIX = 'prefix',
    /** Primarily defensive stats but can include some highly effective offensive stats */
    SUFFIX = 'suffix'
}

export enum AffixCategory {
    ATTACK = 'attack',
    DEFENSE = 'defense',
    EVASION = 'evasion',
    LIFE = 'life',
    MANA = 'mana',
    RESISTANCE = 'resistance',
    ATTRIBUTE = 'attribute',
    UTILITY = 'utility',
    ELEMENTAL = 'elemental',
    PHYSICAL = 'physical',
    CHAOS = 'chaos',
    CRITICAL = 'critical',
    SPELL = 'spell',
    MOVEMENT = 'movement',
    CRAFTING = 'crafting'
}

/**
 * Represents an affix that can be applied to an item
 * @interface IAffix
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
    allowedTiers: ItemTierType[];
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
        id: 'embedded_defense_1',
        name: 'Reinforced',
        type: AffixType.EMBEDDED,
        category: AffixCategory.DEFENSE,
        tier: 1,
        minValue: 5,
        maxValue: 8,
        description: '+{value} to Armor',
        tags: ['defense', 'armor'],
        allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused']
    },
    {
        id: 'embedded_defense_2',
        name: 'Fortified',
        type: AffixType.EMBEDDED,
        category: AffixCategory.DEFENSE,
        tier: 2,
        minValue: 8,
        maxValue: 12,
        description: '+{value} to Armor',
        tags: ['defense', 'armor'],
        allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused']
    },
    {
        id: 'embedded_defense_3',
        name: 'Impenetrable',
        type: AffixType.EMBEDDED,
        category: AffixCategory.DEFENSE,
        tier: 3,
        minValue: 12,
        maxValue: 18,
        description: '+{value} to Armor',
        tags: ['defense', 'armor'],
        allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused']
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
        description: '+{value}% to all Elemental Resistances',
        tags: ['elemental', 'resistance'],
        allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused'],
        allowedMutations: ['crystallized']
    },
    {
        id: 'embedded_elemental_2',
        name: 'Prismatic',
        type: AffixType.EMBEDDED,
        category: AffixCategory.ELEMENTAL,
        tier: 2,
        minValue: 2,
        maxValue: 5,
        description: '+{value}% to all Elemental Resistances',
        tags: ['elemental', 'resistance'],
        allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused'],
        allowedMutations: ['crystallized']
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
        description: '+{value} to Evasion',
        tags: ['defense', 'evasion'],
        allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused']
    },
    {
        id: 'embedded_evasion_2',
        name: 'Nimble',
        type: AffixType.EMBEDDED,
        category: AffixCategory.EVASION,
        tier: 2,
        minValue: 8,
        maxValue: 12,
        description: '+{value} to Evasion',
        tags: ['defense', 'evasion'],
        allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused']
    },
    {
        id: 'embedded_evasion_3',
        name: 'Elusive',
        type: AffixType.EMBEDDED,
        category: AffixCategory.EVASION,
        tier: 3,
        minValue: 12,
        maxValue: 18,
        description: '+{value} to Evasion',
        tags: ['defense', 'evasion'],
        allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused']
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
        description: 'Adds {value} to {value} Physical Damage',
        tags: ['physical', 'attack', 'weapon'],
        allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused']
    },
    {
        id: 'prefix_physical_2',
        name: 'Savage',
        type: AffixType.PREFIX,
        category: AffixCategory.PHYSICAL,
        tier: 2,
        minValue: 2,
        maxValue: 4,
        description: 'Adds {value} to {value} Physical Damage',
        tags: ['physical', 'attack', 'weapon'],
        allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused']
    },
    {
        id: 'prefix_physical_3',
        name: 'Merciless',
        type: AffixType.PREFIX,
        category: AffixCategory.PHYSICAL,
        tier: 3,
        minValue: 4,
        maxValue: 7,
        description: 'Adds {value} to {value} Physical Damage',
        tags: ['physical', 'attack', 'weapon'],
        allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused']
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
        description: 'Adds {value} to {value} Fire Damage',
        tags: ['elemental', 'fire', 'attack', 'weapon'],
        allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused']
    },
    {
        id: 'prefix_elemental_2',
        name: 'Flaming',
        type: AffixType.PREFIX,
        category: AffixCategory.ELEMENTAL,
        tier: 2,
        minValue: 3,
        maxValue: 6,
        description: 'Adds {value} to {value} Fire Damage',
        tags: ['elemental', 'fire', 'attack', 'weapon'],
        allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused']
    },
    // Critical Category
    {
        id: 'prefix_critical_1',
        name: 'Precise',
        type: AffixType.PREFIX,
        category: AffixCategory.CRITICAL,
        tier: 1,
        minValue: 10,
        maxValue: 20,
        description: '+{value}% to Critical Strike Chance',
        tags: ['critical', 'attack', 'weapon'],
        allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused']
    },
    {
        id: 'prefix_critical_2',
        name: 'Deadly',
        type: AffixType.PREFIX,
        category: AffixCategory.CRITICAL,
        tier: 2,
        minValue: 20,
        maxValue: 40,
        description: '+{value}% to Critical Strike Chance',
        tags: ['critical', 'attack', 'weapon'],
        allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused']
    },
    {
        id: 'prefix_critical_3',
        name: 'Merciless',
        type: AffixType.PREFIX,
        category: AffixCategory.CRITICAL,
        tier: 3,
        minValue: 40,
        maxValue: 60,
        description: '+{value}% to Critical Strike Chance',
        tags: ['critical', 'attack', 'weapon'],
        allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused']
    }
];

/**
 * List of all available suffix affixes
 */
export const suffixAffixes: IAffix[] = [
    // Defense Category
    {
        id: 'suffix_defense_1',
        name: 'of the Turtle',
        type: AffixType.SUFFIX,
        category: AffixCategory.DEFENSE,
        tier: 1,
        minValue: 5,
        maxValue: 8,
        description: '+{value}% to Physical Damage Reduction',
        tags: ['defense', 'physical', 'armor'],
        allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused']
    },
    {
        id: 'suffix_defense_2',
        name: 'of the Rhino',
        type: AffixType.SUFFIX,
        category: AffixCategory.DEFENSE,
        tier: 2,
        minValue: 8,
        maxValue: 12,
        description: '+{value}% to Physical Damage Reduction',
        tags: ['defense', 'physical', 'armor'],
        allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused']
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
        description: '+{value} to Maximum Life',
        tags: ['life', 'defense'],
        allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused']
    },
    {
        id: 'suffix_life_2',
        name: 'of the Whale',
        type: AffixType.SUFFIX,
        category: AffixCategory.LIFE,
        tier: 2,
        minValue: 8,
        maxValue: 12,
        description: '+{value} to Maximum Life',
        tags: ['life', 'defense'],
        allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused']
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
        description: '+{value} to Maximum Mana',
        tags: ['mana', 'spell'],
        allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused']
    },
    {
        id: 'suffix_mana_2',
        name: 'of the Sage',
        type: AffixType.SUFFIX,
        category: AffixCategory.MANA,
        tier: 2,
        minValue: 8,
        maxValue: 12,
        description: '+{value} to Maximum Mana',
        tags: ['mana', 'spell'],
        allowedTiers: ['enhanced', 'exceptional', 'abstract', 'infused']
    }
];

// Combined list of all affixes
export const allAffixes: IAffix[] = [
    ...embeddedAffixes,
    ...prefixAffixes,
    ...suffixAffixes
]; 