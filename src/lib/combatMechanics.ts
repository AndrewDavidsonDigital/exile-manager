export enum EnemyTier {
  BASIC = 'basic',
  ELITE = 'elite',
  BOSS = 'boss'
}

export const CRITICAL_STRIKE_CONSTANTS = {
  /** Maximum possible critical strike chance from all sources */
  MAX_CRIT_CHANCE: 30,
  /** Base chance for a super critical strike */
  SUPER_CRIT_CHANCE: 5,
  /** Health recovery percentage on non-execution critical strikes */
  CRIT_HEALTH_RECOVERY: 10,
  /** Base 5% critical strike chance */
  BASE_CRIT_CHANCE: 5,
  /** Execution thresholds based on enemy tier */
  EXECUTION_THRESHOLDS: {
    [EnemyTier.BASIC]: 30,
    [EnemyTier.ELITE]: 25,
    [EnemyTier.BOSS]: 10
  }
} as const;

export interface CriticalStrikeResult {
  /** Whether the attack was a critical strike */
  isCritical: boolean;
  /** Whether the critical strike was a super critical */
  isSuperCritical: boolean;
  /** Whether the critical strike resulted in an execution */
  isExecution: boolean;
  /** The amount of health recovered (if any) */
  healthRecovered?: number;
}

export interface CriticalStrikeParams {
    /** The enemy's current health percentage */
    targetHealthPercent: number;
    /** The enemy's tier */
    enemyTier: EnemyTier;
    /** The attacker's maximum health */
    attackerMaxHealth: number;
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

/**
 * Calculates the total critical strike chance based on affix bonuses
 * @param affixBonus The critical strike chance bonus from affixes as a percentage (e.g., 20 for 20%)
 * @returns The final critical strike chance (capped at MAX_CRIT_CHANCE)
 */
export function calculateCriticalChance(affixBonus: number): number {
    // Convert percentage to multiplier (e.g., 20% becomes 0.2)
    const multiplier = 1 + (affixBonus / 100);
    const totalChance = CRITICAL_STRIKE_CONSTANTS.BASE_CRIT_CHANCE * multiplier;
    return Number(Math.min(CRITICAL_STRIKE_CONSTANTS.MAX_CRIT_CHANCE, totalChance).toFixed(0));
}
