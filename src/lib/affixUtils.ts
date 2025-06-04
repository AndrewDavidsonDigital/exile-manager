import type { AffixValue } from '@/lib/affixTypes';

/**
 * Gets the actual value from an affix based on its type
 * @param affix The affix object containing the value
 * @returns The calculated value based on the affix type
 */
export function getAffixValue(affix: { value: AffixValue }): number {
  switch (affix.value.type) {
    case 'additive':
      return affix.value.value;
    case 'multiplicative':
      return affix.value.value;
    default:
      return 0; // Fallback for unknown value types
  }
}
export function getAffixValueRange(affix: { value: AffixValue }): { lower: number, upper: number } {
  switch (affix.value.type) {
    case 'range':
      return { lower: affix.value.minValue, upper: affix.value.maxValue };
    default:
      return { lower: 0, upper: 0 }; // Fallback for unknown value types
  }
}

export function resolveAverageOfRange(valueRange: { lower: number, upper: number }){
  return Math.round((valueRange.lower + valueRange.upper)/2)
}
