/**
 * Represents the possible value types for an affix
 */
export type AffixValue = 
  | { additive: number }
  | { multiplicative: number }
  | { range: { min: number; max: number } }; 