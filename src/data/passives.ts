import { AffixTypes, Attributes } from "@/lib/core";
import type { IPassive } from "@/lib/game";

export const passives: IPassive[] = [
  {
    _identifier: 'Mana Veins', 
    name:'Mana Veins', 
    effect:{
      target: Attributes.MANA,
      change: 20, 
      type: AffixTypes.MULTIPLICATIVE
    }
  },
  {
    _identifier: 'Blood of Giants',
    name:'Blood of Giants', 
    effect:{
      target: Attributes.HEALTH,
      change: 20, 
      type: AffixTypes.MULTIPLICATIVE
    }
  },
  {
    _identifier: 'Fortified Fortunes', 
    name:'Fortified Fortunes', 
    effect:{
      target: Attributes.FORTITUDE,
      change: 75, 
      type: AffixTypes.MULTIPLICATIVE
    }
  },
  {
    _identifier: 'Stoic', 
    name:'Stoic',
    effect:{
      target: Attributes.FORTITUDE,
      change: 12, 
      type: AffixTypes.ADDITIVE
    }
  },
  {
    _identifier: 'Wrathful Embrace', 
    name:'Wrathful Embrace',
    effect:{
      target: Attributes.WRATH,
      change: 12, 
      type: AffixTypes.ADDITIVE
    }
  },
  {
    _identifier: 'Fortuitus', 
    name:'Fortuitus',
    effect:{
      target: Attributes.FORTUNE,
      change: 12, 
      type: AffixTypes.ADDITIVE
    }
  },
  {
    _identifier: 'Arcanist', 
    name:'Arcanist',
    effect:{
      target: Attributes.AFFINITY,
      change: 12, 
      type: AffixTypes.ADDITIVE
    }
  },
]