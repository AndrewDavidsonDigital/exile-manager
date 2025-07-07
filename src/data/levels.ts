import { DynamicZone, DynamicZoneLevelAnchor, LevelEncounters, LevelType, MonsterTypes, type IEncounter, type ILevel  } from "@/lib/core";


/**
 * List of all available game levels
 * _identifier pattern `${progression}_${location}_#`
 */
export const levels: ILevel[] = [
  {
    _identifier: 'init_reef_0',
    areaLevel: 1,
    description: "Washed up on the edge of a reef.",
    name: "Get your bearings",
    preface: 'Attempt to',
    dynamicCompletions: [],
    completionRules: [
      {
        _identifier: 'init_reef_1',
        weighting: 80,
        limits: 2,
      },
      {
        _identifier: 'init_reef_1_2',
        weighting: 20,
        limits: 4,
      }
    ],
    lootTags: ['armor', 'weapons'],
    areaLuckDelta: 1,
    encounterBase: 4,
    encounterRangeDeltas: 1,
    monsterTypes: [MonsterTypes.UNDEAD],
    encounters: [
      {
        type: LevelEncounters.COMBAT,
        weighting: 55,
      },
      {
        type: LevelEncounters.RECOVERY,
        weighting: 25,
      },
      {
        type: LevelEncounters.TREASURE,
        weighting: 19,
      },
      {
        type: LevelEncounters.CUSTOM_A,
        weighting: 1,
      },
    ],
    type: LevelType.DEFAULT,
  },
  {
    _identifier: 'init_reef_1',
    areaLevel: 2,
    description: "Swim along the edge to shore",
    name: "Attempt to Swim",
    preface: '',
    dynamicCompletions: [],
    completionRules: [
      {
        _identifier: 'init_reef_2',
        weighting: 80,
      },
      {
        _identifier: 'init_reef_1_2',
        weighting: 20,
        limits: 5,
      }
    ],
    lootTags: ['accessory'],
    areaLuckDelta: 0.75,
    encounterBase: 4,
    encounterRangeDeltas: 1,
    monsterTypes: [MonsterTypes.UNDEAD, MonsterTypes.HUMANOID],
    encounters: [
      {
        type: LevelEncounters.COMBAT,
        weighting: 55,
      },
      {
        type: LevelEncounters.RECOVERY,
        weighting: 20,
      },
      {
        type: LevelEncounters.TRAP,
        weighting: 10,
      },
      {
        type: LevelEncounters.TREASURE,
        weighting: 14,
      },
      {
        type: LevelEncounters.CUSTOM_A,
        weighting: 0.33,
      },
      {
        type: LevelEncounters.CUSTOM_B,
        weighting: 0.33,
      },
      {
        type: LevelEncounters.CUSTOM_C,
        weighting: 0.33,
      },
    ]
  },
  {
    _identifier: 'init_reef_1_2',
    areaLevel: 2,
    description: "Traverse over the reef",
    name: "Cross Reef",
    preface: 'Attempt to',
    dynamicCompletions: [
      {
        _identifier: 'init_cave',
        type: DynamicZone.CAVE,
        areaLevelDelta: 0,
        limits: 2,
        weighting: 15,
        areaLevelAnchor: DynamicZoneLevelAnchor.ZONE,
        areaLuckDelta: 1.5,
        encounters: [
          {
            type: LevelEncounters.COMBAT,
            weighting: 45,
          },
          {
            type: LevelEncounters.CUSTOM_C,
            weighting: 1,
          },
          {
            type: LevelEncounters.TRAP,
            weighting: 20,
          },
          {
            type: LevelEncounters.TREASURE,
            weighting: 25,
          },
        ]
      },
      {
        _identifier: 'init_island',
        type: DynamicZone.ISLAND,
        areaLevelDelta: 0,
        limits: 5,
        weighting: 10,
        areaLevelAnchor: DynamicZoneLevelAnchor.ZONE,
        areaLuckDelta: 1.5,
        encounters: [
          {
            type: LevelEncounters.COMBAT,
            weighting: 55,
          },
          {
            type: LevelEncounters.CUSTOM_C,
            weighting: 1,
          },
          {
            type: LevelEncounters.TRAP,
            weighting: 10,
          },
          {
            type: LevelEncounters.TREASURE,
            weighting: 25,
          },
        ]
      },
      {
        _identifier: 'init_rift',
        type: DynamicZone.RIFT,
        areaLevelDelta: 0,
        limits: 2,
        weighting: 20,
        areaLevelAnchor: DynamicZoneLevelAnchor.CHARACTER,
        areaLuckDelta: 2.5,
        encounters: [
          {
            type: LevelEncounters.COMBAT,
            weighting: 40,
          },
          {
            type: LevelEncounters.TREASURE,
            weighting: 20,
          },
          {
            type: LevelEncounters.RECOVERY,
            weighting: 25,
          },
          {
            type: LevelEncounters.CORRUPTED,
            weighting: 15,
          },
        ]
      }
    ],
    completionRules: [
      {
        _identifier: 'init_reef_2',
        weighting: 75,
      }
    ],
    lootTags: ['armor'],
    areaLuckDelta: 0.75,
    encounterBase: 3,
    encounterRangeDeltas: 2,
    monsterTypes: [MonsterTypes.BEAST, MonsterTypes.UNDEAD],
    encounters: [
      {
        type: LevelEncounters.COMBAT,
        weighting: 55,
      },
      {
        type: LevelEncounters.RECOVERY,
        weighting: 20,
      },
      {
        type: LevelEncounters.TRAP,
        weighting: 10,
      },
      {
        type: LevelEncounters.TREASURE,
        weighting: 14,
      },
      {
        type: LevelEncounters.CUSTOM_A,
        weighting: 0.33,
      },
      {
        type: LevelEncounters.CUSTOM_B,
        weighting: 0.33,
      },
      {
        type: LevelEncounters.CUSTOM_C,
        weighting: 0.33,
      },
    ]
  },
  {
    _identifier: 'init_reef_2',
    areaLevel: 3,
    description: "Managing to make landfall, you start to look around",
    name: "Beach",
    preface: 'Explore the',
    dynamicCompletions: [
      {
        _identifier: 'init_cave',
        type: DynamicZone.CAVE,
        areaLevelDelta: 0,
        limits: 2,
        weighting: 15,
        areaLevelAnchor: DynamicZoneLevelAnchor.ZONE,
        areaLuckDelta: 1.5,
        encounters: [
          {
            type: LevelEncounters.COMBAT,
            weighting: 45,
          },
          {
            type: LevelEncounters.CUSTOM_C,
            weighting: 1,
          },
          {
            type: LevelEncounters.TRAP,
            weighting: 20,
          },
          {
            type: LevelEncounters.TREASURE,
            weighting: 25,
          },
        ]
      },
      {
        _identifier: 'init_island',
        type: DynamicZone.ISLAND,
        areaLevelDelta: 0,
        limits: 5,
        weighting: 10,
        areaLevelAnchor: DynamicZoneLevelAnchor.ZONE,
        areaLuckDelta: 1.5,
        encounters: [
          {
            type: LevelEncounters.COMBAT,
            weighting: 55,
          },
          {
            type: LevelEncounters.CUSTOM_C,
            weighting: 1,
          },
          {
            type: LevelEncounters.TRAP,
            weighting: 10,
          },
          {
            type: LevelEncounters.TREASURE,
            weighting: 25,
          },
        ]
      },
      {
        _identifier: 'init_rift',
        type: DynamicZone.RIFT,
        areaLevelDelta: 0,
        limits: 2,
        weighting: 20,
        areaLevelAnchor: DynamicZoneLevelAnchor.CHARACTER,
        areaLuckDelta: 2.5,
        encounters: [
          {
            type: LevelEncounters.COMBAT,
            weighting: 40,
          },
          {
            type: LevelEncounters.TREASURE,
            weighting: 20,
          },
          {
            type: LevelEncounters.RECOVERY,
            weighting: 25,
          },
          {
            type: LevelEncounters.CORRUPTED,
            weighting: 15,
          },
        ]
      },
    ],
    completionRules: [
      {
        _identifier: 'init_reef_3',
        weighting: 100,
      }
    ],
    lootTags: ['armor', 'weapons'],
    areaLuckDelta: 0.8,
    encounterBase: 4,
    encounterRangeDeltas: 2,
    monsterTypes: [MonsterTypes.BEAST, MonsterTypes.UNDEAD],
    encounters: [
      {
        type: LevelEncounters.COMBAT,
        weighting: 55,
      },
      {
        type: LevelEncounters.RECOVERY,
        weighting: 20,
      },
      {
        type: LevelEncounters.TRAP,
        weighting: 10,
      },
      {
        type: LevelEncounters.TREASURE,
        weighting: 14,
      },
      {
        type: LevelEncounters.CUSTOM_A,
        weighting: 0.33,
      },
      {
        type: LevelEncounters.CUSTOM_B,
        weighting: 0.33,
      },
      {
        type: LevelEncounters.CUSTOM_C,
        weighting: 0.33,
      },
    ]
  },
  {
    _identifier: 'init_reef_3',
    areaLevel: 4,
    description: "You hear something lumbering towards you from inland",
    name: "Brace",
    preface: 'Prepare to ',
    dynamicCompletions: [
      {
        _identifier: 'init_cave',
        type: DynamicZone.CAVE,
        areaLevelDelta: 2,
        limits: 3,
        weighting: 15,
        areaLevelAnchor: DynamicZoneLevelAnchor.CHARACTER,
        areaLuckDelta: 1.5,
        encounters: [
          {
            type: LevelEncounters.COMBAT,
            weighting: 45,
          },
          {
            type: LevelEncounters.CUSTOM_C,
            weighting: 1,
          },
          {
            type: LevelEncounters.TRAP,
            weighting: 20,
          },
          {
            type: LevelEncounters.TREASURE,
            weighting: 25,
          },
        ]
      },
      {
        _identifier: 'init_island',
        type: DynamicZone.ISLAND,
        areaLevelDelta: 1,
        limits: 3,
        weighting: 10,
        areaLevelAnchor: DynamicZoneLevelAnchor.CHARACTER,
        areaLuckDelta: 1.5,
        encounters: [
          {
            type: LevelEncounters.COMBAT,
            weighting: 55,
          },
          {
            type: LevelEncounters.CUSTOM_C,
            weighting: 1,
          },
          {
            type: LevelEncounters.TRAP,
            weighting: 10,
          },
          {
            type: LevelEncounters.TREASURE,
            weighting: 25,
          },
        ]
      },
      {
        _identifier: 'init_rift',
        type: DynamicZone.RIFT,
        areaLevelDelta: 1,
        limits: 2,
        weighting: 15,
        areaLevelAnchor: DynamicZoneLevelAnchor.CHARACTER,
        areaLuckDelta: 2.5,
        encounters: [
          {
            type: LevelEncounters.COMBAT,
            weighting: 40,
          },
          {
            type: LevelEncounters.TREASURE,
            weighting: 20,
          },
          {
            type: LevelEncounters.RECOVERY,
            weighting: 25,
          },
          {
            type: LevelEncounters.CORRUPTED,
            weighting: 15,
          },
        ]
      },
    ],
    completionRules: [
      {
        _identifier: 'init_ruins_1',
        weighting: 100,
        limits: 1,
      }
    ],
    lootTags: ['armor'],
    areaLuckDelta: 0.5,
    encounterBase: 4,
    encounterRangeDeltas: 2,
    monsterTypes: [MonsterTypes.ABOMINATION,],
    encounters: [
      {
        type: LevelEncounters.COMBAT,
        weighting: 80,
      },
      {
        type: LevelEncounters.RECOVERY,
        weighting: 20,
      },
    ]
  }, {
    _identifier: 'init_ruins_1',
    areaLevel: 4,
    description: "Having fended off the attack, you look towards whence they came",
    name: "Inland",
    preface: 'Explore ',
    dynamicCompletions: [],
    completionRules: [
      {
        _identifier: 'init_ruins_2',
        weighting: 100,
        limits: 1,
      }
    ],
    lootTags: [],
    areaLuckDelta: 0.5,
    encounterBase: 3,
    encounterRangeDeltas: 0,
    monsterTypes: [],
    encounters: [
      {
        type: LevelEncounters.TRAP,
        weighting: 20,
      },
      {
        type: LevelEncounters.RECOVERY,
        weighting: 60,
      },
      {
        type: LevelEncounters.CORRUPTED,
        weighting: 20,
      },
    ]
  }, {
    _identifier: 'init_ruins_2',
    areaLevel: 4,
    description: "The initial vegetation gives wave to what can only be described as ruins",
    name: "Ruins",
    preface: 'Survey the ',
    dynamicCompletions: [],
    completionRules: [
      {
        _identifier: 'init_ruins_3',
        weighting: 100,
      }
    ],
    lootTags: [],
    areaLuckDelta: 0.5,
    encounterBase: 6,
    encounterRangeDeltas: 0,
    monsterTypes: [],
    encounters: [
      {
        type: LevelEncounters.TRAP,
        weighting: 20,
      },
      {
        type: LevelEncounters.RECOVERY,
        weighting: 60,
      },
      {
        type: LevelEncounters.CORRUPTED,
        weighting: 20,
      },
    ]
  }, {
    _identifier: 'init_ruins_3',
    areaLevel: 5,
    description: "The layout of these ruins indicate that it was some form settlement",
    name: "Ruined Town",
    preface: 'Investigate the ',
    dynamicCompletions: [
      {
        _identifier: 'init_cave',
        type: DynamicZone.CAVE,
        areaLevelDelta: 2,
        limits: 3,
        weighting: 15,
        areaLevelAnchor: DynamicZoneLevelAnchor.CHARACTER,
        areaLuckDelta: 1.5,
        encounters: [
          {
            type: LevelEncounters.COMBAT,
            weighting: 45,
          },
          {
            type: LevelEncounters.CUSTOM_C,
            weighting: 1,
          },
          {
            type: LevelEncounters.TRAP,
            weighting: 20,
          },
          {
            type: LevelEncounters.TREASURE,
            weighting: 25,
          },
        ]
      },
      {
        _identifier: 'init_island',
        type: DynamicZone.ISLAND,
        areaLevelDelta: 1,
        limits: 3,
        weighting: 10,
        areaLevelAnchor: DynamicZoneLevelAnchor.CHARACTER,
        areaLuckDelta: 1.5,
        encounters: [
          {
            type: LevelEncounters.COMBAT,
            weighting: 55,
          },
          {
            type: LevelEncounters.CUSTOM_C,
            weighting: 1,
          },
          {
            type: LevelEncounters.TRAP,
            weighting: 10,
          },
          {
            type: LevelEncounters.TREASURE,
            weighting: 25,
          },
        ]
      },
      {
        _identifier: 'init_rift',
        type: DynamicZone.RIFT,
        areaLevelDelta: 1,
        limits: 2,
        weighting: 15,
        areaLevelAnchor: DynamicZoneLevelAnchor.CHARACTER,
        areaLuckDelta: 2.5,
        encounters: [
          {
            type: LevelEncounters.COMBAT,
            weighting: 40,
          },
          {
            type: LevelEncounters.TREASURE,
            weighting: 20,
          },
          {
            type: LevelEncounters.RECOVERY,
            weighting: 25,
          },
          {
            type: LevelEncounters.CORRUPTED,
            weighting: 15,
          },
        ]
      },
    ],
    completionRules: [
      {
        _identifier: 'init_ruins_4',
        weighting: 50,
      }
    ],
    lootTags: [],
    areaLuckDelta: 0.75,
    encounterBase: 6,
    encounterRangeDeltas: 2,
    monsterTypes: [],
    encounters: [
      {
        type: LevelEncounters.TRAP,
        weighting: 5,
      },
      {
        type: LevelEncounters.RUINS_0,
        weighting: 60,
      },
      {
        type: LevelEncounters.RUINS_1,
        weighting: 17.5,
      },
      {
        type: LevelEncounters.RUINS_2,
        weighting: 17.5,
      },
    ]
  },{
    _identifier: 'init_ruins_4',
    areaLevel: 5,
    description: "The initial vegetation gives wave to what can only be described as ruins",
    name: "Surrounding Area",
    preface: 'Explore the ',
    dynamicCompletions: [
      {
        _identifier: 'init_cave',
        type: DynamicZone.CAVE,
        areaLevelDelta: 2,
        limits: 3,
        weighting: 15,
        areaLevelAnchor: DynamicZoneLevelAnchor.CHARACTER,
        areaLuckDelta: 1.5,
        encounters: [
          {
            type: LevelEncounters.COMBAT,
            weighting: 45,
          },
          {
            type: LevelEncounters.CUSTOM_C,
            weighting: 1,
          },
          {
            type: LevelEncounters.TRAP,
            weighting: 20,
          },
          {
            type: LevelEncounters.TREASURE,
            weighting: 25,
          },
        ]
      },
      {
        _identifier: 'init_island',
        type: DynamicZone.ISLAND,
        areaLevelDelta: 1,
        limits: 3,
        weighting: 10,
        areaLevelAnchor: DynamicZoneLevelAnchor.CHARACTER,
        areaLuckDelta: 1.5,
        encounters: [
          {
            type: LevelEncounters.COMBAT,
            weighting: 55,
          },
          {
            type: LevelEncounters.CUSTOM_C,
            weighting: 1,
          },
          {
            type: LevelEncounters.TRAP,
            weighting: 10,
          },
          {
            type: LevelEncounters.TREASURE,
            weighting: 25,
          },
        ]
      },
      {
        _identifier: 'init_rift',
        type: DynamicZone.RIFT,
        areaLevelDelta: 1,
        limits: 2,
        weighting: 15,
        areaLevelAnchor: DynamicZoneLevelAnchor.CHARACTER,
        areaLuckDelta: 2.5,
        encounters: [
          {
            type: LevelEncounters.COMBAT,
            weighting: 40,
          },
          {
            type: LevelEncounters.TREASURE,
            weighting: 20,
          },
          {
            type: LevelEncounters.RECOVERY,
            weighting: 25,
          },
          {
            type: LevelEncounters.CORRUPTED,
            weighting: 15,
          },
        ]
      },
    ],
    completionRules: [],
    lootTags: [],
    areaLuckDelta: 0.75,
    encounterBase: 6,
    encounterRangeDeltas: 2,
    monsterTypes: [],
    encounters: [
      {
        type: LevelEncounters.TRAP,
        weighting: 20,
      },
      {
        type: LevelEncounters.RECOVERY,
        weighting: 20,
      },
      {
        type: LevelEncounters.COMBAT,
        weighting: 60,
      },
    ]
  }
];

