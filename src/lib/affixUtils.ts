import type { AffixValue, IBaseAffix } from '@/lib/affixTypes';
import { BaseItemAffix, BASE_ITEM_AFFIX_CONFIG } from './affixTypes';
import { AffixTypes } from './core';

/**
 * Gets the actual value from an affix based on its type
 * @param affix The affix object containing the value
 * @returns The calculated value based on the affix type
 */
export function getAffixValue(affix: { value: AffixValue } | IBaseAffix): number {
  switch (affix.value.type) {
    case AffixTypes.ADDITIVE:
      return affix.value.value;
    case AffixTypes.MULTIPLICATIVE:
      // as these are multipliers, if value is more than 1, i.e: 33% assume it needs normalizing s
      if (affix.value.value > 1) {
        return (affix.value.value / 100)
      }
      return affix.value.value;
    default:
      return 0; // Fallback for unknown value types
  }
}

/**
 * Gets the range of possible values for an affix
 * @param affix The affix object containing the value
 * @returns An object containing the lower and upper bounds of the value range
 */
export function getAffixValueRange(affix: { value: AffixValue }): { lower: number, upper: number } {
  switch (affix.value.type) {
    case AffixTypes.RANGE:
      return { lower: affix.value.minValue, upper: affix.value.maxValue };
    default:
      return { lower: 0, upper: 0 }; // Fallback for unknown value types
  }
}

/**
 * Calculates the average value from a range
 * @param valueRange The range object containing lower and upper bounds
 * @returns The rounded average of the range values
 */
export function resolveAverageOfRange(valueRange: { lower: number, upper: number }){
  return Math.round((valueRange.lower + valueRange.upper)/2)
}

/**
 * Gets a single affix configuration based on the BaseItemAffix enum value
 * @param affixType The BaseItemAffix enum value to search for
 * @returns The matching IBaseAffix configuration or undefined if not found
 */
export function getAffixByType(affixType: BaseItemAffix): IBaseAffix | undefined {
  // Search through all item types
  for (const itemType of Object.values(BASE_ITEM_AFFIX_CONFIG)) {
    const foundAffix = itemType.find(affix => affix.affix === affixType);
    if (foundAffix) {
      return foundAffix;
    }
  }
  return undefined;
}
