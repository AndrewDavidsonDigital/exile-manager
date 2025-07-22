import audioFiles from '@/assets/audio/audioManifest.json';

let preloaded = false;

export function preloadAudioFiles() {
  if (preloaded) return;
  preloaded = true;
  audioFiles.manifest.forEach(src => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.src = src;
    audio.load();
  });
}
