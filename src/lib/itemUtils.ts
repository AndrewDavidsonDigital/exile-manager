import type { ItemTierType, ItemType } from './game';

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