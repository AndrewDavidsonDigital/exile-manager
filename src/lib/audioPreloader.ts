import { audioFiles } from '@/assets/audio/audioManifest';

let preloaded = false;

export function preloadAudioFiles() {
  if (preloaded) return;
  preloaded = true;
  audioFiles.forEach(src => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.src = src;
    audio.load();
  });
}
