import { MonsterTypes, type LootType } from "@/lib/core";

/**
 * Represents a game level with its properties and configuration
 */
export interface ILevel {
  areaLevel: number;
  name: string;
  description: string;
  lootTags: LootType[];
  areaLuckDelta?: number;
  encounterBase: number;
  encounterRangeDeltas: number;
  monsterTypes: MonsterTypes[];
  encounters: IEncounterConfig[],
}

export interface IEncounterConfig {
  type: LevelEncounters,
  weighting: number,
}

export enum LevelEncounters {
  COMBAT = 0,
  RECOVERY,
  TRAP,
  TREASURE,
  CORRUPTED,

  CUSTOM_A,
  CUSTOM_B,
  CUSTOM_C,

}

/**
 * List of all available game levels
 */
export const levels: ILevel[] = [
  {
    areaLevel: 0,
    description: "Washed up on the edge of a reef.",
    name: "The first last stand",
    lootTags: ['armor', 'weapons'],
    areaLuckDelta: 0.3,
    encounterBase: 4,
    encounterRangeDeltas: 1,
    monsterTypes: [MonsterTypes.UNDEAD],
    encounters: [
      {
        type: LevelEncounters.COMBAT,
        weighting: 2,
      },
      {
        type: LevelEncounters.RECOVERY,
        weighting: 2,
      },
      {
        type: LevelEncounters.TREASURE,
        weighting: 1,
      },
      {
        type: LevelEncounters.CUSTOM_A,
        weighting: 1,
      },
    ]
  },
  {
    areaLevel: 1,
    description: "Having survived the last stand you progress on towards tomorrow",
    name: "Beach",
    lootTags: ['armor', 'weapons'],
    encounterBase: 5,
    encounterRangeDeltas: 1,
    monsterTypes: [MonsterTypes.BEAST, MonsterTypes.HUMANOID],
    encounters: [
      {
        type: LevelEncounters.COMBAT,
        weighting: 3,
      },
      {
        type: LevelEncounters.RECOVERY,
        weighting: 1,
      },
      {
        type: LevelEncounters.TRAP,
        weighting: 1,
      },
      {
        type: LevelEncounters.TREASURE,
        weighting: 2,
      },
      {
        type: LevelEncounters.CUSTOM_A,
        weighting: 2,
      },
      {
        type: LevelEncounters.CUSTOM_B,
        weighting: 1,
      },
      {
        type: LevelEncounters.CUSTOM_C,
        weighting: 1,
      },
    ]
  },
  {
    areaLevel: 2,
    description: "LORE TBD",
    name: "Mini Boss",
    lootTags: ['currency', 'accessory'],
    encounterBase: 6,
    encounterRangeDeltas: 2,
    monsterTypes: [MonsterTypes.BEAST, MonsterTypes.ELEMENTAL],
    encounters: [
      {
        type: LevelEncounters.COMBAT,
        weighting: 2,
      },
      {
        type: LevelEncounters.RECOVERY,
        weighting: 2,
      },
      {
        type: LevelEncounters.TREASURE,
        weighting: 1,
      },
      {
        type: LevelEncounters.CUSTOM_A,
        weighting: 1,
      },
      {
        type: LevelEncounters.CUSTOM_B,
        weighting: 1,
      },
      {
        type: LevelEncounters.CUSTOM_C,
        weighting: 1,
      },
    ]
  },
  {
    areaLevel: 3,
    description: "LORE TBD",
    name: "Beach3",
    lootTags: ['weapons'],
    encounterBase: 7,
    encounterRangeDeltas: 2,
    monsterTypes: [MonsterTypes.UNDEAD, MonsterTypes.ABOMINATION],
    encounters: [
      {
        type: LevelEncounters.COMBAT,
        weighting: 2,
      },
      {
        type: LevelEncounters.RECOVERY,
        weighting: 2,
      },
      {
        type: LevelEncounters.CUSTOM_A,
        weighting: 1,
      },
      {
        type: LevelEncounters.CUSTOM_B,
        weighting: 1,
      },
      {
        type: LevelEncounters.CUSTOM_C,
        weighting: 1,
      },
    ]
  },
  {
    areaLevel: 4,
    description: "LORE TBD",
    name: "Boss",
    lootTags: ['currency', 'accessory'],
    encounterBase: 8,
    encounterRangeDeltas: 3,
    monsterTypes: [MonsterTypes.ABOMINATION],
    encounters: [
      {
        type: LevelEncounters.CORRUPTED,
        weighting: 2,
      },
      {
        type: LevelEncounters.COMBAT,
        weighting: 3,
      },
      {
        type: LevelEncounters.TREASURE,
        weighting: 1,
      },
    ]
  },
];
