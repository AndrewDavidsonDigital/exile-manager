import { trace } from '@/lib/logging';
import { defineStore } from 'pinia';
import { _cloneDeep } from '@/lib/object';
import { useWorldState } from '@/lib/storage';
import { WorldUnlockable } from '@/lib/core';

const LOGGING_PREFIX = '🗺️ World Engine:\t';

function getDefaultState():IWorldState{
  const retval: IWorldState = {
    unlocked: new Map([
      [WorldUnlockable.TOWN, false],
    ]),
  };
  return retval;
}

interface IWorldState {
  unlocked: Map<WorldUnlockable,boolean>;
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
      return this.unlocked.get(WorldUnlockable.TOWN) || false;
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
      this.unlocked.set(WorldUnlockable.TOWN, false);
      this.saveState();
    },
    init() {
      logger(`Initializing with world state`);
      this.unlocked.set(WorldUnlockable.TOWN, false);
      this.saveState();
    },
    unlockTown() {
      logger(`Initializing with world state`);
      this.unlocked.set(WorldUnlockable.TOWN, true);
      this.saveState();
    },
  },

});

function logger(message: string) {
  trace(`${LOGGING_PREFIX}${message}`);
}
