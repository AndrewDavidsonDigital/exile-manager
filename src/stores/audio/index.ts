import { useBgmEngine } from "./bgmEngine";

export {
  useBgmEngine,
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
