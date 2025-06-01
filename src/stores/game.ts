import { trace } from '@/lib/logging';
import { defineStore } from 'pinia';
import type { 
  DifficultyType, 
  IDifficulty, 
  ICharacter, 
  ICharacterStats,
  ICharacterEquipment,
  ILoot,
  ItemTierType,
  ICombatStat,
  IMitigation
} from '@/lib/game';
import { 
  DEFAULT_MITIGATION,
  DIFFICULTY_SETTINGS, 
  generateClassStats,
  ITEM_TIER_COSTS,
  generateAffixesForTier
} from '@/lib/game';
import { useGameState } from '@/lib/storage';

const LOGGING_PREFIX = '🎮 Game Engine:\t';

interface IGameEngine {
  runs: number;
  character: ICharacter | undefined;
  difficulty: DifficultyType;
  isDead: boolean;
  stash: ILoot[];
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
      stash: [],
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
     * Retrieves the current character
     * @returns {ICharacter | -1} The current character or -1 if none exists
     */
    getCombatStats(): ICombatStat | -1 {
      logger(`Retrieving character: ${this.character?.name || 'none'}`);
      if (!this.character) return -1;
      let retval: ICombatStat = {
        accuracy: 100,
        damagePerTick: 15,
        health: this.character.stats.currentHealth,
        mana: this.character.stats.currentMana,
        mitigation: resolveMitigation(this.character),
      };
      return retval;
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
      console.log('takeDamage: Initial health', this.character.stats.currentHealth);
      
      let finalDamage = amount;
      if (applyReduction) {
        const reduction = this.getDamageReduction;
        finalDamage = Math.floor(amount * (1 - reduction));
      }
      console.log('takeDamage: finalDamage', finalDamage);
      
      const newHealth = Math.max(0, this.character.stats.currentHealth - finalDamage);
      console.log('takeDamage: newHealth calculated', newHealth);
      this.updateStats({ currentHealth: newHealth });
      console.log('takeDamage: health after updateStats', this.character.stats.currentHealth);
      
      // Check if character died from this damage
      if (newHealth <= 0) {
        this.isDead = true;
        this.character.stats.currentHealth = 0; // Ensure health is set to 0 when dead
        this.saveState();
      }
    },

    /**
     * Heals the character's health
     * @param {number} amount - Amount of health to restore
     */
    heal(amount: number, isPercent: boolean = false) {
      if (!this.character) return;
      logger(`Healing ${amount} health${isPercent ? ' %' : ''}`);
      
      let newHealth;
      if (isPercent) {
        newHealth = Math.min(this.character.stats.health, this.character.stats.currentHealth + (this.character.stats.health * (100 / amount)));
      }else{
        newHealth = Math.min(this.character.stats.health, this.character.stats.currentHealth + amount);
      }
      this.updateStats({ currentHealth: newHealth });
    },

