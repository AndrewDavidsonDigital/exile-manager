import { CRITICAL_STRIKE_CONSTANTS, DEFLECTION_CONSTANTS, DODGE_CONSTANTS } from '@/lib/combatMechanics';
import { asPercent } from '@/lib/string';
import { ITEM_TIER_COSTS, ITEM_TIER_INFO } from '@/lib/game';

export type Tags = 
   'damage' 
 | 'defense' 
 | 'life'
 | 'mana'
 | 'resource'
 | 'dodge'
 | 'armor'
 | 'deflection'
 | 'block'
 | 'affix'
 | 'NYI'
 | 'item'
 | 'tier'
 | 'attack'
 | 'evasion'
 | 'resistance'
 | 'attribute'
 | 'utility'
 | 'elemental'
 | 'physical'
 | 'chaos'
 | 'critical'
 | 'spell'
 | 'movement'
 | 'crafting'
 ;

export interface IEntry {
  title: string;
  description: string;
  tags: Tags[];
}

export const entries: IEntry[] = [
  {
    title: 'Evasion',
    description: 'The flat amount of the concept of how evasive or how easy it is for your char to evade. This is the key value in the dodge formulae',
    tags: [
      'defense',
      'dodge',
      'affix',
    ],
  },
  {
    title: 'Dodge',
    description: `The percentage chance, capped at ${asPercent(DODGE_CONSTANTS.MAX_DODGE_CHANCE)} for a hit to be completely mitigated`,
    tags: [
      'defense',
      'dodge',
    ],
  },
  {
    title: 'Armor',
    description: 'The flat amount of the concept of how defended your health is from hits. This is the key value in the Deflection formulae',
    tags: [
      'defense',
      'armor',
      'deflection',
    ],
  },
  {
    title: 'Deflection',
    description: `The number of re-roll attempts, capped at ${DEFLECTION_CONSTANTS.MAX_DEFLECTION_REPEATS}, that occur when considering the mobs initial hit.`,
    tags: [
      'defense',
      'deflection',
    ],
  },
  {
    title: 'Block',
    description: `The percentage chance, capped at TBD% for a hit to be reduced by TBD%`,
    tags: [
      'defense',
      'block',
      'NYI',
    ],
  },
  {
    title: 'Critical Strike',
    description: `An attack which has been rolled to be a crit has the following effects: if after dealing damage the enemy is bellow a dynamic health % threshold (depends on enemy tiers), then the enemy will instantly die, (think culling-strike). In the cases where the mob is not bellow the threshold then the character will recover ${asPercent(CRITICAL_STRIKE_CONSTANTS.CRIT_HEALTH_RECOVERY)} of their life and have a flat ${asPercent(CRITICAL_STRIKE_CONSTANTS.SUPER_CRIT_CHANCE)} to stun the enemy resulting in the enemies turn being skipped.`,
    tags: [
      'critical',
      'damage',
      'life'
    ],
  },
  {
    title: 'Critical Strike Chance',
    description: `The percentage chance, capped at ${asPercent(CRITICAL_STRIKE_CONSTANTS.MAX_CRIT_CHANCE)} for a hit to be considered a Critical Hit.`,
    tags: [
      'critical',
      'damage',
      'life'
    ],
  },
  {
    title: 'Basic Items',
    description: `The most common tier of items. These items have no affixes and cost ${ITEM_TIER_COSTS.basic} gold to identify. They are marked with an emerald border when identified.`,
    tags: [
      'item',
      'tier',
    ],
  },
  {
    title: 'Enhanced Items',
    description: `Enhanced items have ${ITEM_TIER_INFO.enhanced.affixCount.embedded} embedded and ${ITEM_TIER_INFO.enhanced.affixCount.suffix} suffix affix. They cost ${ITEM_TIER_COSTS.enhanced} gold to identify and are marked with a blue border when identified.`,
    tags: [
      'item',
      'tier',
      'affix',
    ],
  },
  {
    title: 'Exceptional Items',
    description: `Exceptional items have ${ITEM_TIER_INFO.exceptional.affixCount.embedded} embedded, ${ITEM_TIER_INFO.exceptional.affixCount.prefix} prefix, and ${ITEM_TIER_INFO.exceptional.affixCount.suffix} suffix affix. They cost ${ITEM_TIER_COSTS.exceptional} gold to identify and are marked with a purple border when identified.`,
    tags: [
      'item',
      'tier',
      'affix',
    ],
  },
  {
    title: 'Abstract Items',
    description: `Abstract items have ${ITEM_TIER_INFO.abstract.affixCount.embedded} embedded and ${ITEM_TIER_INFO.abstract.affixCount.prefix} prefix affixes. They cost ${ITEM_TIER_COSTS.abstract} gold to identify and are marked with an amber border when identified.`,
    tags: [
      'item',
      'tier',
      'affix',
    ],
  },
  {
    title: 'Infused Items',
    description: `Infused items have ${ITEM_TIER_INFO.infused.affixCount.embedded} embedded and ${ITEM_TIER_INFO.infused.affixCount.suffix} suffix affixes. They cost ${ITEM_TIER_COSTS.infused} gold to identify and are marked with a cyan border when identified.`,
    tags: [
      'item',
      'tier',
      'affix',
    ],
  },
  {
    title: 'Attack Affixes',
    description: 'Affixes that enhance your offensive capabilities, damage.',
    tags: ['affix', 'attack', 'damage'],
  },
  {
    title: 'Defense Affixes',
    description: 'Affixes that improve your defensive capabilities, such as increased armor, damage reduction, or defensive stats.',
    tags: ['affix', 'defense'],
  },
  {
    title: 'Evasion Affixes',
    description: 'Affixes that enhance your ability to avoid attacks through dodge and evasion mechanics.',
    tags: ['affix', 'evasion', 'defense', 'dodge'],
  },
  {
    title: 'Life Affixes',
    description: 'Affixes that increase your maximum life pool and life-related stats.',
    tags: ['affix', 'life', 'resource'],
  },
  {
    title: 'Mana Affixes',
    description: 'Affixes that increase your maximum mana pool and mana-related stats.',
    tags: ['affix', 'mana', 'resource'],
  },
  {
    title: 'Resistance Affixes',
    description: 'Affixes that provide elemental and chaos resistance, helping you survive against different types of damage.',
    tags: ['affix', 'resistance', 'defense'],
  },
  {
    title: 'Attribute Affixes',
    description: 'Affixes that enhance your core attributes: Fortitude, Fortune, Wrath, and Affinity.',
    tags: ['affix', 'attribute'],
  },
  {
    title: 'Utility Affixes',
    description: 'Affixes that provide various quality-of-life improvements and non-combat benefits.',
    tags: ['affix', 'utility'],
  },
  {
    title: 'Elemental Affixes',
    description: 'Affixes that add or enhance elemental damage types (Fire, Cold, Lightning) to your attacks.',
    tags: ['affix', 'elemental', 'damage'],
  },
  {
    title: 'Physical Affixes',
    description: 'Affixes that enhance physical damage and physical damage-related effects.',
    tags: ['affix', 'physical', 'damage'],
  },
  {
    title: 'Chaos Affixes',
    description: 'Affixes relate to your sanity via touching the void or corrupted entities.',
    tags: ['affix', 'chaos', 'damage', 'NYI'],
  },
  {
    title: 'Critical Affixes',
    description: 'Affixes that improve your critical strike chance and critical strike damage.',
    tags: ['affix', 'critical', 'damage'],
  },
  {
    title: 'Spell Affixes',
    description: 'Affixes that enhance your spell damage, spell casting speed, and spell-related effects.',
    tags: ['affix', 'spell', 'damage', 'NYI'],
  },
  {
    title: 'Crafting Affixes',
    description: 'Affixes that provide benefits related to item crafting and modification.',
    tags: ['affix', 'crafting', 'utility', 'NYI'],
  },
  {
    title: 'Embedded Affixes',
    description: 'Inherent modifiers that are permanently part of the item. These affixes cannot be modified or removed.',
    tags: ['affix', 'item'],
  },
  {
    title: 'Prefix Affixes',
    description: 'Primarily Offensive modifiers that enhance damage and attack capabilities. These appear at the start of an item name.',
    tags: ['affix', 'item', 'damage'],
  },
  {
    title: 'Suffix Affixes',
    description: 'PrimarilyDefensive modifiers that enhance survivability and utility. These appear at the end of an item name.',
    tags: ['affix', 'item', 'defense'],
  },
  {
    title: 'Fortitude',
    description: 'Mental and physical endurance. Increases your ability to withstand damage and resist negative effects.',
    tags: ['attribute', 'defense'],
  },
  {
    title: 'Fortune',
    description: 'Luck and chance-based outcomes. Improves your critical strike chance and the quality of items you find.',
    tags: ['attribute', 'utility'],
  },
  {
    title: 'Wrath',
    description: 'Combat prowess and rage. Enhances your physical damage and combat effectiveness.',
    tags: ['attribute', 'damage'],
  },
  {
    title: 'Affinity',
    description: 'Connection to magical forces. Strengthens your spell damage and magical abilities.',
    tags: ['attribute', 'spell'],
  },
  {
    title: 'Health',
    description: 'Your current and maximum health points. When reduced to 0, you are defeated.',
    tags: ['resource', 'life', 'defense'],
  },
  {
    title: 'Mana',
    description: 'Your current and maximum mana points. Used to fuel spells and special abilities.',
    tags: ['resource', 'mana', 'spell', 'NYI'],
  },
]
