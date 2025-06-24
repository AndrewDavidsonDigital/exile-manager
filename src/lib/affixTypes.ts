import { AffixTypes } from './core';
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