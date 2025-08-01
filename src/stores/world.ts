import { trace } from '@/lib/logging';
import { defineStore } from 'pinia';
import { _cloneDeep } from '@/lib/object';
import { useWorldState } from '@/lib/storage';
import { TownUnlockable, WorldUnlockable } from '@/lib/core';

const LOGGING_PREFIX = '🗺️ World Engine:\t';

function getDefaultState():IWorldState{
  const retval: IWorldState = {
    unlocked: {
      [WorldUnlockable.TOWN]: false,
    },
    townUnlocks: {
      [TownUnlockable.SMITH]: false,
      [TownUnlockable.ARCANUM]: false,
    },
    knownTownUnlocks: {
      [TownUnlockable.SMITH]: false,
      [TownUnlockable.ARCANUM]: false,
    },
    townConfigurations: {
      [TownUnlockable.SMITH]: [
        {
          key: 'autoSalvage',
          name: 'Auto Salvage',
          state: false,
        },
        {
          key: 'bulkSalvage',
          name: 'Bulk Salvage',
          state: false,
        }],
      [TownUnlockable.ARCANUM]: [
        {
          key: 'bulkIdentify',
          name: 'Bulk Identify',
          state: false,
        }
      ],
    },
  };
  return retval;
}

type WorldUnlocks = {
  [key in WorldUnlockable]: boolean;
};
type TownUnlocks = {
  [key in TownUnlockable]: boolean;
};
type TownConfig = {
  [key in TownUnlockable]: IUnlock[];
};

interface IUnlock {
  key: string;
  name: string;
  state: boolean;
}

interface IWorldState {
  unlocked: WorldUnlocks;
  townUnlocks: TownUnlocks;
  knownTownUnlocks: TownUnlocks;
  townConfigurations: TownConfig;
}

export const useWorldEngine = defineStore('world', {
  state: () => {
    const worldState = useWorldState();
    const savedState = worldState.get();
    
    // Initialize state from storage if it exists
    if (savedState) {
      return savedState as IWorldState;
    }
    
    return getDefaultState();
  },

  getters: {
    isTownUnlocked(): boolean{
      logger('Checking if town is unlocked')
      return this.unlocked[WorldUnlockable.TOWN] || false;
    },
  },

  actions: {
    /**
     * Saves the current world state to storage
     */
    saveState(_cascade = true): void{
      logger('Saving world state');
      useWorldState().$set(this.$state);
    },
    restart(): void{
      logger('Restarting world state');
      this.unlocked[WorldUnlockable.TOWN] = false;
      this.saveState();
    },
    init(): void{
      logger(`Initializing with world state`);
      this.unlocked[WorldUnlockable.TOWN] = false;
      this.saveState();
    },
    unlockTown(): void{
      logger(`Unlock the World-Feature Town`);
      this.unlocked[WorldUnlockable.TOWN] = true;
      this.saveState();
    },
    unlockTownFeature(townUnlock: TownUnlockable): void{
      logger(`Unlock the Town-Feature ${townUnlock}`);
      this.townUnlocks[townUnlock] = true;
      this.saveState();
    },
    knowAboutTownFeature(townUnlock: TownUnlockable): void{
      logger(`Know about the Town ${townUnlock}`);
      this.knownTownUnlocks[townUnlock] = true;
      this.saveState();
    },
    isTownFeatureKnown(townUnlock: TownUnlockable): boolean{
      return this.knownTownUnlocks[townUnlock] || false;
    },
    isTownFeatureUnlocked(townUnlock: TownUnlockable): boolean{
      return this.townUnlocks[townUnlock] || false;
    }
  },

});

function logger(message: string): void{
  trace(`${LOGGING_PREFIX}${message}`);
}
