import { trace } from '@/lib/logging';
import { defineStore } from 'pinia';
import type { 
  DifficultyType, 
  IDifficulty, 
  ICharacter, 
  ICharacterStats,
  ILoot,
  ItemTierType,
  ICombatStat,
  IMitigation,
  ItemType
} from '@/lib/game';
import { 
  DEFAULT_MITIGATION,
  DIFFICULTY_SETTINGS, 
  generateClassStats,
  ITEM_TIER_COSTS,
  generateAffixesForTier
} from '@/lib/game';
import { useGameState } from '@/lib/storage';
import { AffixType, allAffixes as affixDefinitions } from '@/lib/affixTypes';
import { _cloneDeep } from '@/lib/object';
import { calculateDodgeChance, getAffixValue, getAffixValueRange, resolveAverageOfRange } from '@/lib/affixUtils';
import { allItemTypes, slotMap } from '@/lib/itemUtils';

const LOGGING_PREFIX = '🎮 Game Engine:\t';
const VERSION_NUMBER = '0.0.5';

const DEFAULT_STATE = <Readonly<IGameEngine>> {
  version: VERSION_NUMBER,
  runs: 0,
  difficulty: 'Easy',
  character: undefined,
  isDead: false,
}

interface IGameEngine {
  version: string;
  runs: number;
  character: ICharacter | undefined;
  difficulty: DifficultyType;
  isDead: boolean;
  stash?: ILoot[];
}

