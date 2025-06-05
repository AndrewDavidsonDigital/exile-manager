import { AffixTypes } from "@/lib/affixTypes";
import type { IPassive } from "@/lib/game";

export const passives: IPassive[] = [
  {
    _identifier: 'Fortified Fortunes', 
    name:'Fortified Fortunes', 
    effect:{
      target:'fortitude',
      change: 75, 
      type: AffixTypes.MULTIPLICATIVE
    }
  },
  {
    _identifier: 'Wrathful Embrace', 
    name:'Wrathful Embrace',
    effect:{
      target:'wrath',
      change: 12, 
      type: AffixTypes.ADDITIVE
    }
  },
  {
    _identifier: 'Fortuitus', 
    name:'Fortuitus',
    effect:{
      target:'fortune',
      change: 12, 
      type: AffixTypes.ADDITIVE
    }
  },
  {
    _identifier: 'Stoic', 
    name:'Stoic',
    effect:{
      target:'fortitude',
      change: 12, 
      type: AffixTypes.ADDITIVE
    }
  },
  {
    _identifier: 'Arcanist', 
    name:'Arcanist',
    effect:{
      target:'affinity',
      change: 12, 
      type: AffixTypes.ADDITIVE
    }
  },
]