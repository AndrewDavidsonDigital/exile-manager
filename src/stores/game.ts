import { defineStore } from 'pinia'

const LOGGING_PREFIX = '🎮 Game Engine:\t';

export const useBgmEngine = defineStore('bgmAudioEngine', {
  state: () => {
    return { 
      domId: "-1",
      el: null,
      count: 0,
      status: 'off',
      volumeMultiplier: 0.7,
      volumeRaw: 1,
    } as IAudioEngine
  },

  actions: {
    init(domId: string) {
      const el = document.getElementById(domId);
      if (el && el.tagName === "AUDIO"){
        this.domId = domId;
        this.el = el as HTMLAudioElement;
        this.volumeRaw = 1;
        this.el.volume = 0;
      }
    },
    setVolumeMulti (value: number){
      if (!this.el) return; 

      this.volumeMultiplier = value;
    },
  },
})


function logger(message: string){
  console.log(`${Date.now()} ${LOGGING_PREFIX}${message}`);
}