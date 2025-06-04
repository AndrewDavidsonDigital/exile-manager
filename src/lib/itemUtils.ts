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