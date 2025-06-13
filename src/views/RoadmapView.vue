<script setup lang="ts">
  import FluidElement from '@/components/elements/FluidElement.vue';

  type FeatureStatusType = 'completed' | 'partial' | 'pending';
  type FeaturePriorityType = 'high' | 'normal' | 'low';

  interface IFeature {
    title: string;
    status: FeatureStatusType;
    description: string;
    priority: FeaturePriorityType,
    keyPoints: string[];
  }

  const features: IFeature[] = [
    {
      title: 'Class Based Crits',
      description: 'Critical strike effects should be different per class',
      priority: 'normal',
      status: 'pending',
      keyPoints: [
        'Reaver crit should life-leech (as per current)',
        'Chaos Mage crit should: TBD, big volatile explosion???',
        'Spellsword crit should: temp buff for 2 turns of (+X or + X%) elemental type damage',
      ],
    },
    {
      title: 'Leveling System 1.7',
      description: 'Leveling up should always give the user a choice',
      priority: 'high',
      status: 'completed',
      keyPoints: [
        'When a levelUp doesn\'t give a new passive or skill, we should still have some user selection (+2 to a selectable stat || +5 to HP / Mana)',
      ],
    },
    {
      title: 'Leveling System 1.6',
      description: 'Skills and Passives offered Should not include those you already have',
      priority: 'high',
      status: 'completed',
      keyPoints: [
        'Add limiting support by Already acquired',
      ],
    },
    {
      title: 'Dynamic Passives',
      description: 'Passives offered should be gated by some factors, class, char-level, progression',
      priority: 'high',
      status: 'completed',
      keyPoints: [
        'Add limiting support by CharLevel',
        'Add limiting support by Char Class',
        'Add limiting support by world state TBD (mission system 2.0)',
      ],
    },
    {
      title: 'More Dynamic Skills',
      description: 'Skills offered should be gated by some factors, class, progression',
      priority: 'high',
      status: 'completed',
      keyPoints: [
        'Add limiting support by CharLevel',
        'Add limiting support by Char Class',
        'Add limiting support by world state TBD (mission system 2.0)',
      ],
    },
    {
      title: 'Values Normalization',
      description: 'A full parse and normalization pass on all number values as these are out of wack due to multiple overhauls to items / combat',
      priority: 'high',
      status: 'partial',
      keyPoints: [
        'Less spiky mission progression',
        'Cleaner / smoother progression flow of affix tiers',
      ],
    },
    {
      title: 'Mission System 2.0',
      description: 'A full revamp of the missions system',
      priority: 'normal',
      status: 'completed',
      keyPoints: [
        'A core progression framework for missions',
        'System to spawn infinitely more content',
        'System to Randomly spawn sub-zones relative to both char-level and / or previous zone level',
      ],
    },
    {
      title: 'Item System 2.5',
      description: 'Items affixes need some love.',
      priority: 'normal',
      status: 'pending',
      keyPoints: [
        'Add Synergy system',
        'Add ability for accessories to be stacked',
        'Add Disturbance system for accessories',
      ],
    },
    {
      title: 'Item System 2.0',
      description: 'Items need some base values, item type should also limit affix availability.',
      priority: 'normal',
      status: 'completed',
      keyPoints: [
        'Basic tier items will have a use',
        'Basic tier items wont need to be identified',
        'Affix pools to be limited by item type',
      ],
    },
    {
      title: 'Leveling System 1.5',
      description: 'Allow better progression',
      priority: 'high',
      status: 'completed',
      keyPoints: [
        'Keep attribute increases per level',
        'Add skills and skill-system',
        'on level up chose 1-3 random skills',
        'on level up and new level is divisible by 5',
        'once char is create select 1st skill',
      ],
    },
    {
      title: 'Mission System 1.5',
      description: 'Adding expected features as per UI',
      priority: 'high',
      status: 'completed',
      keyPoints: [
        'Add area drop biasing',
        'Item Tiers dropped limited in some fashion likely area-level'
      ],
    },
    {
      title: 'UI/UX polish',
      description: 'Ensuring the UI / UX is ',
      priority: 'normal',
      status: 'partial',
      keyPoints: [
        'Incrementally enhance and update the UI/UX experience',
      ],
    },
    {
      title: 'Item System',
      description: 'Various itemTypes are available, with various modular aspects to them.',
      priority: 'high',
      status: 'completed',
      keyPoints: [
        'Gear can have mutations',
        'Gear can be of various types',
        'Affixes on gear are pulled dynamically depending on what slot the affix is',
        'Affixes are a mix of additive values and / or ranges',
      ],
    },
    {
      title: 'Basic game loop',
      description: 'players are able to engage in various missions, find / equip / remove various gear which affects the players stats',
      priority: 'high',
      status: 'completed',
      keyPoints: [
        'Can find / use gear',
        'Can combat reflects the stats from the gears',
        'Can proceed through missions / levels to fight final challenge',
      ],
    },
  ]

  const Ordering: Map<FeatureStatusType, number> = new Map([
    ['completed',2],
    ['partial',1],
    ['pending',0],
  ]);

</script>

<template>
  <section class="flex flex-col items-center m-2 pb-10 gap-2 overflow-y-scroll overflow-x-clip scrollbar max-h-[80dvh]">
    <template
      v-for="feature, index in features.toSorted((a,b) => (Ordering.get(a.status)||0) - (Ordering.get(b.status)||0))"
      :key="`feature_${index}`"
    >
      <FluidElement 
        class="
          max-w-[32rem] w-full 
          text-center 
          grid grid-cols-1

          transition-all duration-500
          hover:z-10
          hover:scale-125
        "
        :class="[
          { '!border-cyan-500': feature.status === 'partial' },
          { '!border-red-400': feature.status === 'pending' },
        ]"
      >
        <div class="flex justify-between w-full">
          <h3 class="text-xl text-left font-semibold">
            {{ feature.title }}:
          </h3>
          <h3
            class="capitalize font-semibold"
            :class="[
              { 'text-emerald-400': feature.status === 'completed' },
              { 'text-cyan-500': feature.status === 'partial' },
              { 'text-red-400': feature.status === 'pending' },
            ]"
          >
            {{ feature.status }}
          </h3>
        </div>
        <p class="text-left">
          {{ feature.description }}
        </p>
        <ul>
          <template
            v-for="point, pIndex in feature.keyPoints"
            :key="`feature_point_${pIndex}-${index}`"
          >
            <li class="list-inside list-disc text-left">
              {{ point }}
            </li>
          </template>
        </ul>
      </FluidElement>
    </template>
  </section>
  <section class="mask-b"></section>
</template>

<style scoped>
  @reference "@/assets/main.css";
  .mask-b{
    @apply relative;
    @apply before:absolute before:w-[calc(100%_-_1rem)] before:h-16 before:bottom-0 before:left-0;
    @apply before:bg-slate-800;
  }
  .mask-b::before {
    mask-image: linear-gradient(
      to bottom, 
      transparent,
      black 80%
    );
    @apply z-10;
  }
</style>