export const useGameEngine = defineStore('gameEngine', {
  state: () => {
    const gameState = useGameState();
    const savedState = gameState.get();
    
    // Initialize state from storage if it exists
    if (savedState) {
      if (! savedState.version){
        savedState.version = '0.0.0';
      }
      return savedState as IGameEngine;
    }
    
    return { 
      ...DEFAULT_STATE,
      stash: [],
    } as IGameEngine
  },

  getters: {
    isVersionSaveOutOfDate(): boolean{
      logger('Checking version')
      return this.version !== VERSION_NUMBER;
    },
    getVersions(): {save: string;game:string}{
      logger('Resolving version')
      return {
        'save' : this.version,
        'game' : VERSION_NUMBER,
      };
    },
    /**
     * Retrieves the current difficulty settings including multipliers
     * @returns {IDifficulty | -1} The current difficulty settings or -1 if not found
     */
    getDifficulty(): IDifficulty | -1 {
      logger('Resolving difficulty')
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
        health: this.character.stats.currentHealth,
        mana: this.character.stats.currentMana,
        maxHealth: this.character.stats.health,
        maxMana: this.character.stats.mana,
        mitigation: resolveMitigation(this.character),
        attributes: {
          fortitude: this.character.stats.fortitude,
          fortune: this.character.stats.fortune,
          wrath: this.character.stats.wrath,
          affinity: this.character.stats.affinity
        },
        accuracy: 100,
        baseDamagePerTick: 15,
        damagePerTick: 0,
        damage: {
          physical: 0,
          elemental: {
            fire: 0,
            cold: 0,
            lightning: 0
          },
          corruption: {
            void: 0,
            mental: 0
          }
        }
      };

      let localEvasion = 0;


      // Check all equipped items for bonuses
      Object.values(this.character.equipment).forEach(item => {
        if (!item?.itemDetails?.affixes) return;

        // Check all affix types (embedded, prefix, suffix)
        const itemAffixes = [
          ...item.itemDetails.affixes.embedded,
          ...item.itemDetails.affixes.prefix,
          ...item.itemDetails.affixes.suffix
        ];

        itemAffixes.forEach(affix => {
          // Look up the full affix definition to get the type
          const affixDef = affixDefinitions.find(a => a.id === affix.id);
          if (!affixDef) return;

          // Use switch statement for better readability and maintainability
          switch (affix.category) {
            case 'life':
              retval.health += getAffixValue(affix);
              retval.maxHealth += getAffixValue(affix);
              break;
            case 'mana':
              retval.mana += getAffixValue(affix);
              retval.maxMana += getAffixValue(affix);
              break;
            case 'attribute':
              // Check the affix tags to determine which attribute it affects
              if (affixDef.tags.includes('fortitude')) {
                retval.attributes.fortitude += getAffixValue(affix);
              } else if (affixDef.tags.includes('fortune')) {
                retval.attributes.fortune += getAffixValue(affix);
              } else if (affixDef.tags.includes('wrath')) {
                retval.attributes.wrath += getAffixValue(affix);
              } else if (affixDef.tags.includes('affinity')) {
                retval.attributes.affinity += getAffixValue(affix);
              }
              break;
            case 'physical':
              // Physical damage from prefix, Armour Value from EMBEDDED
              if (affixDef.type === AffixType.EMBEDDED) {
                // Handle Armor??? but how
                // const mitigation = retval.mitigation.find(m => m.key === 'physical');
                // if (mitigation) {
                //   mitigation.value += getAffixValue(affix);
                // }
              } else if (affixDef.type === AffixType.PREFIX) {
                retval.damage.physical += resolveAverageOfRange(getAffixValueRange(affix));
              }
              break;
            case 'defense':
              // Physical damage from prefix, phys resistance from suffix
              if (affixDef.type === AffixType.SUFFIX) {
                const mitigation = retval.mitigation.find(m => m.key === 'physical');
                if (mitigation) {
                  mitigation.value += getAffixValue(affix);
                }
              }
              break;
            case 'evasion':
              // evasion only on embeded
              if (affixDef.type === AffixType.EMBEDDED) {
                localEvasion += getAffixValue(affix);
              }
              break;
            case 'elemental':
              // Elemental damage from prefix/suffix, resistance from embedded
              if (affixDef.type === AffixType.EMBEDDED) {
                // Handle elemental resistances
                if (affixDef.tags.includes('elemental') && affixDef.tags.includes('resistance')){
                  const mitigationFire = retval.mitigation.find(m => m.key === 'elemental_fire');
                  if (mitigationFire) {
                    mitigationFire.value += getAffixValue(affix);
                  }
                  const mitigationCold = retval.mitigation.find(m => m.key === 'elemental_cold');
                  if (mitigationCold) {
                    mitigationCold.value += getAffixValue(affix);
                  }
                  const mitigationLightning = retval.mitigation.find(m => m.key === 'elemental_lightning');
                  if (mitigationLightning) {
                    mitigationLightning.value += getAffixValue(affix);
                  }

                } else if (affixDef.tags.includes('fire')) {
                  const mitigation = retval.mitigation.find(m => m.key === 'elemental_fire');
                  if (mitigation) {
                    mitigation.value += getAffixValue(affix);
                  }
                } else if (affixDef.tags.includes('cold')) {
                  const mitigation = retval.mitigation.find(m => m.key === 'elemental_cold');
                  if (mitigation) {
                    mitigation.value += getAffixValue(affix);
                  }
                } else if (affixDef.tags.includes('lightning')) {
                  const mitigation = retval.mitigation.find(m => m.key === 'elemental_lightning');
                  if (mitigation) {
                    mitigation.value += getAffixValue(affix);
                  }
                }
              } else {
                // Handle elemental damage
                if (affixDef.tags.includes('fire')) {
                  retval.damage.elemental.fire += resolveAverageOfRange(getAffixValueRange(affix));
                } else if (affixDef.tags.includes('cold')) {
                  retval.damage.elemental.cold += resolveAverageOfRange(getAffixValueRange(affix));
                } else if (affixDef.tags.includes('lightning')) {
                  retval.damage.elemental.lightning  += resolveAverageOfRange(getAffixValueRange(affix));
                }
              }
              break;
            case 'corruption':
              if (affixDef.tags.includes('void')) {
                retval.damage.corruption.void += resolveAverageOfRange(getAffixValueRange(affix));
              } else if (affixDef.tags.includes('mental')) {
                retval.damage.corruption.mental += resolveAverageOfRange(getAffixValueRange(affix));
              }
              break;
          }
        });
      });


      // Base damage from wrath
      retval.damage.physical += Math.floor(retval.attributes.wrath / 2);
      
      retval.damagePerTick = 
        retval.baseDamagePerTick + 
        retval.damage.physical + 
        retval.damage.elemental.fire + 
        retval.damage.elemental.cold + 
        retval.damage.elemental.lightning + 
        retval.damage.corruption.void + 
        retval.damage.corruption.mental;


      const mitigationEvasion = retval.mitigation.find(m => m.key === 'evasion');
      if (mitigationEvasion) {
        mitigationEvasion.value = calculateDodgeChance(localEvasion, this.character.level);
      }

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
        const type: ItemType = (allItemTypes)[Math.floor(Math.random() * allItemTypes.length)];

        const id = generateRandomId(); // Temporary name until identified;
        const newLoot: ILoot = {
          name: id,
          _identifier: id,
          type: type, // Set the type here
          identified: false,
          _hidden: {
            isCursed: Math.random() < 0.05, // 5% chance to be cursed
            isCorrupted: Math.random() < 0.02, // 2% chance to be corrupted
            isVoidTouched: Math.random() < 0.01, // 1% chance to be voidTouched
          },
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
     * Internal helper method to handle item identification logic
     * @param {ILoot} loot - The item to identify
     * @returns {boolean} Whether identification was successful
     */
    _identifyItem(loot: ILoot): boolean {
      if (loot.identified) return false;

      // Calculate identification cost based on tier
      const tier = loot.itemDetails?.tier || 'basic';
      const totalCost = ITEM_TIER_COSTS[tier];

      // Check if character has enough gold
      if (!this.character || this.character.gold < totalCost) {
        logger(`Not enough gold to identify item. Cost: ${totalCost}, Available: ${this.character?.gold || 0}`);
        return false;
      }

      // Deduct the cost
      this.character.gold -= totalCost;

      // The type is already set when the loot was created
      const type = loot.type;
      
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
      
      return true;
    },

    identifyLoot(lootIndex: number) {
      if (!this.character || !this.character.loot[lootIndex]) return;
      logger(`Identifying loot[${lootIndex}]`);
      
      if (this._identifyItem(this.character.loot[lootIndex])) {
        this.saveState();
      }
    },

    identifyStashItem(stashIndex: number) {
      if (!this.stash || !this.stash[stashIndex]) return;
      logger(`Identifying stash item at index ${stashIndex}`);
      
      if (this._identifyItem(this.stash[stashIndex])) {
        this.saveState();
      }
    },

    /**
     * Moves an item from inventory to stash
     * @param {number} lootIndex - Index of the item in inventory
     */
    stashItem(lootIndex: number) {
      if (!this.stash || !this.character || !this.character.loot[lootIndex]) return;
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
      if (!this.stash || !this.character || !this.stash[stashIndex]) return;
      logger(`Unstashing item at index ${stashIndex}`);
      
      const item = this.stash[stashIndex];
      this.character.loot.push(item);
      this.stash.splice(stashIndex, 1);
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
      if (!this.character || !item.itemDetails || (!this.stash && fromStash)) return;
      logger(`Equipping item: ${item.name}${fromStash ? ' from stash' : ''}`);
      
      // Use the item's explicit type field
      const itemType = item.type;


      let slot = slotMap[itemType];
      
      // Special handling for rings
      if (itemType === 'Ring') {
        // If left hand is empty, use it
        if (!this.character.equipment.leftHand) {
          slot = 'leftHand';
        }
        // If right hand is empty, use it
        else if (!this.character.equipment.rightHand) {
          slot = 'rightHand';
        }
        // If both hands have rings, replace the left hand ring
        else {
          slot = 'leftHand';
        }
      }

      if (!slot) {
        logger(`Cannot equip item of type ${item.type}. No corresponding equipment slot found.`);
        return;
      }

      // Remove item from source
      if (this.stash && fromStash) {
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
    migrateSave(){
      logger('Running: migrateSave');
      logger('Ensure we are only running this on a miss-match');
      if (!this.isVersionSaveOutOfDate){
        return;
      }

      const currentState:IGameEngine = _cloneDeep(this.$state);
      logger(`Save-state: ${JSON.stringify(currentState)}`);

      const mutableNewState:IGameEngine = _cloneDeep(DEFAULT_STATE);
      logger(`Base-new-state: ${JSON.stringify(mutableNewState)}`);

      mutableNewState.runs = currentState.runs;
      mutableNewState.character = currentState.character;
      mutableNewState.stash = currentState.stash;
      mutableNewState.difficulty = currentState.difficulty;
      mutableNewState.isDead = currentState.isDead;

      logger(`merged-new-state: ${JSON.stringify(mutableNewState)}`);
     
      useGameState().clear();

      // iterate over all our merged 
      Object.entries(mutableNewState).forEach(([key, value]) => {
        if (Object.keys(this).includes(key)){
          (this as any)[key] = value;
        }
      });

      useGameState().$set(this.$state);

    }
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
  let baseId = '';
  try {
    baseId = crypto.randomUUID().split('-')[4]; // Get the last segment instead of first
  }
  catch {
    logger(`falling back to alternative ID generation as we dont have access to crypto`);
    baseId = generateFallbackId();
  }
  
  const specialChars = '!@#$%^&*';
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

/**
 * Generates a fallback unique ID when crypto.randomUUID() is not available
 * Uses timestamp, random numbers, and Math.random() to create a unique string
 * @returns {string} A unique string ID
 */
function generateFallbackId(): string {
  const randomStr = Math.random().toString(36).substring(2, 8); // Get 6 random chars
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(6, '0'); // 6 digit random number
  
  // Combine and shuffle the segments
  const combined = randomStr + randomNum;
  const shuffled = combined.split('')
    .sort(() => Math.random() - 0.5)
    .join('');
  
  return shuffled;
}

function resolveMitigation(_character: ICharacter): IMitigation[]{
  const retval: IMitigation[] = _cloneDeep(DEFAULT_MITIGATION);

  return retval;
}