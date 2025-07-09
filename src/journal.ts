import { CRITICAL_STRIKE_CONSTANTS, DEFLECTION_CONSTANTS, DODGE_CONSTANTS } from '@/lib/combatMechanics';
import { asPercent } from '@/lib/string';
import { ITEM_TIER_COSTS, ITEM_TIER_INFO } from '@/lib/game';
import { ExileClass } from './lib/core';

export enum TagsEnum {
  DAMAGE = 'damage',
  DEFENSE = 'defense',
  LIFE = 'life',
  MANA = 'mana',
  RESOURCE = 'resource',
  DODGE = 'dodge',
  ARMOR = 'armor',
  DEFLECTION = 'deflection',
  BLOCK = 'block',
  AFFIX = 'affix',
  NYI = 'NYI',
  ITEM = 'item',
  TIER = 'tier',
  ATTACK = 'attack',
  EVASION = 'evasion',
  RESISTANCE = 'resistance',
  ATTRIBUTE = 'attribute',
  UTILITY = 'utility',
  ELEMENTAL = 'elemental',
  PHYSICAL = 'physical',
  CHAOS = 'chaos',
  CRITICAL = 'critical',
  SPELL = 'spell',
  MOVEMENT = 'movement',
  CRAFTING = 'crafting',
  TRIGGER = 'trigger',
  SKILL = 'skill',
}

export interface IEntry {
  title: string;
  description: string;
  tags: TagsEnum[];
}

