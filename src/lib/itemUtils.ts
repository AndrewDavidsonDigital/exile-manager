import { type ICharacterEquipment } from './game';
import type { AffixValue, IBaseAffix } from './affixTypes';
import { BASE_ITEM_AFFIX_CONFIG } from './affixTypes';
import { AffixTypes, ItemBase, ItemTiers, type ItemTierType, type LootType } from './core';

/**
 * List of all possible item types in the game
 */
export const allItemTypes: ItemBase[] = Object.values(ItemBase);

/**
 * Maps item types to their corresponding emoji representations
 */
export const itemTypeEmojiMap: Record<ItemBase, string> = {
  'Daggers': '⚔️',
  'Sword & Shield': '🛡️',
  'Amulet': '📿',
  'Ring': '💍',
  'Boots': '👢',
  'Gloves': '🧤',
  'Helmet': '🪖',
  'Armor': '🥋',
  'Shoulders': '🧥',
  'Pants': '👖'
};

/**
 * Maps item types to their corresponding equipment slots
 */
export const slotMap: Record<ItemBase, keyof ICharacterEquipment> = {
  'Daggers': 'weapon',
  'Sword & Shield': 'weapon',
  'Amulet': 'neck',
  'Ring': 'leftHand', // Default slot for rings
  'Boots': 'feet',
  'Gloves': 'arms',
  'Helmet': 'head',
  'Armor': 'chest',
  'Shoulders': 'shoulders',
  'Pants': 'legs'
};

/**
 * Gets the primary color for an item based on its tier and identification status
 * @param tier The item's tier
 * @param isIdentified Whether the item is identified
 * @returns The CSS color value for the border
 */
export const getTierColor = (tier: ItemTierType | undefined, isIdentified: boolean): string => {
  if (!tier) return 'rgb(110 231 183 / 0.3)'; // emerald-300/30
  
  const colorMap: Record<ItemTierType, string> = {
    'basic': 'rgb(110 231 183)', // emerald-400
    'enhanced': 'rgb(96 165 250)', // blue-400
    'exceptional': 'rgb(192 132 252)', // purple-400
    'abstract': 'rgb(251 191 36)', // amber-400
    'infused': 'rgb(34 211 238)' // cyan-400
  };
  
  const color = colorMap[tier];
  return isIdentified ? color : `${color} / 0.3`;
}; 

/**
 * Generates an item level using a normal distribution centered around the parsed level
 * @param normalizedLevel The level around which to normalize the curve
 * @returns A number between 1 and 100, following a bell curve distribution around `normalizedLevel` level
 */
export const generateItemLevel = (normalizedLevel: number): number => {
  const mean = normalizedLevel;
  const stdDev = 1; // Standard deviation of 1 will give us roughly ±2 levels
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return Math.max(1, Math.min(100, Math.ceil(mean + z0 * stdDev)));
};

/**
 * Generate normally distributed random number between 400 and 4000, centered around 1500
 * @returns A random gold amount following a normal distribution
 */
export const generateNormalGold = () => {
  // Box-Muller transform for normal distribution
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  
  // Scale and shift to our desired range
  // Using 3 standard deviations to cover most of the range
  const scaled = (z0 * 600) + 1500; // 600 is (4000-400)/6 to get 3 std devs
  
  // Clamp to our bounds
  return Math.floor(Math.max(400, Math.min(4000, scaled)));
};

/**
 * Maps loot type tags to their corresponding item types
 */
export const lootTagToItemTypes: Record<LootType, ItemBase[]> = {
  'accessory': [
    ItemBase.AMULET,
    ItemBase.RING,
  ],
  'armor': [
    ItemBase.HELMET,
    ItemBase.ARMOR,
    ItemBase.SHOULDER,
    ItemBase.PANTS,
    ItemBase.BOOTS,
    ItemBase.GLOVES,
  ],
  'weapons': [
    ItemBase.DAGGERS,
    ItemBase.SHIELD,
  ],
  'currency': [] // Currency is handled separately
};

/**
 * Gets a weighted random item type based on loot tags
 * @param lootTags The item tags to weigh higher
 * @returns A random item type, with 90% chance from `lootTags` and 10% chance from all types
 */
export function getWeightedItemType(lootTags: LootType[]): ItemBase {
  // 90% chance to use loot tag types, 10% chance to use any type
  if (Math.random() < 0.9 && lootTags.length > 0) {
    // Get all possible item types from the loot tags
    const possibleTypes = lootTags.flatMap(tag => lootTagToItemTypes[tag]);
    
    // If we have possible types from the tags, use them
    if (possibleTypes.length > 0) {
      return possibleTypes[Math.floor(Math.random() * possibleTypes.length)];
    }
  }
  
  // Fallback to any item type
  return allItemTypes[Math.floor(Math.random() * allItemTypes.length)];
}

/**
 * Generate gold with loot tag bias
 * @param baseGold The base amount of gold
 * @param lootTags The loot tags to check for biasses
 * @returns Amount of gold to award
 */
export const generateGoldWithBias = (baseGold: number, lootTags: LootType[]): number => {
  // If level has currency bias, increase gold by 20-100%
  if (lootTags.includes('currency')) {
    const multiplier = 1.2 + Math.random() * 0.8; // Random between 1.2x and 2x
    return Math.floor(baseGold * multiplier);
  }
  
  return baseGold;
};

/**
 * Generates an item tier based on character level with weighted probabilities
 * @param sourceLevel The level from whence we are generating this item
 * @param maxLevel The maximum possible level (defaults to 40)
 * @returns A randomly selected ItemTierType based on weighted probabilities
 */
