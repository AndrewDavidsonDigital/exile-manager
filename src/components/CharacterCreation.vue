<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useGameEngine } from '@/stores/game';
import type { ExileClassType, DifficultyType } from '@/lib/core';
import { 
  EXILE_CLASSES, 
  CLASS_DESCRIPTIONS, 
  BASE_STATS,
  DIFFICULTY_SETTINGS,
  ExileClass
} from '@/lib/core';
import { FANTASY_NAMES } from '@/lib/characters';
import { IconRepeat } from './icons';
import { generateClassStats } from '@/lib/game';

const $emit = defineEmits<{
  (_e: 'character-created'): void
}>();

const gameEngine = useGameEngine();
const characterName = ref('');
const selectedClass = ref<ExileClassType>(ExileClass.SPELLSWORD);
const selectedDifficulty = ref<DifficultyType>('Normal');

// Randomly select initial class
onMounted(() => {
  const randomIndex = Math.floor(Math.random() * EXILE_CLASSES.length);
  selectedClass.value = EXILE_CLASSES[randomIndex];
});

const createCharacter = (): void => {
  if (!characterName.value.trim()) return;

  const baseStats = { ...BASE_STATS };
  const classBonus = generateClassStats(selectedClass.value);
  
  // Apply class bonuses to base stats
  Object.entries(classBonus).forEach(([stat, bonus]) => {
    baseStats[stat as keyof typeof baseStats] += bonus;
  });

  // Set the difficulty first
  gameEngine.difficulty = selectedDifficulty.value;

  gameEngine.init({
    name: characterName.value.trim(),
    class: selectedClass.value,
    level: 1,
    experience: 0,
    stats: baseStats,
    equipment: {},
    skills: [],
    gold: 100,
    loot: [],
    passives: [],
    pendingRewards: {
      passives: 0,
      skills: 0,
      stats: 0,
    },
    cooldowns: [],
    temporalEffects: [],
    refreshes: 0,
  });

  $emit('character-created');
};

function generateName(): void {
  const randomIndex = Math.floor(Math.random() * FANTASY_NAMES.length);
  characterName.value = FANTASY_NAMES[randomIndex];
}

</script>

<template>
  <div class="flex flex-col gap-6 py-6 bg-gray-800 rounded-lg max-w-md mx-auto">
    <h2 class="text-2xl font-bold text-white text-center">
      Create Your Character
    </h2>
    
    <div class="flex flex-col gap-4">
      <!-- Name Input -->
      <div class="flex flex-col gap-2">
        <label
          for="character-name"
          class="text-gray-300"
        >Character Name</label>
        <div class="w-full grid-area-stack">
          <button
            class="mr-2 ml-auto my-auto z-10"
            @click="generateName"
          >
            <IconRepeat class="text-emerald-400" />
          </button>
          <input
            id="character-name"
            v-model="characterName"
            type="text"
            class="px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Enter your name"
            aria-label="Character name"
            auto
          />
        </div>
      </div>

      <!-- Class Selection -->
      <div class="flex flex-col gap-2">
        <label
          id="class-selection-label"
          class="text-gray-300"
        >Choose Your Class</label>
        <div 
          class="grid grid-cols-3 gap-2" 
          role="radiogroup" 
          aria-labelledby="class-selection-label"
        >
          <button
            v-for="classType in EXILE_CLASSES"
            :key="classType"
            class="px-4 py-2 rounded-lg transition-colors"
            :class="[
              selectedClass === classType
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            ]"
            :aria-label="`Select ${classType} class`"
            :aria-checked="selectedClass === classType"
            role="radio"
            @click="selectedClass = classType"
          >
            {{ classType }}
          </button>
        </div>
      </div>

      <!-- Class Description -->
      <div class="p-4 bg-gray-700 rounded-lg">
        <h3 class="text-lg font-semibold text-white mb-2">
          {{ selectedClass }}
        </h3>
        <p class="text-gray-300 text-sm">
          {{ CLASS_DESCRIPTIONS[selectedClass] }}
        </p>
      </div>

      <!-- Difficulty Selection -->
      <div class="flex flex-col gap-2">
        <label
          id="difficulty-selection-label"
          class="text-gray-300"
        >Choose Difficulty</label>
        <div 
          class="grid grid-cols-3 gap-2" 
          role="radiogroup" 
          aria-labelledby="difficulty-selection-label"
        >
          <button
            v-for="[difficulty] in DIFFICULTY_SETTINGS"
            :key="difficulty"
            class="px-4 py-2 rounded-lg transition-colors"
            :class="[
              selectedDifficulty === difficulty
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            ]"
            :aria-label="`Select ${difficulty} difficulty`"
            :aria-checked="selectedDifficulty === difficulty"
            role="radio"
            @click="selectedDifficulty = difficulty"
          >
            {{ difficulty }}
          </button>
        </div>
      </div>

      <!-- Create Button -->
      <button
        :disabled="!characterName.trim()"
        class="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-emerald-700"
        @click="createCharacter"
      >
        Begin Your Journey
      </button>
    </div>
  </div>
</template> 