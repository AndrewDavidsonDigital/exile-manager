import type { ICharacterEquipment, ItemTierType, ItemType } from './game';

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
