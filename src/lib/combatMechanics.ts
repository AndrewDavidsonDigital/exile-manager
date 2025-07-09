/**
 * Represents the different tiers of enemies that can be encountered
 * BASIC: Standard enemies with normal stats
 * ELITE: TBD
 * BOSS: TBD
 */
export enum EnemyTier {
  BASIC = 'basic',
  ELITE = 'elite',
  BOSS = 'boss'
}

/*************************************************************************************************/
/***************************************** DODGE *************************************************/
/*************************************************************************************************/

/**
 * Constants for dodge chance calculations
 */
export const DODGE_CONSTANTS = {
  /** 80% maximum dodge chance */
  MAX_DODGE_CHANCE: 0.80,
  /** 5% base dodge chance */
  DODGE_CHANCE_BASE: 0.05,
  /** Scaling factor for dodge chance calculation */
  DODGE_CHANCE_SCALING: 0.00156,
} as const;

/**
 * Calculates dodge chance based on evasion rating and area level.
 * Formula: base + (1 - base) * (1 - e^(-scaling * normalized_evasion))
 * Where normalized_evasion scales based on area level.
 *
 * @param evasion - The character's evasion rating.
 * @param level - The area level.
 * @returns The calculated dodge chance as a percentage (0-100).
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
  const dodgeChance = DODGE_CONSTANTS.DODGE_CHANCE_BASE + (1 - DODGE_CONSTANTS.DODGE_CHANCE_BASE) * (1 - Math.exp(-DODGE_CONSTANTS.DODGE_CHANCE_SCALING * normalizedEvasion * 1000));
  return Math.round((Math.min(dodgeChance, DODGE_CONSTANTS.MAX_DODGE_CHANCE)) * 100);
}

// Level-based scaling constants
const MIN_LEVEL = 1;
const MAX_LEVEL = 100;
const MIN_EVASION = 40;
const MAX_EVASION = 2000;

/**
 * Calculates the required evasion to achieve a desired dodge chance at a given level.
 * @param desiredDodgeChance - The desired dodge chance as a percentage (0-80).
 * @param level - The area/character level.
 * @returns The required evasion value.
 */
export function getEvasionForDodgeChance(desiredDodgeChance: number, level: number): number {
  // Clamp level between MIN_LEVEL and MAX_LEVEL
  const clampedLevel = Math.max(MIN_LEVEL, Math.min(level, MAX_LEVEL));

  // Calculate expected evasion for this level
  const levelProgress = (clampedLevel - MIN_LEVEL) / (MAX_LEVEL - MIN_LEVEL);
  const areaLevelRelativeEvasion = MIN_EVASION + (MAX_EVASION - MIN_EVASION) * levelProgress;

  // Convert desired dodge chance to decimal
  const D = Math.min(desiredDodgeChance, DODGE_CONSTANTS.MAX_DODGE_CHANCE * 100) / 100;
  const B = DODGE_CONSTANTS.DODGE_CHANCE_BASE;
  const S = DODGE_CONSTANTS.DODGE_CHANCE_SCALING;

  // Prevent impossible values
  if (D <= B) return 0;
  if (D >= DODGE_CONSTANTS.MAX_DODGE_CHANCE) return Infinity;

  // Invert the dodge formula
  const N = -Math.log(1 - (D - B) / (1 - B)) / (S * 1000);

  // Calculate required evasion
  return Math.round(N * areaLevelRelativeEvasion);
}

/**
 * Calculates the additional evasion needed to increase dodge chance by a desired amount at a given level.
 * @param desiredDodgeIncrease - The desired increase in dodge chance (percentage points, e.g., 10 for +10%).
 * @param level - The area/character level.
 * @param currentEvasion - The character's current evasion value.
 * @returns The additional evasion needed (0 if already at or above the required evasion for the increased chance).
 */
export function getAdditionalEvasionForDodgeIncrease(desiredDodgeIncrease: number, level: number, currentEvasion: number): number {
  // Get current dodge chance
  const currentDodgeChance = calculateDodgeChance(currentEvasion, level);
  // Calculate target dodge chance
  const targetDodgeChance = currentDodgeChance + desiredDodgeIncrease;
  // Get required evasion for the target dodge chance
  const requiredEvasion = getEvasionForDodgeChance(targetDodgeChance, level);
  if (!isFinite(requiredEvasion)) return Infinity;
  return Math.max(0, requiredEvasion - currentEvasion);
}

/*************************************************************************************************/
/************************************* CRITICAL **************************************************/
/*************************************************************************************************/


/**
 * Constants for critical strike calculations
 */
export const CRITICAL_STRIKE_CONSTANTS = {
  /** Maximum possible critical strike chance from all sources */
  MAX_CRIT_CHANCE: 0.30,
  /** Base chance for a super critical strike */
  SUPER_CRIT_CHANCE: 0.05,
  /** Health recovery percentage on non-execution critical strikes */
  CRIT_HEALTH_RECOVERY: 0.10,
  /** Base 5% critical strike chance */
  BASE_CRIT_CHANCE: 0.05,
  /** Execution thresholds based on enemy tier */
  EXECUTION_THRESHOLDS: {
    [EnemyTier.BASIC]: 0.30,
    [EnemyTier.ELITE]: 0.25,
    [EnemyTier.BOSS]: 0.10
  }
} as const;

