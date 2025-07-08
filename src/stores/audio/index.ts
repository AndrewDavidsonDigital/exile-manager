import { useBgmEngine } from "./bgmEngine";
import {useInteractionEngine } from "./interactionEngine";

export {
  useBgmEngine,
  useInteractionEngine,
};

export type AudioState = 'off' | 'paused' | 'play';
export interface IAudioEngine {
  domId: string,
  el: HTMLAudioElement | null,
  count: number,
  status: AudioState,
  volumeMultiplier: number;
  volumeRaw: number;
}
