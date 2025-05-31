export type LootType = 'armor' | 'weapons' | 'jewelry' | 'currency';

export interface ILevel {
  areaLevel: number;
  name: string;
  description: string;
  lootTags: LootType[];
  areaLuckDelta?: number;
  encounterBase: number;
  encounterRangeDeltas: number;
} 

export const levels: ILevel[] = [
  {
    areaLevel: 0,
    description: "Washed up on the shores of the ",
    name: "The first last stand",
    lootTags: ['armor', 'weapons'],
    areaLuckDelta: 0.3,
    encounterBase: 4,
    encounterRangeDeltas: 1
  },
  {
    areaLevel: 1,
    description: "Having survived the last stand you progress on towards tomorrow",
    name: "Beach",
    lootTags: ['armor', 'weapons'],
    encounterBase: 5,
    encounterRangeDeltas: 1
  },
  {
    areaLevel: 2,
    description: "Having survived the last stand you progress on towards tomorrow",
    name: "Mini Boss",
    lootTags: ['currency', 'jewelry'],
    encounterBase: 6,
    encounterRangeDeltas: 2
  },
  {
    areaLevel: 3,
    description: "Having survived the last stand you progress on towards tomorrow",
    name: "Beach3",
    lootTags: ['weapons'],
    encounterBase: 7,
    encounterRangeDeltas: 2
  },
  {
    areaLevel: 4,
    description: "Having survived the last stand you progress on towards tomorrow",
    name: "Boss",
    lootTags: ['currency', 'jewelry'],
    encounterBase: 8,
    encounterRangeDeltas: 3
  },
];