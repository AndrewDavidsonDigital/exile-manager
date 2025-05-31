<script setup lang="ts">
  import { RouterView } from 'vue-router'
  import AudioEngine from './AudioEngine.vue';
  import Navigation from './components/Navigation.vue';
  import { useBgmEngine } from './stores/audio';
  import { onMounted } from 'vue';
  import { trace } from './lib/logging';

  import bgmTrack from '@/assets/audio/bgm_track.mp3';

  const LOGGING_PREFIX = '🎮';
  const bgmEngine = useBgmEngine();

  onMounted(() => {
    setTimeout(() => {
      trace(`${LOGGING_PREFIX}: starting BGM`);
      bgmEngine.setTrack(bgmTrack);
      bgmEngine.fadeIn(true);
    }, 
    100
    )
  });

</script>

<template>
  <AudioEngine />
  <main class="bg-slate-800 text-green-500 min-h-screen min-w-full">
    <Navigation />
    <RouterView />
  </main>
</template>
