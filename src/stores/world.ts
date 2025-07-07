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
    }
  };
  return retval;
}

type WorldUnlocks = {
  [key in WorldUnlockable]: boolean;
};
type TownUnlocks = {
  [key in TownUnlockable]: boolean;
};

interface IWorldState {
  unlocked: WorldUnlocks;
  townUnlocks: TownUnlocks;
  knownTownUnlocks: TownUnlocks;
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
    saveState() {
      logger('Saving world state');
      useWorldState().$set(this.$state);
    },
    restart(){
      logger('Restarting world state');
      this.unlocked[WorldUnlockable.TOWN] = false;
      this.saveState();
    },
    init() {
      logger(`Initializing with world state`);
      this.unlocked[WorldUnlockable.TOWN] = false;
      this.saveState();
    },
    unlockTown() {
      logger(`Unlock the World-Feature Town`);
      this.unlocked[WorldUnlockable.TOWN] = true;
      this.saveState();
    },
    unlockTownFeature(townUnlock: TownUnlockable) {
      logger(`Unlock the Town-Feature ${townUnlock}`);
      this.townUnlocks[townUnlock] = true;
      this.saveState();
    },
    knowAboutTownFeature(townUnlock: TownUnlockable) {
      logger(`Know about the Town ${townUnlock}`);
      this.knownTownUnlocks[townUnlock] = true;
      this.saveState();
    },
    isTownFeatureKnown(townUnlock: TownUnlockable){
      return this.knownTownUnlocks[townUnlock] || false;
    },
    isTownFeatureUnlocked(townUnlock: TownUnlockable){
      return this.townUnlocks[townUnlock] || false;
    }
  },

});

function logger(message: string) {
  trace(`${LOGGING_PREFIX}${message}`);
}