    /**
     * Heals the character's health
     * @param {number} amount - Amount of health to restore
     */
    recoverMana(amount: number, isPercent: boolean = false) {
      if (!this.character) return;
      logger(`Recovering ${amount} mana${isPercent ? ' %' : ''}`);
      
      let newMana;
      if (isPercent) {
        newMana = Math.min(this.character.stats.mana, this.character.stats.currentMana + (this.character.stats.mana * (100 / amount)));
      }else{
        newMana = Math.min(this.character.stats.mana, this.character.stats.currentMana + amount);
      }
      this.updateStats({ currentMana: newMana });
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
        // Generate a random item type
        const type = ['Sword', 'Shield', 'Amulet', 'Ring', 'Boots', 'Gloves', 'Helmet', 'Armor'][Math.floor(Math.random() * 8)];

        const newLoot: ILoot = {
          identified: false,
          cursed: Math.random() < 0.1, // 10% chance to be cursed
          corrupted: Math.random() < 0.05, // 5% chance to be corrupted
          name: generateRandomId(), // Temporary name until identified
          type: type, // Set the type here
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

    identifyLoot(lootIndex: number) {
      if (!this.character || !this.character.loot[lootIndex]) return;
      logger(`Identifying loot[${lootIndex}]`);
      
      const loot = this.character.loot[lootIndex];
      if (loot.identified) return;

      // Calculate identification cost based on tier
      const tier = loot.itemDetails?.tier || 'basic';
      
      // Use the tier cost directly as the total cost
      const totalCost = ITEM_TIER_COSTS[tier];

      // Check if character has enough gold
      if (this.character.gold < totalCost) {
        logger(`Not enough gold to identify item. Cost: ${totalCost}, Available: ${this.character.gold}`);
        return;
      }

      // Deduct the cost
      this.character.gold -= totalCost;

      // The type is already set when the loot was created
      const type = loot.type; // Get the type from the loot object
      
      // Generate affixes based on tier
      const affixes = generateAffixesForTier(tier, type);
      
      // Update item details with generated affixes
      loot.itemDetails = {
        tier,
        mutations: loot.itemDetails?.mutations || [],
        affixes: {
          embedded: affixes.embedded,
          prefix: affixes.prefix,
          suffix: affixes.suffix
        }
      };

      // Generate item name based on affixes
      const prefixName = affixes.prefix.length > 0 ? `${affixes.prefix[0].id.split('_')[1].charAt(0).toUpperCase() + affixes.prefix[0].id.split('_')[1].slice(1)} ` : '';
      const suffixName = affixes.suffix.length > 0 ? ` of ${affixes.suffix[0].id.split('_')[1].charAt(0).toUpperCase() + affixes.suffix[0].id.split('_')[1].slice(1)}` : '';
      const embeddedName = affixes.embedded.length > 0 ? `${affixes.embedded[0].id.split('_')[1].charAt(0).toUpperCase() + affixes.embedded[0].id.split('_')[1].slice(1)} ` : '';
      
      // Use the stored type in the name generation
      loot.name = `${prefixName}${embeddedName}${tier.charAt(0).toUpperCase() + tier.slice(1)} ${loot.type}${suffixName}`;
      
      // Mark as identified
      loot.identified = true;
      
      this.saveState();
    },

    /**
     * Moves an item from inventory to stash
     * @param {number} lootIndex - Index of the item in inventory
     */
    stashItem(lootIndex: number) {
      if (!this.character || !this.character.loot[lootIndex]) return;
      logger(`Stashing item at index ${lootIndex}`);
      
      const item = this.character.loot[lootIndex];
      this.stash.push(item);
      this.character.loot.splice(lootIndex, 1);
      this.saveState();
    },

    /**
     * Moves an item from stash to inventory
     * @param {number} stashIndex - Index of the item in stash
     */
    unstashItem(stashIndex: number) {
      if (!this.character || !this.stash[stashIndex]) return;
      logger(`Unstashing item at index ${stashIndex}`);
      
      const item = this.stash[stashIndex];
      this.character.loot.push(item);
      this.stash.splice(stashIndex, 1);
      this.saveState();
    },

    /**
     * Identifies an item in the stash
     * @param {number} stashIndex - Index of the item in stash
     */
    identifyStashItem(stashIndex: number) {
      if (!this.stash[stashIndex]) return;
      logger(`Identifying stash item at index ${stashIndex}`);
      
      const loot = this.stash[stashIndex];
      if (loot.identified) return;

      // Calculate identification cost based on tier
      const tier = loot.itemDetails?.tier || 'basic';
      const totalCost = ITEM_TIER_COSTS[tier];

      // Check if character has enough gold
      if (!this.character || this.character.gold < totalCost) {
        logger(`Not enough gold to identify item. Cost: ${totalCost}, Available: ${this.character?.gold || 0}`);
        return;
      }

      // Deduct the cost
      this.character.gold -= totalCost;

      // The type is already set when the loot was created
      const type = loot.type; // Get the type from the loot object
      
      // Generate affixes based on tier
      const affixes = generateAffixesForTier(tier, type);
      
      // Update item details with generated affixes
      loot.itemDetails = {
        tier,
        mutations: loot.itemDetails?.mutations || [],
        affixes: {
          embedded: affixes.embedded,
          prefix: affixes.prefix,
          suffix: affixes.suffix
        }
      };

      // Generate item name based on affixes
      const prefixName = affixes.prefix.length > 0 ? `${affixes.prefix[0].id.split('_')[1].charAt(0).toUpperCase() + affixes.prefix[0].id.split('_')[1].slice(1)} ` : '';
      const suffixName = affixes.suffix.length > 0 ? ` of ${affixes.suffix[0].id.split('_')[1].charAt(0).toUpperCase() + affixes.suffix[0].id.split('_')[1].slice(1)}` : '';
      const embeddedName = affixes.embedded.length > 0 ? `${affixes.embedded[0].id.split('_')[1].charAt(0).toUpperCase() + affixes.embedded[0].id.split('_')[1].slice(1)} ` : '';
      
      // Use the stored type in the name generation
      loot.name = `${prefixName}${embeddedName}${tier.charAt(0).toUpperCase() + tier.slice(1)} ${loot.type}${suffixName}`;
      
      // Mark as identified
      loot.identified = true;
      
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

    /**
     * Equips an item from inventory or stash
     * @param {ILoot} item - The item to equip
     * @param {boolean} fromStash - Whether the item is from stash
     */
    equipItem(item: ILoot, fromStash: boolean = false) {
      if (!this.character || !item.itemDetails) return;
      logger(`Equipping item: ${item.name}${fromStash ? ' from stash' : ''}`);
      
      // Use the item's explicit type field
      const itemType = item.type.toLowerCase();

      // Map item types to equipment slots
      const slotMap: Record<string, keyof ICharacterEquipment> = {
        'sword': 'weapon',
        'shield': 'weapon',
        'amulet': 'neck',
        'ring': 'leftHand',
        'boots': 'feet',
        'gloves': 'arms',
        'helmet': 'head',
        'armor': 'chest'
      };

      const slot = slotMap[itemType];
      if (!slot) {
        logger(`Cannot equip item of type ${item.type}. No corresponding equipment slot found.`);
        return; // Added a return here to prevent further execution if slot is not found
      }

      // Remove item from source
      if (fromStash) {
        const stashIndex = this.stash.findIndex(loot => loot === item);
        if (stashIndex !== -1) {
          this.stash.splice(stashIndex, 1);
        }
      } else {
        const lootIndex = this.character.loot.findIndex(loot => loot === item);
        if (lootIndex !== -1) {
          this.character.loot.splice(lootIndex, 1);
        }
      }

      // If there's already an item equipped, move it to inventory
      const currentItem = this.character.equipment[slot];
      if (currentItem) {
        this.character.loot.push(currentItem);
      }

      // Equip the new item
      this.character.equipment[slot] = item;
      
      this.saveState();
    },
  },
});

function logger(message: string) {
  trace(`${LOGGING_PREFIX}${message}`);
}

/**
 * Generates a random string using the last segment of a UUID and replaces random characters with special symbols
 * @returns {string} Random string with potential special characters
 */
function generateRandomId(): string {
  const specialChars = '!@#$%^&*';
  const baseId = crypto.randomUUID().split('-')[4]; // Get the last segment instead of first
  const numReplacements = Math.floor(Math.random() * 5); // 0 to 4 replacements
  
  let result = baseId;
  for (let i = 0; i < numReplacements; i++) {
    // Pick a random index between 1 and length-2 to avoid first and last characters
    const randomIndex = Math.floor(Math.random() * (result.length - 2)) + 1;
    const randomSpecialChar = specialChars[Math.floor(Math.random() * specialChars.length)];
    result = result.substring(0, randomIndex) + randomSpecialChar + result.substring(randomIndex + 1);
  }
  
  return result;
}

function resolveMitigation(_character: ICharacter): IMitigation[]{
  const retval: IMitigation[] = [
    ...DEFAULT_MITIGATION,
  ];

  return retval;
}