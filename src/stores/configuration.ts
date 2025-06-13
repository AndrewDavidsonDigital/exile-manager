import { pluckKeys } from '@/lib/array';
import { _cloneDeep } from '@/lib/object';
import { useConfig } from '@/lib/storage';
import { defineStore } from 'pinia'

export const labelMap_EN = new Map<string, string>();
labelMap_EN.set('master', 'Master');
labelMap_EN.set('audio', 'Audio');
labelMap_EN.set('bgm'  , 'Music');
labelMap_EN.set('sfx'  , 'Effects');
labelMap_EN.set('voice', 'Voices');
labelMap_EN.set('text', 'Text');
labelMap_EN.set('displayRatio', 'Text Display Speed');
labelMap_EN.set('autoWaitRatio', 'Auto Wait Duration');
labelMap_EN.set('cursor', 'Cursor');
labelMap_EN.set('scale', 'Scale');
labelMap_EN.set('type', 'Type');

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
    return _cloneDeep(DEFAULT_STATE) as IConfiguration;
  },

  getters: {
    getConfigurables(): Partial<IConfiguration>{
      return pluckKeys({...this}, CONFIG_KEYS) as Partial<IConfiguration>;
    },
  },

  actions: {
    init() {
      const existingSettings = useConfig().get() || null;
      if (existingSettings){
        const settings = JSON.parse(existingSettings);
        // find a better way to merge this in
        CONFIG_KEYS.forEach((key) => {
          // console.log('setting key: ', key, ' with value: ', settings[key]);
          this[key as keyof IConfiguration] = settings[key];
        });
      }
    },
    save() {
      const localInstance = pluckKeys({...this}, CONFIG_KEYS);      
      useConfig().set(JSON.stringify(localInstance));
    },
    updateAudio(subKey: keyof typeof this.audio, value: number){
      this.audio[subKey] = value;
    },
  },
})
