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


/**
 * Calculates dodge chance based on evasion rating and area level
 * Formula: base + (1 - base) * (1 - e^(-scaling * normalized_evasion))
 * Where normalized_evasion scales based on area level
 */
export function calculateDodgeChance(evasion: number, level: number): number {
  // Clamp level between MIN_LEVEL and MAX_LEVEL
  const clampedLevel = Math.max(MIN_LEVEL, Math.min(level, MAX_LEVEL));
  
  // Calculate expected evasion for this level
  const levelProgress = (clampedLevel - MIN_LEVEL) / (MAX_LEVEL - MIN_LEVEL);
  const areaLevelRelativeEvasion = MIN_EVASION + (MAX_EVASION - MIN_EVASION) * levelProgress;
  
  // Normalize evasion relative to expected value for this level
  const normalizedEvasion = evasion / areaLevelRelativeEvasion;
  
  // Calculate dodge chance using normalized evasion
  const dodgeChance = DODGE_CHANCE_BASE + (1 - DODGE_CHANCE_BASE) * (1 - Math.exp(-DODGE_CHANCE_SCALING * normalizedEvasion * 1000));
  return Math.round((Math.min(dodgeChance, MAX_DODGE_CHANCE)) * 100);
}



// Dodge chance calculation constants
const MAX_DODGE_CHANCE = 0.80; // 80% maximum dodge chance   // 840-1,258 base evasion needed
const DODGE_CHANCE_BASE = 0.05; // 5% base dodge chance
const DODGE_CHANCE_SCALING = 0.0001; // Scaling factor for dodge chance calculation

// Level-based scaling constants
const MIN_LEVEL = 1;
const MAX_LEVEL = 100;
const MIN_EVASION = 40;
const MAX_EVASION = 1000;
