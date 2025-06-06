import { AffixTypes } from "@/lib/affixTypes";
import { SkillActivationLayer, SkillResource, SkillTarget, SkillTiming, SkillTriggers } from "@/lib/core";
import type { ISkill } from "@/lib/game";

const NOT_ON_CREATION = 1;

export const skills: ISkill[] = [
  {
    _identifier: 'Curse',
    name: 'Curse',
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
      target: "health",
      change: -20
    },
    cost: {
      amount: 30,
      resource: SkillResource.MANA,
    }
  },
  {
    _identifier: 'Aid',
    name: 'Aid',
    target: SkillTarget.SELF,
    activationLayer: SkillActivationLayer.RESTING,
    triggerStates: [SkillTriggers.LOW_HEALTH],
    duration: {
      count: 5,
      timing: SkillTiming.RUN,
    },
    cooldown: {
      count: 3,
      timing: SkillTiming.RUN,
      startCooldownInstantly: false,
    },
    effect: {
      type: AffixTypes.ADDITIVE,
      target: "health",
      change: 50
    },
    cost: {
      amount: 100,
      resource: SkillResource.GOLD,
    }
  },
  {
    _identifier: 'Enrage',
    name: 'Enrage',
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
      target: "wrath",
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
      target: "wrath",
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
      target: "health",
      change: 50
    },
    cost: {
      amount: 30,
      resource: SkillResource.MANA,
    }
  },
  {
    _identifier: 'Desperate Prayer',
    name: 'Desperate Prayer',
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
      target: "health",
      change: 200
    },
    cost: {
      amount: 50,
      resource: SkillResource.MANA,
    }
  }
]