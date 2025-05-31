import { trace } from '@/lib/logging';
import { defineStore } from 'pinia';
import type { 
  DifficultyType, 
  IDifficulty, 
  ICharacter, 
  ICharacterStats,
  ICharacterEquipment,
  ILoot,
  ItemTierType
} from '@/lib/game';
import { 
  DIFFICULTY_SETTINGS, 
  generateClassStats 
} from '@/lib/game';
import { useGameState } from '@/lib/storage';

const LOGGING_PREFIX = '🎮 Game Engine:\t';

interface IGameEngine {
  runs: number;
  character?: ICharacter;
  difficulty: DifficultyType;
  isDead: boolean;
}

export const useGameEngine = defineStore('gameEngine', {
  state: () => {
    const gameState = useGameState();
    const savedState = gameState.get();
    
    // Initialize state from storage if it exists
    if (savedState) {
      return savedState as IGameEngine;
    }
    
    return { 
      runs: 0,
      difficulty: 'Easy',
      character: undefined,
      isDead: false,
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
    restart(){
      logger('Restarting game state');
      this.runs = 0;
      this.difficulty = 'Easy';
      this.character = undefined;
      this.isDead = false;
      this.saveState();
    },
    /**
     * Initializes a new game run with the specified character
     * @param {ICharacter} character - The character to initialize the game with
     */
    init(character: ICharacter) {
      logger(`Initializing game with character: ${character.name} (${character.class})`);
      
      this.runs = 0;
      this.character = { ...character }; // Create a new object to ensure reactivity
      this.isDead = false;
      this.saveState();
    },

    /**
     * Updates character equipment
     * @param {Partial<ICharacterEquipment>} equipment - The equipment to update
     */
    updateEquipment(equipment: Partial<ICharacterEquipment>) {
      if (!this.character) return;
      logger(`Updating equipment for ${this.character.name}`);
      this.character.equipment = { ...this.character.equipment, ...equipment };
      this.saveState();
    },

    /**
     * Updates character stats
     * @param {Partial<ICharacterStats>} stats - The stats to update
     */
    updateStats(stats: Partial<ICharacterStats>) {
      if (!this.character) return;
      logger(`Updating stats for ${this.character.name}`);
      this.character.stats = { ...this.character.stats, ...stats };
      this.saveState();
    },

    /**
     * Takes damage from the character's health
     * @param {number} amount - Amount of damage to take
     * @param {boolean} [applyReduction=true] - Whether to apply damage reduction from fortitude
     */
    takeDamage(amount: number, applyReduction: boolean = true) {
      if (!this.character) return;
      logger(`Taking ${amount} damage`);
      
      let finalDamage = amount;
      if (applyReduction) {
        const reduction = this.getDamageReduction;
        finalDamage = Math.floor(amount * (1 - reduction));
      }
      
      const newHealth = Math.max(0, this.character.stats.health - finalDamage);
      this.updateStats({ health: newHealth });
      
      // Check if character died from this damage
      if (newHealth <= 0) {
        this.isDead = true;
        this.saveState();
      }
    },

    /**
     * Heals the character's health
     * @param {number} amount - Amount of health to restore
     */
    heal(amount: number) {
      if (!this.character) return;
      logger(`Healing ${amount} health`);
      
      const newHealth = Math.min(100, this.character.stats.health + amount);
      this.updateStats({ health: newHealth });
    },

    /**
     * Modifies a stat by a relative amount
     * @param {keyof ICharacterStats} stat - The stat to modify
     * @param {number} amount - Amount to modify the stat by (can be negative)
     */
    modifyStat(stat: keyof ICharacterStats, amount: number) {
      if (!this.character) return;
      logger(`Modifying ${stat} by ${amount}`);
      
      const currentValue = this.character.stats[stat];
      const newValue = Math.max(0, currentValue + amount);
      this.updateStats({ [stat]: newValue });
    },

    /**
     * Updates character gold
     * @param {number} amount - Amount to add (can be negative)
     */
    updateGold(amount: number) {
      if (!this.character) return;
      logger(`Updating gold for ${this.character.name}: ${amount}`);
      this.character.gold += amount;
      this.saveState();
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
      
      this.saveState();
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
      this.saveState();
    },
    addSpecificLoot(_loot: { type: string; amount: number }[]){
      if (!this.character) return;
      logger(`Adding custom loot for char.`);

      this.saveState();
    },

    addLoot(amount: number){
      if (!this.character) return;
      logger(`Adding ${amount} loot items for ${this.character.name}`);

      // Initialize loot array if it doesn't exist
      if (!this.character.loot) {
        this.character.loot = [];
      }

      // Calculate fortune multiplier (10 is baseline, exponential scaling capped at 2x)
      const fortuneDelta = this.character.stats.fortune - 10;
      const fortuneMultiplier = Math.min(2, Math.max(0.5, 1 + (Math.pow(Math.abs(fortuneDelta), 1.5) / 100) * Math.sign(fortuneDelta)));
      const totalLoot = Math.floor(amount * fortuneMultiplier);

      // Generate random loot items
      for (let i = 0; i < totalLoot; i++) {
        const newLoot: ILoot = {
          identified: false,
          cursed: Math.random() < 0.1, // 10% chance to be cursed
          corrupted: Math.random() < 0.05, // 5% chance to be corrupted
          name: `Mysterious Item ${generateRandomId()}`,
          itemDetails: {
            tier: ['basic', 'enhanced', 'exceptional', 'abstract', 'infused'][Math.floor(Math.random() * 5)] as ItemTierType,
            mutations: [],
            affixes: {
              embedded: [],
              prefix: [],
              suffix: []
            }
          }
        };
        
        this.character.loot.push(newLoot);
      }

      this.saveState();
    },

    /**
     * Increments the number of completed runs
     * @param {number} [value=1] - The number of runs to add (defaults to 1)
     */
    incrementRuns(value: number = 1) {
      logger(`New run(s): ${value}`);
      this.runs += value;
      this.saveState();
    },

    /**
     * Saves the current game state to storage
     */
    saveState() {
      logger('Saving game state');
      useGameState().$set(this.$state);
    },
  },
});

function logger(message: string) {
  trace(`${LOGGING_PREFIX}${message}`);
}

/**
 * Generates a random string using the first segment of a UUID
 * @returns {string} Random string from UUID's first segment
 */
function generateRandomId(): string {
  return crypto.randomUUID().split('-')[0];
}