/**
 * Represents the result of a critical strike calculation
 */
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

/**
 * Parameters for calculating critical strike chance
 */
export interface CriticalStrikeParams {
  /** The enemy's current health percentage */
  targetHealthPercent: number;
  /** The enemy's tier */
  enemyTier: EnemyTier;
  /** The attacker's maximum health */
  attackerMaxHealth: number;
}

/**
 * Calculates the total critical strike chance based on affix bonuses.
 *
 * @param affixBonus - The critical strike chance bonus from affixes as a decimal (e.g., 0.2 for 20%).
 * @returns The final critical strike chance as a percentage (0-100), capped at MAX_CRIT_CHANCE.
 */
export function calculateCriticalChance(affixBonus: number): number {
    // affixBonus is now expected to be in decimal format (e.g., 0.2 for 20%)
    const multiplier = 1 + affixBonus;
    const totalChance = CRITICAL_STRIKE_CONSTANTS.BASE_CRIT_CHANCE * multiplier;
    return Number((100 * Math.min(CRITICAL_STRIKE_CONSTANTS.MAX_CRIT_CHANCE, totalChance)).toFixed(2));
}

/*************************************************************************************************/
/************************************* DEFLECTION ************************************************/
/*************************************************************************************************/

/**
 * Constants for deflection recursion damage calculation calls
 */
export const DEFLECTION_CONSTANTS = {
  /** maximum deflection re-rolls 5 */
  MAX_DEFLECTION_REPEATS: 5,
  /** 0% base deflection chance */
  DODGE_DEFLECTION_BASE: 0,
} as const;



const affixLevelBand = 5;

/**
 * Calculates the number of deflection attempts based on armour value and character level.
 *
 * @param armourValue - The character's armour value.
 * @param charLevel - The character's level (default: 1).
 * @returns The number of deflection attempts (recursions).
 */
export function calculateDeflectionAttempts(armourValue: number, charLevel:number = 1): number{
  // console.log(`----------------------------------------`);
  // console.log(`calculateDeflectionAttempts: INIT: Armor: ${armourValue}, Level: ${charLevel}`);
  // get number of recursions.
  const normalizedArmorValue = 10 * Math.max(Math.floor(charLevel / affixLevelBand),1);

  return Math.floor(Math.min((armourValue / normalizedArmorValue), DEFLECTION_CONSTANTS.MAX_DEFLECTION_REPEATS))
}

/**
 * Gets the required armour value for a given number of deflection attempts at a specific character level.
 *
 * @param count - The number of deflection attempts.
 * @param charLevel - The character's level (default: 1).
 * @returns The required armour value for the given number of deflection attempts.
 */
export function getArmourForDeflectionCount(count: number, charLevel: number = 1): number {
  if (count < 1) return 0;
  if (count > DEFLECTION_CONSTANTS.MAX_DEFLECTION_REPEATS) count = DEFLECTION_CONSTANTS.MAX_DEFLECTION_REPEATS;
  const normalizedArmorValue = 10 * Math.max(Math.floor(charLevel / affixLevelBand), 1);
  return count * normalizedArmorValue;
}

/**
 * Applies armour mitigation to a damage function, simulating multiple deflection attempts.
 *
 * @param damageFunction - A function that returns the base damage value.
 * @param armourValue - The character's armour value.
 * @param charLevel - The character's level (default: 1).
 * @returns The mitigated damage value after applying armour deflection.
 */
export function armorMitigation( damageFunction: () => number, armourValue: number, charLevel:number = 1): number{
  // console.log(`----------------------------------------`);
  // console.log(`armorMitigation: INIT: Armor: ${armourValue}`);
  // get number of recursions.

  const normalizedArmorValue = 10 * Math.max(Math.floor(charLevel / affixLevelBand),1);

  const recursions = Math.min((armourValue / normalizedArmorValue), DEFLECTION_CONSTANTS.MAX_DEFLECTION_REPEATS);

  let baseDamage = damageFunction();
  let maxHit = baseDamage;

  // console.log(`armorMitigation: INIT: ${baseDamage}`);

  for (let i = 0; i < recursions; i++) {

    const newHit = damageFunction();
    baseDamage = Math.min(baseDamage, newHit);
    maxHit = Math.max(maxHit, newHit);

    // console.log(`armorMitigation: r[${i}] m:${baseDamage} r:${newHit}`);
  }

  // console.log(`armorMitigation: MAX: ${maxHit}`);
  // console.log(`armorMitigation: END: ${baseDamage}`);

  return baseDamage;
}


/*************************************************************************************************/
/***************************************** TICKS *************************************************/
/*************************************************************************************************/

/**
 * Calculates a single damage tick value based on damage per tick (dpt), with a random variance.
 *
 * @param dpt - The base damage per tick.
 * @returns The calculated damage tick value (integer).
 */
export function calculateDamageTick(dpt: number): number{
  return Math.floor(dpt * (0.9 + Math.random() * 0.2));
}