export const ENCOUNTERS: IEncounter[] = [
  {
    type: LevelEncounters.COMBAT,
    description: 'A group of hostile creatures appears!',
    minLevel: 0,
    alignment: 'negative'
  },
  {
    type: LevelEncounters.TREASURE,
    description: 'You discover a hidden cache!',
    minLevel: 0,
    alignment: 'positive'
  },
  {
    type: LevelEncounters.TRAP,
    description: 'You trigger a hidden trap!',
    minLevel: 1,
    alignment: 'negative'
  },
  {
    type: LevelEncounters.CORRUPTED,
    description: 'A corrupted being, twisted by dark forces, emerges from the shadows!',
    minLevel: 2,
    alignment: 'negative'
  },
  {
    type: LevelEncounters.RECOVERY,
    description: 'The path ahead is quiet and uneventful...',
    minLevel: 0,
    alignment: 'neutral'
  },
  {
    type: LevelEncounters.RUINS_0,
    description: '',
    minLevel: 0,
    alignment: 'neutral'
  },
  {
    type: LevelEncounters.RUINS_1,
    description: '',
    minLevel: 0,
    alignment: 'neutral'
  },
  {
    type: LevelEncounters.RUINS_2,
    description: '',
    minLevel: 0,
    alignment: 'neutral'
  },


  /************* Custom Events *************/
  {
    type: LevelEncounters.CUSTOM_A,
    description: 'You meet a fickle fisherman, Roiden, who serves up some of his catch',
    minLevel: 0,
    alignment: 'neutral'
  },
  {
    type: LevelEncounters.CUSTOM_B,
    description: 'You encounter a fickle fisherman, Roiden, who force-feeds you his bait',
    minLevel: 2,
    alignment: 'neutral'
  },
  // update this to be a force activation of a new mission once mission revamp is done,
  // think goblin-queen from d3
  // treasure map to Archie's Perch, signed Vedorys / Syrodev
  {
    type: LevelEncounters.CUSTOM_C,
    description: 'You spy a Long necked loot turtle, miraculously speeding out of sight.\n In its wake, you find a trail of coins seemingly forming the word Vedorys',
    minLevel: 0,
    alignment: 'neutral'
  },
  {
    type: LevelEncounters.CUSTOM_C_BOSS,
    description: 'You see the falling remains of a Long necked turtle plummeting to the ground.',
    minLevel: 0,
    alignment: 'negative'
  }
];

export const CUSTOM_LEVELS: Map<string, ILevel> = new Map([
  [ 'CUSTOM_C',
    {
      _identifier: 'vedorys_perch_0',
      areaLevel: -1,
      description: "Patches of Fur litter the way ahead.",
      name: "Archie's Perch",
      preface: 'Explore ',
      dynamicCompletions: [],
      completionRules: [],
      lootTags: ['currency'],
      areaLuckDelta: 1.5,
      encounterBase: 10,
      encounterRangeDeltas: 5,
      monsterTypes: [],
      uses: 1,
      encounters: [
        {
          type: LevelEncounters.CUSTOM_C_BOSS,
          weighting: 5,
        },
        {
          type: LevelEncounters.TRAP,
          weighting: 25,
        },
        {
          type: LevelEncounters.RECOVERY,
          weighting: 35,
        },
        {
          type: LevelEncounters.TREASURE,
          weighting: 35,
        },
      ],
      type: LevelType.DEFAULT,
    },]
]) 

export const UNKNOWN_USES: Set<string> = new Set([
  'vedorys_perch_0',
])