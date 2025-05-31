<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useGameEngine } from '@/stores/game';
import type { ExileClassType } from '@/lib/game';
import { 
  EXILE_CLASSES, 
  CLASS_DESCRIPTIONS, 
  BASE_STATS,
  generateClassStats
} from '@/lib/game';

const gameEngine = useGameEngine();
const characterName = ref('');
const selectedClass = ref<ExileClassType>('Spellsword');

// Randomly select initial class
onMounted(() => {
  const randomIndex = Math.floor(Math.random() * EXILE_CLASSES.length);
  selectedClass.value = EXILE_CLASSES[randomIndex];
});

const createCharacter = () => {
  if (!characterName.value.trim()) return;

  const baseStats = { ...BASE_STATS };
  const classBonus = generateClassStats(selectedClass.value);
  
  // Apply class bonuses to base stats
  Object.entries(classBonus).forEach(([stat, bonus]) => {
    baseStats[stat as keyof typeof baseStats] += bonus;
  });

  gameEngine.init({
    name: characterName.value.trim(),
    class: selectedClass.value,
    level: 1,
    experience: 0,
    stats: baseStats,
    equipment: {},
    skills: [],
    gold: 100
  });
};
</script>

<template>
  <div class="flex flex-col gap-6 p-6 bg-gray-800 rounded-lg max-w-md mx-auto">
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
        <input
          id="character-name"
          v-model="characterName"
          type="text"
          class="px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your name"
          aria-label="Character name"
        />
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
                ? 'bg-blue-600 text-white'
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

      <!-- Create Button -->
      <button
        :disabled="!characterName.trim()"
        class="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-blue-700"
        @click="createCharacter"
      >
        Begin Your Journey
      </button>
    </div>
  </div>
</template> 