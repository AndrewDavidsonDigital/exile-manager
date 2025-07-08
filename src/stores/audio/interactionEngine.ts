import { defineStore } from 'pinia'
import type { IAudioEngine } from '.';

const LOGGING_PREFIX = '🍃 Audio (Interaction) Engine:\t';
const AUDIO_DELTA = 0.05;

export const useInteractionEngine = defineStore('interactionAudioEngine', {
  state: () => {
    return { 
      domId: "-1",
      el: null,
      count: 0,
      status: 'off',
      volumeMultiplier: 0.5,
      volumeRaw: 0.3,
    } as IAudioEngine
  },

  actions: {
    init(domId: string): void {
      const el = document.getElementById(domId);
      if (el && el.tagName === "AUDIO"){
        this.domId = domId;
        this.el = el as HTMLAudioElement;
        this.volumeRaw = 1;
        this.el.volume = 0;
      }
    },
    setVolumeMulti (value: number): void{
      if (!this.el) return; 

      this.volumeMultiplier = value;
    },
    setVolume (value: number): void{
      if (!this.el) return; 

      this.volumeRaw = value;
      this.el.volume = value * this.volumeMultiplier;
    },

    play(): void{
      if (!this.el) return;
      logger('attempting play()');

      this.el.play();
    },
    pause(): void{
      if (!this.el) return;

      this.el.pause();
    },
    playPause(): void{
      if (!this.el) return;

      if (this.el.paused){
        this.play();
      }else {
        this.pause();
      }
    },
    restart(): void{
      if (!this.el) return;

      this.el.currentTime = 0;
      this.play();
    },
    setTrack(trackPath: string, play = false): void{
      if (!this.el) return;

      this.el.src = trackPath;
      if (play) {
        this.play();
      }
    },
    stop(): void{
      if (!this.el) return;

      this.fadeOut();
    },
    fadeOut(): void{
      logger(`FadeOut Called`);
      if (!this.el) return;

      if (this.el.volume > 0.1){
        setTimeout(() => {
          this._volumeDown();
          this.fadeOut();
          },
          50,
        )
      } else {
        this.el.volume = 0;
        this.el.pause();
      }
    },
    fadeIn(start = false): void{
      if (!this.el) return;
      logger(`FadeIn Called: ${this.el.volume.toFixed(4)}`);
      if (start){
        this.el.volume = 0;
        this.play();
      }

      // logger(`testing: ${this.el.volume} < ${this.volumeRaw * this.volumeMultiplier} (${this.volumeRaw} * ${this.volumeMultiplier})`);
      if (this.el.volume < (this.volumeRaw * this.volumeMultiplier)){
        setTimeout(() => {
          this._volumeUp();
          this.fadeIn();
          },
          100,
        )
      }
    },
    volumeRefresh(): void{
      if (!this.el) return;

      this.el.volume = this.volumeRaw * this.volumeMultiplier;
    },
    _volumeDown(): void{
      if (!this.el) return;

      this.el.volume = Math.max((this.el.volume - AUDIO_DELTA), 0);
    },
    _volumeUp(): void{
      if (!this.el) return;

      this.el.volume = Math.min((this.el.volume + AUDIO_DELTA), (this.volumeRaw * this.volumeMultiplier));
    }
  },
})


function logger(message: string): void{
  console.log(`${Date.now()} ${LOGGING_PREFIX}${message}`);
}