export function generateItemTier(sourceLevel: number, maxLevel: number = 40): ItemTiers {
  // Calculate the normalized level (0 to 1)
  const normalizedLevel = Math.min(1, sourceLevel / maxLevel);
  
  // Define base weights for each tier
  const baseWeights = {
    'basic': 65,
    'enhanced': 20,
    'exceptional': 11,
    'abstract': 2,
    'infused': 2
  };

  // Calculate level-based multipliers with steeper scaling
  const levelMultipliers = {
    'basic': Math.max(0.1, 1 - (normalizedLevel * 2.5)), // Decreases faster
    'enhanced': 1, // Stays constant
    'exceptional': 1 + (normalizedLevel * 2.5), // Increases faster
    'abstract': 1 + (normalizedLevel * 5), // Increases much faster
    'infused': 1 + (normalizedLevel * 5) // Increases much faster
  };

  // Calculate final weights
  const finalWeights = Object.entries(baseWeights).map(([tier, weight]) => ({
    tier: tier as ItemTierType,
    weight: weight * levelMultipliers[tier as keyof typeof levelMultipliers]
  }));

  // Calculate total weight
  const totalWeight = finalWeights.reduce((sum, { weight }) => sum + weight, 0);

  // Generate random number between 0 and total weight
  let random = Math.random() * totalWeight;

  // Select tier based on weights
  for (const { tier, weight } of finalWeights) {
    random -= weight;
    if (random <= 0) {
      return tier as ItemTiers;
    }
  }

  // Fallback to basic tier (should never reach here)
  return ItemTiers.BASIC;
}

/**
 * Maps an ItemType to its corresponding BASE_ITEM_AFFIX_CONFIG category
 * @param type The item type to map
 * @returns The corresponding BASE_ITEM_AFFIX_CONFIG category
 */
export function mapItemTypeToAffixCategory(type: ItemBase): keyof typeof BASE_ITEM_AFFIX_CONFIG {
  // Find which category this item type belongs to
  for (const [category, types] of Object.entries(lootTagToItemTypes)) {
    if (types.includes(type)) {
      // Map the category to the corresponding BASE_ITEM_AFFIX_CONFIG key
      switch (category) {
        case 'weapons':
          return 'WEAPON';
        case 'accessory':
          return 'ACCESSORY';
        case 'armor':
          return 'ARMOUR';
        default:
          throw new Error(`Unknown item category: ${category}`);
      }
    }
  }
  throw new Error(`Item type ${type} not found in any category`);
}

/**
 * Maps item tiers to their value scaling multipliers
 */
const baseAffixTierScalingMap: Record<ItemTierType, number> = {
  'basic': 1.0,       // Base value
  'enhanced': 1.15,   // 15% increase
  'exceptional': 1.3, // 30% increase
  'abstract': 1.5,    // 50% increase
  'infused': 1.5     // 50% increase
};

/**
 * Resolves a base affix for an item based on its type and tier
 * @param type The item type
 * @param tier The item tier
 * @returns The selected base affix configuration
 */
export function resolveBaseAffixFromTypeAndTier(type: ItemBase, tier: ItemTierType, iLvl: number): IBaseAffix {
  // Map the item type to the corresponding config section
  const configSection = mapItemTypeToAffixCategory(type);
  
  // Get the available base affixes for this item type
  const availableAffixes = BASE_ITEM_AFFIX_CONFIG[configSection];
  
  if (!availableAffixes || availableAffixes.length === 0) {
    throw new Error(`No base affixes found for item type: ${type}`);
  }
  
  // Randomly select from available affixes
  const randomIndex = Math.floor(Math.random() * availableAffixes.length);
  const selectedAffix = availableAffixes[randomIndex];
  
  // Get the scaling multiplier for this tier
  const tierScalingMultiplier = baseAffixTierScalingMap[tier];
  
  // Calculate item level scaling
  // Base values for levels 1-5, then linear scaling up to 6x at level 100
  const ilvlScalingMultiplier = iLvl <= 5 ? 1 : 1 + ((iLvl - 5) / 95) * 5;
  
  // Combine both scaling factors
  const totalScalingMultiplier = tierScalingMultiplier * ilvlScalingMultiplier;
  
  // Scale the value based on the tier, item level, and value type
  const scaledValue = (() => {
    switch (selectedAffix.value.type) {
      case AffixTypes.ADDITIVE:
        return {
          type: selectedAffix.value.type,
          value: Math.round(selectedAffix.value.value * totalScalingMultiplier)
        };
      case AffixTypes.MULTIPLICATIVE:
        return {
          type: selectedAffix.value.type,
          value: Math.round(selectedAffix.value.value * totalScalingMultiplier)
        };
      case AffixTypes.RANGE:
        return {
          type: AffixTypes.RANGE,
          minValue: Math.round(selectedAffix.value.minValue * totalScalingMultiplier),
          maxValue: Math.round(selectedAffix.value.maxValue * totalScalingMultiplier)
        };
      default:
        return selectedAffix.value;
    }
  })();
  
  return {
    affix: selectedAffix.affix,
    name: selectedAffix.name,
    value: scaledValue as AffixValue
  };
}

/**
 * Formats a base affix value for display
 * @param value The affix value to format
 * @returns A formatted string representation of the value
 */
export function formatBaseAffixValue(value: AffixValue): string {
  switch (value.type) {
    case AffixTypes.ADDITIVE:
      return `+${value.value}`;
    case AffixTypes.MULTIPLICATIVE:
      return `+${value.value}%`;
    case AffixTypes.RANGE:
      return `${value.minValue}-${value.maxValue}`;
    default:
      return 'Unknown';
  }
}