export const entries: IEntry[] = [
  {
    title: 'Combat Skill',
    description: 'A skill that will be automatically triggered during combat rounds, if off-cooldown and the trigger condition is met. e.g: a X round combat buff, a healing spell',
    tags: [
      TagsEnum.SKILL,
    ],
  },
  {
    title: 'World Skill',
    description: 'A skill that can only be activated outside of a run. These usually provide a stat buff for a few runs. e.g: Aid increases the users max-health for n runs',
    tags: [
      TagsEnum.SKILL,
    ],
  },
  {
    title: 'Trigger - Always',
    description: 'A skill trigger that will always resolve if not on cooldown.',
    tags: [
      TagsEnum.TRIGGER,
      TagsEnum.SKILL,
    ],
  },
  {
    title: 'Trigger - Health Critical',
    description: 'A skill trigger that will resolve if the current life is less than 20%.',
    tags: [
      TagsEnum.LIFE,
      TagsEnum.TRIGGER,
      TagsEnum.SKILL,
    ],
  },
  {
    title: 'Trigger - High Health',
    description: 'A skill trigger that will resolve if the current life is greater than 60%.',
    tags: [
      TagsEnum.LIFE,
      TagsEnum.TRIGGER,
      TagsEnum.SKILL,
    ],
  },
  {
    title: 'Trigger - Medium Health',
    description: 'A skill trigger that will resolve if the current life is between than 30% and 60%.',
    tags: [
      TagsEnum.LIFE,
      TagsEnum.TRIGGER,
      TagsEnum.SKILL,
    ],
  },
  {
    title: 'Trigger - Low Health',
    description: 'A skill trigger that will resolve if the current life is less than 40%.',
    tags: [
      TagsEnum.LIFE,
      TagsEnum.TRIGGER,
      TagsEnum.SKILL,
    ],
  },
  {
    title: 'Evasion',
    description: 'The flat amount of the concept of how evasive or how easy it is for your char to evade. This is the key value in the dodge formulae',
    tags: [
      TagsEnum.DEFENSE,
      TagsEnum.DODGE,
      TagsEnum.AFFIX,
    ],
  },
  {
    title: 'Dodge',
    description: `The percentage chance, capped at ${asPercent(DODGE_CONSTANTS.MAX_DODGE_CHANCE)} for a hit to be completely mitigated`,
    tags: [
      TagsEnum.DEFENSE,
      TagsEnum.DODGE,
    ],
  },
  {
    title: 'Armor',
    description: 'The flat amount of the concept of how defended your health is from hits. This is the key value in the Deflection formulae',
    tags: [
      TagsEnum.DEFENSE,
      TagsEnum.ARMOR,
      TagsEnum.DEFLECTION,
    ],
  },
  {
    title: 'Deflection',
    description: `The number of re-roll attempts, capped at ${DEFLECTION_CONSTANTS.MAX_DEFLECTION_REPEATS}, that occur when considering the mobs initial hit.`,
    tags: [
      TagsEnum.DEFENSE,
      TagsEnum.DEFLECTION,
    ],
  },
  {
    title: 'Block',
    description: `The percentage chance, capped at TBD% for a hit to be reduced by TBD%`,
    tags: [
      TagsEnum.DEFENSE,
      TagsEnum.BLOCK,
      TagsEnum.NYI,
    ],
  },
  {
    title: 'Critical Strike',
    description: `An attack which has been rolled to be a crit has the following effects: if after dealing damage the enemy is bellow a dynamic health % threshold (depends on enemy tiers), then the enemy will instantly die, (think culling-strike). In the cases where the mob is not bellow the threshold then the appropriate class-specific critical effect will take place. There is also a flat ${asPercent(CRITICAL_STRIKE_CONSTANTS.SUPER_CRIT_CHANCE)} for a super critical effect.`,
    tags: [
      TagsEnum.CRITICAL,
      TagsEnum.DAMAGE,
    ],
  },
  {
    title: 'Super Critical',
    description: `A flat ${asPercent(CRITICAL_STRIKE_CONSTANTS.SUPER_CRIT_CHANCE)} to stun the enemy resulting in the enemies turn being skipped, that can only occur when rolled on a natural Crit`,
    tags: [
      TagsEnum.CRITICAL,
      TagsEnum.DAMAGE,
    ],
  },
  {
    title: `Critical Hit - ${ExileClass.REAVER}`,
    description: `When a ${ExileClass.REAVER} critically hits they will recover ${asPercent(CRITICAL_STRIKE_CONSTANTS.CRIT_HEALTH_RECOVERY)} of their life.`,
    tags: [
      TagsEnum.CRITICAL,
      TagsEnum.LIFE,
    ],
  },
  {
    title: `Critical Hit - ${ExileClass.CHAOS_MAGE}`,
    description: `When a ${ExileClass.CHAOS_MAGE} critically hits they will encase themselves in a protective layer of either 20% Dodge chance or 2 Deflection Stacks. These buffs cannot stack with themselves but can both be active at the same time`,
    tags: [
      TagsEnum.CRITICAL,
      TagsEnum.DODGE,
      TagsEnum.DEFLECTION,
    ],
  },
  {
    title: `Critical Hit - ${ExileClass.SPELLSWORD}`,
    description: `When a ${ExileClass.SPELLSWORD} critically hits they will apply to themselves a stackable short-term (~6 turns) all elemental damage buff of either 5 or 20% increase of the current element value (whichever is greater)`,
    tags: [
      TagsEnum.CRITICAL,
      TagsEnum.DAMAGE,
    ],
  },
  {
    title: 'Critical Strike Chance',
    description: `The percentage chance, capped at ${asPercent(CRITICAL_STRIKE_CONSTANTS.MAX_CRIT_CHANCE)} for a hit to be considered a Critical Hit.`,
    tags: [
      TagsEnum.CRITICAL,
      TagsEnum.DAMAGE,
      TagsEnum.LIFE
    ],
  },
  {
    title: 'Basic Items',
    description: `The most common tier of items. These items have no affixes and cost ${ITEM_TIER_COSTS.basic} gold to identify. They are marked with an emerald border when identified.`,
    tags: [
      TagsEnum.ITEM,
      TagsEnum.TIER,
    ],
  },
  {
    title: 'Enhanced Items',
    description: `Enhanced items have ${ITEM_TIER_INFO.enhanced.affixCount.embedded} embedded and ${ITEM_TIER_INFO.enhanced.affixCount.suffix} suffix affix. They cost ${ITEM_TIER_COSTS.enhanced} gold to identify and are marked with a blue border when identified.`,
    tags: [
      TagsEnum.ITEM,
      TagsEnum.TIER,
      TagsEnum.AFFIX,
    ],
  },
  {
    title: 'Exceptional Items',
    description: `Exceptional items have ${ITEM_TIER_INFO.exceptional.affixCount.embedded} embedded, ${ITEM_TIER_INFO.exceptional.affixCount.prefix} prefix, and ${ITEM_TIER_INFO.exceptional.affixCount.suffix} suffix affix. They cost ${ITEM_TIER_COSTS.exceptional} gold to identify and are marked with a purple border when identified.`,
    tags: [
      TagsEnum.ITEM,
      TagsEnum.TIER,
      TagsEnum.AFFIX,
    ],
  },
  {
    title: 'Abstract Items',
    description: `Abstract items have ${ITEM_TIER_INFO.abstract.affixCount.embedded} embedded and ${ITEM_TIER_INFO.abstract.affixCount.prefix} prefix affixes. They cost ${ITEM_TIER_COSTS.abstract} gold to identify and are marked with an amber border when identified.`,
    tags: [
      TagsEnum.ITEM,
      TagsEnum.TIER,
      TagsEnum.AFFIX,
    ],
  },
  {
    title: 'Infused Items',
    description: `Infused items have ${ITEM_TIER_INFO.infused.affixCount.embedded} embedded and ${ITEM_TIER_INFO.infused.affixCount.suffix} suffix affixes. They cost ${ITEM_TIER_COSTS.infused} gold to identify and are marked with a cyan border when identified.`,
    tags: [
      TagsEnum.ITEM,
      TagsEnum.TIER,
      TagsEnum.AFFIX,
    ],
  },
  {
    title: 'Attack Affixes',
    description: 'Affixes that enhance your offensive capabilities, damage.',
    tags: [TagsEnum.AFFIX, TagsEnum.ATTACK, TagsEnum.DAMAGE],
  },
  {
    title: 'Defense Affixes',
    description: 'Affixes that improve your defensive capabilities, such as increased armor, damage reduction, or defensive stats.',
    tags: [TagsEnum.AFFIX, TagsEnum.DEFENSE],
  },
  {
    title: 'Evasion Affixes',
    description: 'Affixes that enhance your ability to avoid attacks through dodge and evasion mechanics.',
    tags: [TagsEnum.AFFIX, TagsEnum.EVASION, TagsEnum.DEFENSE, TagsEnum.DODGE],
  },
  {
    title: 'Life Affixes',
    description: 'Affixes that increase your maximum life pool and life-related stats.',
    tags: [TagsEnum.AFFIX, TagsEnum.LIFE, TagsEnum.RESOURCE],
  },
  {
    title: 'Mana Affixes',
    description: 'Affixes that increase your maximum mana pool and mana-related stats.',
    tags: [TagsEnum.AFFIX, TagsEnum.MANA, TagsEnum.RESOURCE],
  },
  {
    title: 'Resistance Affixes',
    description: 'Affixes that provide elemental and chaos resistance, helping you survive against different types of damage.',
    tags: [TagsEnum.AFFIX, TagsEnum.RESISTANCE, TagsEnum.DEFENSE],
  },
  {
    title: 'Attribute Affixes',
    description: 'Affixes that enhance your core attributes: Fortitude, Fortune, Wrath, and Affinity.',
    tags: [TagsEnum.AFFIX, TagsEnum.ATTRIBUTE],
  },
  {
    title: 'Utility Affixes',
    description: 'Affixes that provide various quality-of-life improvements and non-combat benefits.',
    tags: [TagsEnum.AFFIX, TagsEnum.UTILITY],
  },
  {
    title: 'Elemental Affixes',
    description: 'Affixes that add or enhance elemental damage types (Fire, Cold, Lightning) to your attacks.',
    tags: [TagsEnum.AFFIX, TagsEnum.ELEMENTAL, TagsEnum.DAMAGE],
  },
  {
    title: 'Physical Affixes',
    description: 'Affixes that enhance physical damage and physical damage-related effects.',
    tags: [TagsEnum.AFFIX, TagsEnum.PHYSICAL, TagsEnum.DAMAGE],
  },
  {
    title: 'Chaos Affixes',
    description: 'Affixes relate to your sanity via touching the void or corrupted entities.',
    tags: [TagsEnum.AFFIX, TagsEnum.CHAOS, TagsEnum.DAMAGE, TagsEnum.NYI],
  },
  {
    title: 'Critical Affixes',
    description: 'Affixes that improve your critical strike chance and critical strike damage.',
    tags: [TagsEnum.AFFIX, TagsEnum.CRITICAL, TagsEnum.DAMAGE],
  },
  {
    title: 'Spell Affixes',
    description: 'Affixes that enhance your spell damage, spell casting speed, and spell-related effects.',
    tags: [TagsEnum.AFFIX, TagsEnum.SPELL, TagsEnum.DAMAGE, TagsEnum.NYI],
  },
  {
    title: 'Crafting Affixes',
    description: 'Affixes that provide benefits related to item crafting and modification.',
    tags: [TagsEnum.AFFIX, TagsEnum.CRAFTING, TagsEnum.UTILITY, TagsEnum.NYI],
  },
  {
    title: 'Embedded Affixes',
    description: 'Inherent modifiers that are permanently part of the item. These affixes cannot be modified or removed.',
    tags: [TagsEnum.AFFIX, TagsEnum.ITEM],
  },
  {
    title: 'Prefix Affixes',
    description: 'Primarily Offensive modifiers that enhance damage and attack capabilities. These appear at the start of an item name.',
    tags: [TagsEnum.AFFIX, TagsEnum.ITEM, TagsEnum.DAMAGE],
  },
  {
    title: 'Suffix Affixes',
    description: 'PrimarilyDefensive modifiers that enhance survivability and utility. These appear at the end of an item name.',
    tags: [TagsEnum.AFFIX, TagsEnum.ITEM, TagsEnum.DEFENSE],
  },
  {
    title: 'Fortitude',
    description: 'Mental and physical endurance. Increases your ability to withstand damage and resist negative effects.',
    tags: [TagsEnum.ATTRIBUTE, TagsEnum.DEFENSE],
  },
  {
    title: 'Fortune',
    description: 'Luck and chance-based outcomes. Improves your critical strike chance and the quality of items you find.',
    tags: [TagsEnum.ATTRIBUTE, TagsEnum.UTILITY],
  },
  {
    title: 'Wrath',
    description: 'Combat prowess and rage. Enhances your physical damage and combat effectiveness.',
    tags: [TagsEnum.ATTRIBUTE, TagsEnum.DAMAGE],
  },
  {
    title: 'Affinity',
    description: 'Connection to magical forces. Strengthens your spell damage and magical abilities.',
    tags: [TagsEnum.ATTRIBUTE, TagsEnum.SPELL],
  },
  {
    title: 'Health',
    description: 'Your current and maximum health points. When reduced to 0, you are defeated.',
    tags: [TagsEnum.RESOURCE, TagsEnum.LIFE, TagsEnum.DEFENSE],
  },
  {
    title: 'Mana',
    description: 'Your current and maximum mana points. Used to fuel spells and special abilities.',
    tags: [TagsEnum.RESOURCE, TagsEnum.MANA, TagsEnum.SPELL],
  },
]
