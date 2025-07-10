import { pluckKeys } from '@/lib/array';
import { _cloneDeep } from '@/lib/object';
import { useConfig } from '@/lib/storage';
import { defineStore } from 'pinia'

const CONFIG_KEYS = Object.freeze([
  'audio',
  'ui'
]);

export interface IConfiguration {
  audio: IAudioConfiguration;
  ui: IUiConfig;
  isOpen: boolean;
}

export interface ITextConfiguration {
  displayRatio: number,
  autoWaitRatio: number,
}

export interface IAudioConfiguration {
  master: number,
  bgm: number,
  sfx: number,
}

export interface IUiConfig {
  healthManaBars: boolean;
}

const DEFAULT_STATE: IConfiguration = Object.freeze({
  audio: {
    master: 0.5,
    bgm: 0.5,
    sfx: 0.7,
  },
  ui:{
    healthManaBars: false,
  },
  isOpen: false,
});

export const useConfigurationStore = defineStore('configuration', {
  state: () => {
    const configState = useConfig();
    const savedState = configState.get();

    // Initialize state from storage if it exists
    if (savedState) {
      return savedState as IConfiguration;
    }

    return _cloneDeep(DEFAULT_STATE) as IConfiguration;
  },

  getters: {
    getConfigurables(): Partial<IConfiguration>{
      return pluckKeys({...this}, CONFIG_KEYS) as Partial<IConfiguration>;
    },
  },

  actions: {
    init(): void {
      const existingSettings = useConfig().get() || null;
      if (existingSettings){
        const settings = JSON.parse(existingSettings);
        // find a better way to merge this in
        CONFIG_KEYS.forEach((key) => {
          // console.log('setting key: ', key, ' with value: ', settings[key]);
          this[key as keyof IConfiguration] = settings[key];
        });
      }
      this.saveState();
    },
    /**
     * Saves the current game state to storage
     */
    saveState(): void {
      useConfig().$set(this.$state);
    },
    save(): void {
      const localInstance = pluckKeys({...this}, CONFIG_KEYS);      
      useConfig().set(JSON.stringify(localInstance));
      this.saveState();
    },
    updateAudio(subKey: keyof typeof this.audio, value: number): void{
      this.audio[subKey] = value;
      this.saveState();
    },
  },
})
