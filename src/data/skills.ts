import { AffixCategory, AffixSubCategory, AffixTypes, Attributes, ExileClass, SkillActivationLayer, SkillResource, SkillTarget, SkillTiming, SkillTriggers } from "@/lib/core";
import { Rarity, type ISkill } from "@/lib/game";

const NOT_ON_CREATION = 2;

export const skills: ISkill[] = [
  {
    _identifier: 'Curse',
    name: 'Curse',
    rarity: Rarity.DEFAULT,
    target: SkillTarget.ENEMY,
    activationLayer: SkillActivationLayer.COMBAT,
    triggerStates: [SkillTriggers.ALWAYS],
    cooldown: {
      count: 3,
      timing: SkillTiming.TURN,
      startCooldownInstantly: true,
    },
    effect: {
      type: AffixTypes.ADDITIVE,
      target: Attributes.HEALTH,
      change: -40
    },
    cost: {
      amount: 30,
      resource: SkillResource.MANA,
    }
  },
  {
    _identifier: 'Corruption',
    name: 'Corruption',
    rarity: Rarity.RARE,
    target: SkillTarget.ENEMY,
    activationLayer: SkillActivationLayer.COMBAT,
    triggerStates: [SkillTriggers.ALWAYS],
    minCharLevel: NOT_ON_CREATION,
    cooldown: {
      count: 3,
      timing: SkillTiming.TURN,
      startCooldownInstantly: true,
    },
    effect: {
      type: AffixTypes.MULTIPLICATIVE,
      target: Attributes.HEALTH,
      change: -20
    },
    cost: {
      amount: 40,
      resource: SkillResource.MANA,
    }
  },
  {
    _identifier: 'Aid',
    name: 'Aid',
    rarity: Rarity.DEFAULT,
    target: SkillTarget.SELF,
    activationLayer: SkillActivationLayer.WORLD,
    triggerStates: [SkillTriggers.NONE],
    duration: {
      count: 2,
      timing: SkillTiming.RUN,
    },
    cooldown: {
      count: 5,
      timing: SkillTiming.RUN,
      startCooldownInstantly: false,
    },
    effect: {
      type: AffixTypes.ADDITIVE,
      target: Attributes.HEALTH,
      change: 75
    },
    cost: {
      amount: 100,
      resource: SkillResource.GOLD,
    }
  },
  {
    _identifier: 'Enrage',
    name: 'Enrage',
    rarity: Rarity.DEFAULT,
    target: SkillTarget.SELF,
    activationLayer: SkillActivationLayer.COMBAT,
    triggerStates: [SkillTriggers.HIGH_HEALTH],
    minCharLevel: NOT_ON_CREATION,
    duration: {
      count: 3,
      timing: SkillTiming.TURN,
    },
    cooldown: {
      count: 3,
      timing: SkillTiming.TURN,
      startCooldownInstantly: false,
    },
    effect: {
      type: AffixTypes.ADDITIVE,
      target: Attributes.WRATH,
      change: 20
    },
    cost: {
      amount: 30,
      resource: SkillResource.HEALTH,
    }
  },
  {
    _identifier: 'Bravery',
    name: 'Bravery',
    rarity: Rarity.DEFAULT,
    target: SkillTarget.SELF,
    activationLayer: SkillActivationLayer.WORLD,
    triggerStates: [SkillTriggers.NONE],
    minCharLevel: NOT_ON_CREATION,
    duration: {
      count: 1,
      timing: SkillTiming.RUN,
    },
    cooldown: {
      count: 4,
      timing: SkillTiming.RUN,
      startCooldownInstantly: false,
    },
    effect: {
      type: AffixTypes.MULTIPLICATIVE,
      target: Attributes.WRATH,
      change: 50
    },
    cost: {
      amount: 30,
      resource: SkillResource.HEALTH,
    }
  },
  {
    _identifier: 'Heal',
    name: 'Heal',
    rarity: Rarity.DEFAULT,
    target: SkillTarget.SELF,
    activationLayer: SkillActivationLayer.COMBAT,
    triggerStates: [SkillTriggers.LOW_HEALTH, SkillTriggers.MED_HEALTH],
    cooldown: {
      count: 4,
      timing: SkillTiming.TURN,
      startCooldownInstantly: true,
    },
    effect: {
      type: AffixTypes.ADDITIVE,
      target: Attributes.HEALTH,
      change: 50
    },
    cost: {
      amount: 50,
      resource: SkillResource.MANA,
    }
  },
  {
    _identifier: 'Desperate Prayer',
    name: 'Desperate Prayer',
    rarity: Rarity.UNCOMMON,
    target: SkillTarget.SELF,
    activationLayer: SkillActivationLayer.COMBAT,
    triggerStates: [SkillTriggers.CRITICAL_HEALTH, SkillTriggers.LOW_HEALTH],
    minCharLevel: NOT_ON_CREATION,
    cooldown: {
      count: 3,
      timing: SkillTiming.RUN,
      startCooldownInstantly: true,
    },
    effect: {
      type: AffixTypes.ADDITIVE,
      target: Attributes.HEALTH,
      change: 200
    },
    cost: {
      amount: 80,
      resource: SkillResource.MANA,
    }
  },
  {
    _identifier: 'Alloyed Blade',
    name: 'Alloyed Blade',
    rarity: Rarity.UNCOMMON,
    target: SkillTarget.SELF,
    activationLayer: SkillActivationLayer.COMBAT,
    triggerStates: [SkillTriggers.ALWAYS],
    requiredClass: [ExileClass.REAVER],
    cooldown: {
      count: 5,
      timing: SkillTiming.TURN,
      startCooldownInstantly: true,
    },
    effect: {
      type: AffixTypes.ADDITIVE,
      target: AffixCategory.PHYSICAL,
      change: 30
    },
    duration: {
      count: 2,
      timing: SkillTiming.TURN,
    },
    cost: {
      amount: 50,
      resource: SkillResource.MANA,
    }
  },
  {
    _identifier: 'Elemental Fracture',
    name: 'Elemental Fracture',
    rarity: Rarity.UNCOMMON,
    target: SkillTarget.SELF,
    activationLayer: SkillActivationLayer.COMBAT,
    triggerStates: [SkillTriggers.ALWAYS],
    requiredClass: [ExileClass.SPELLSWORD],
    cooldown: {
      count: 5,
      timing: SkillTiming.TURN,
      startCooldownInstantly: true,
    },
    effect: {
      type: AffixTypes.ADDITIVE,
      target: AffixCategory.ELEMENTAL,
      change: 30
    },
    duration: {
      count: 2,
      timing: SkillTiming.TURN,
    },
    cost: {
      amount: 50,
      resource: SkillResource.MANA,
    }
  },
  {
    _identifier: 'Chaotic Burst',
    name: 'Chaotic Burst',
    rarity: Rarity.UNCOMMON,
    target: SkillTarget.ENEMY,
    activationLayer: SkillActivationLayer.COMBAT,
    triggerStates: [SkillTriggers.ALWAYS],
    requiredClass: [ExileClass.CHAOS_MAGE],
    cooldown: {
      count: 8,
      timing: SkillTiming.TURN,
      startCooldownInstantly: true,
    },
    effect: {
      type: AffixTypes.RANGE,
      target: Attributes.HEALTH,
      change: {
        min: -5,
        max: -75,
      }
    },
    cost: {
      amount: 50,
      resource: SkillResource.MANA,
    }
  },
  {
    _identifier: 'Sidestep',
    name: 'Sidestep',
    rarity: Rarity.UNCOMMON,
    target: SkillTarget.SELF,
    activationLayer: SkillActivationLayer.COMBAT,
    triggerStates: [SkillTriggers.ALWAYS],
    duration: {
      count: 3,
      timing: SkillTiming.TURN,
    },
    cooldown: {
      count: 8,
      timing: SkillTiming.TURN,
      startCooldownInstantly: true,
    },
    effect: {
      type: AffixTypes.ADDITIVE,
      target: AffixCategory.DEFENSE,
      subTarget: AffixSubCategory.DODGE,
      change: 20
    },
    cost: {
      amount: 30,
      resource: SkillResource.MANA,
    }
  },
  {
    _identifier: 'Parry',
    name: 'Parry',
    rarity: Rarity.UNCOMMON,
    target: SkillTarget.SELF,
    activationLayer: SkillActivationLayer.COMBAT,
    triggerStates: [SkillTriggers.ALWAYS],
    duration: {
      count: 3,
      timing: SkillTiming.TURN,
    },
    cooldown: {
      count: 8,
      timing: SkillTiming.TURN,
      startCooldownInstantly: true,
    },
    effect: {
      type: AffixTypes.ADDITIVE,
      target: AffixCategory.DEFENSE,
      subTarget: AffixSubCategory.DEFLECTION,
      change: 2
    },
    cost: {
      amount: 30,
      resource: SkillResource.MANA,
    }
  }
]
