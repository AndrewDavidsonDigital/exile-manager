import type { ICharacterEquipment, ItemTierType, ItemType, LootType } from './game';

export const allItemTypes: ItemType[] = ['Sword', 'Shield', 'Amulet', 'Ring', 'Boots', 'Gloves', 'Helmet', 'Armor', 'Shoulders', 'Pants'];

export const itemTypeEmojiMap: Record<ItemType, string> = {
  'Sword': '⚔️',
  'Shield': '🛡️',
  'Amulet': '📿',
  'Ring': '💍',
  'Boots': '👢',
  'Gloves': '🧤',
  'Helmet': '🪖',
  'Armor': '🥋',
  'Shoulders': '🧥',
  'Pants': '👖'
};


// Map item types to equipment slots
export const slotMap: Record<ItemType, keyof ICharacterEquipment> = {
  'Sword': 'weapon',
  'Shield': 'weapon',
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
 * Gets the border color for an item based on its tier and identification status
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
 * @param normalizedLevel The level around which the to normalize the curve
 * @returns A number between 1 and 100, following a bell curve distribution around the character's level
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
 * @returns 
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

// Map loot tags to item types
export const lootTagToItemTypes: Record<LootType, ItemType[]> = {
  'armor': ['Helmet', 'Armor', 'Shoulders', 'Pants', 'Boots', 'Gloves'],
  'weapons': ['Sword', 'Shield'],
  'jewellery': ['Amulet', 'Ring'],
  'currency': [] // Currency is handled separately
};

/**
 * Gets a weighted random item type based on the level's loot tags
 * @param lootTags The loot tags from the level
 * @returns A random item type, with 90% chance from loot tags and 10% chance from all types
 */
export function getWeightedItemType(lootTags: LootType[]): ItemType {
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
 * @param lootTags The loot tags from the level
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
 * @param characterLevel The character's current level
 * @param maxLevel The maximum possible level (defaults to 40)
 * @returns A randomly selected ItemTierType based on weighted probabilities
 */
export function generateItemTier(characterLevel: number, maxLevel: number = 40): ItemTierType {
  // Calculate the normalized level (0 to 1)
  const normalizedLevel = Math.min(1, characterLevel / maxLevel);
  
  // Define base weights for each tier
  const baseWeights = {
    'basic': 40,
    'enhanced': 30,
    'exceptional': 20,
    'abstract': 5,
    'infused': 5
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
      return tier;
    }
  }

  // Fallback to basic tier (should never reach here)
  return 'basic';
}