import { trace } from '@/lib/logging';
import { defineStore } from 'pinia';
import type { 
  DifficultyType, 
  IDifficulty, 
  ICharacter, 
  ICharacterStats 
} from '@/lib/game';
import { 
  DIFFICULTY_SETTINGS, 
  generateClassStats 
} from '@/lib/game';

const LOGGING_PREFIX = '🎮 Game Engine:\t';

interface IGameEngine {
  runs: number;
  character?: ICharacter;
  difficulty: DifficultyType;
}

export const useGameEngine = defineStore('gameEngine', {
  state: () => {
    return { 
      runs: 0,
      difficulty: 'Easy',
    } as IGameEngine
  },

  getters: {
    /**
     * Retrieves the current difficulty settings including multipliers
     * @returns {IDifficulty | -1} The current difficulty settings or -1 if not found
     */
    getDifficulty(): IDifficulty | -1 {
      const retval = DIFFICULTY_SETTINGS.get(this.difficulty);
      if (retval)
        return retval;
      return -1;
    },

    /**
     * Retrieves the current character
     * @returns {ICharacter | -1} The current character or -1 if none exists
     */
    getCharacter(): ICharacter | -1 {
      logger(`Retrieving character: ${this.character?.name || 'none'}`);
      if (!this.character) return -1;
      return this.character;
    },

    /**
     * Calculates damage reduction based on fortitude
     * @returns {number} Damage reduction percentage (0-1)
     */
    getDamageReduction(): number {
      logger(`Calculating damage reduction for ${this.character?.name}`);
      if (!this.character) return 0;
      return Math.min(0.75, this.character.stats.fortitude / 100);
    },

    /**
     * Calculates critical hit chance based on wrath
     * @returns {number} Critical hit chance (0-1)
     */
    getCriticalChance(): number {
      logger(`Calculating critical chance for ${this.character?.name}`);
      if (!this.character) return 0;
      return Math.min(0.5, this.character.stats.wrath / 100);
    },

    /**
     * Calculates spell power multiplier based on affinity
     * @returns {number} Spell power multiplier
     */
    getSpellPower(): number {
      logger(`Calculating spell power for ${this.character?.name}`);
      if (!this.character) return 1;
      return 1 + (this.character.stats.affinity / 50);
    },

    /**
     * Calculates success chance for luck-based actions based on fortune
     * @returns {number} Success chance (0-1)
     */
    getFortuneChance(): number {
      logger(`Calculating fortune chance for ${this.character?.name}`);
      if (!this.character) return 0;
      return Math.min(0.9, this.character.stats.fortune / 100);
    },
  },

  actions: {
    /**
     * Initializes a new game run with the specified character
     * @param {ICharacter} character - The character to initialize the game with
     */
    init(character: ICharacter) {
      logger(`Initializing game with character: ${character.name} (${character.class})`);
      this.runs = 0;
      this.character = character;
    },

    /**
     * Adds experience to the character and handles level up if needed
     * @param {number} amount - Amount of experience to add
     */
    addExperience(amount: number) {
      logger(`Adding ${amount} experience to ${this.character?.name}`);
      if (!this.character) return;
      
      this.character.experience += amount;
      const expNeeded = this.character.level * 100;
      
      if (this.character.experience >= expNeeded) {
        this.levelUp();
      }
    },

    /**
     * Handles character level up and attribute increases
     */
    levelUp() {
      if (!this.character) return;
      
      logger(`Leveling up ${this.character.name} to level ${this.character.level + 1}`);
      this.character.level++;
      this.character.experience = 0;
      
      // Generate new stat bonuses for level up
      const statBonus = generateClassStats(this.character.class);
      
      // Apply the new stat bonuses
      Object.entries(statBonus).forEach(([stat, bonus]) => {
        this.character!.stats[stat as keyof ICharacterStats] += bonus;
      });
      
      logger(`Character leveled up to ${this.character.level}`);
    },

    /**
     * Increments the number of completed runs
     * @param {number} [value=1] - The number of runs to add (defaults to 1)
     */
    incrementRuns(value: number = 1) {
      logger(`New run(s): ${value}`);
      this.runs += value;
    },
  },
});

function logger(message: string) {
  trace(`${Date.now()} ${LOGGING_PREFIX}${message}`);
}