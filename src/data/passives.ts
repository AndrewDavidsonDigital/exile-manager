import { AffixCategory, AffixSubCategory, AffixTypes, Attributes, ExileClass } from "@/lib/core";
import { Rarity, type IPassive } from "@/lib/game";

export const passives: IPassive[] = [
  {
    _identifier: 'Thick Skin', 
    name:'Thick Skin', 
    rarity: Rarity.DEFAULT,
    effect:{
      target: Attributes.HEALTH,
      change: 15, 
      type: AffixTypes.MULTIPLICATIVE
    },
    requiredClass: [ExileClass.CHAOS_MAGE, ExileClass.SPELLSWORD],
  },
  {
    _identifier: 'Blood of Giants',
    name:'Blood of Giants', 
    rarity: Rarity.DEFAULT,
    effect:{
      target: Attributes.HEALTH,
      change: 20, 
      type: AffixTypes.MULTIPLICATIVE
    },
    requiredClass: [ExileClass.REAVER],
  },
  {
    _identifier: 'Elven Blood', 
    name:'Elven Blood', 
    rarity: Rarity.RARE,
    effect:{
      target: Attributes.MANA,
      change: 35, 
      type: AffixTypes.MULTIPLICATIVE
    }
  },
  {
    _identifier: 'Mana Veins', 
    name:'Mana Veins', 
    rarity: Rarity.DEFAULT,
    effect:{
      target: Attributes.MANA,
      change: 20, 
      type: AffixTypes.MULTIPLICATIVE
    }
  },
  {
    _identifier: 'Fortified Fortunes', 
    name:'Fortified Fortunes', 
    rarity: Rarity.UNCOMMON,
    effect:{
      target: Attributes.FORTITUDE,
      change: 75, 
      type: AffixTypes.MULTIPLICATIVE
    }
  },
  {
    _identifier: 'Stoic', 
    name:'Stoic',
    rarity: Rarity.DEFAULT,
    effect:{
      target: Attributes.FORTITUDE,
      change: 12, 
      type: AffixTypes.ADDITIVE
    }
  },
  {
    _identifier: 'Inner Daemon', 
    name:'Inner Daemon', 
    rarity: Rarity.UNCOMMON,
    effect:{
      target: Attributes.WRATH,
      change: 75, 
      type: AffixTypes.MULTIPLICATIVE
    }
  },
  {
    _identifier: 'Wrathful Embrace', 
    name:'Wrathful Embrace',
    rarity: Rarity.DEFAULT,
    effect:{
      target: Attributes.WRATH,
      change: 12, 
      type: AffixTypes.ADDITIVE
    }
  },
  {
    _identifier: 'Midas Touch', 
    name:'Midas Touch', 
    rarity: Rarity.UNCOMMON,
    effect:{
      target: Attributes.FORTUNE,
      change: 75, 
      type: AffixTypes.MULTIPLICATIVE
    }
  },
  {
    _identifier: 'Fortuitus', 
    name:'Fortuitus',
    rarity: Rarity.DEFAULT,
    effect:{
      target: Attributes.FORTUNE,
      change: 12, 
      type: AffixTypes.ADDITIVE
    }
  },
  {
    _identifier: 'Intuition', 
    name:'Intuition', 
    rarity: Rarity.UNCOMMON,
    effect:{
      target: Attributes.AFFINITY,
      change: 75, 
      type: AffixTypes.MULTIPLICATIVE
    }
  },
  {
    _identifier: 'Arcanist', 
    name:'Arcanist',
    rarity: Rarity.DEFAULT,
    effect:{
      target: Attributes.AFFINITY,
      change: 12, 
      type: AffixTypes.ADDITIVE
    }
  },
  {
    _identifier: 'Iron Skin', 
    name:'Iron Skin', 
    rarity: Rarity.RARE,
    effect:{
      target: AffixCategory.DEFENSE,
      subTarget: AffixSubCategory.DEFLECTION,
      change: 2,
      type: AffixTypes.ADDITIVE
    }
  },
  {
    _identifier: 'Intangible', 
    name:'Intangible', 
    rarity: Rarity.RARE,
    effect:{
      target: AffixCategory.DEFENSE,
      subTarget: AffixSubCategory.DODGE,
      change: 20,
      type: AffixTypes.ADDITIVE
    }
  },
  {
    _identifier: 'Elementally Numb', 
    name:'Elementally Numb', 
    description: 'Physical Resistance also applies to each Elemental Resistances at 30%',
    rarity: Rarity.RARE,
    effect:{
      target: AffixCategory.DEFENSE,
      subTarget: AffixSubCategory.ELEMENTAL,
      change: 30,
      type: AffixTypes.ADDITIVE
    }
  },
  {
    _identifier: 'Prismatic Ward', 
    name:'Prismatic Ward', 
    description: 'Your lowest Elemental Resistance also applies to Physical Resistances at 75%',
    rarity: Rarity.RARE,
    effect:{
      target: AffixCategory.DEFENSE,
      subTarget: AffixSubCategory.PHYSICAL,
      change: 75,
      type: AffixTypes.ADDITIVE
    }
  },
]