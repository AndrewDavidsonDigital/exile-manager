<script setup lang="ts">
  import { RouterView, useRoute } from 'vue-router'
  import AudioEngine from './AudioEngine.vue';
  import NavigationElement from './components/NavigationElement.vue';
  import { useBgmEngine } from './stores/audio';
  import { onMounted } from 'vue';
  import { trace } from './lib/logging';

  const currentRoute = useRoute();

  import bgmTrack from '@/assets/audio/bgm_track.mp3';
  import GameBanner from './components/GameBanner.vue';
  import FooterElement from './components/FooterElement.vue';

  const LOGGING_PREFIX = '🎮 INIT:';
  const bgmEngine = useBgmEngine();

  onMounted(() => {
    setTimeout(() => {
      trace(`${LOGGING_PREFIX} starting BGM`);
      bgmEngine.setTrack(bgmTrack);
      bgmEngine.fadeIn(true);
    }, 
    100
    )
  });

</script>

<template>
  <AudioEngine />
  <main class="bg-slate-800 text-green-500 min-h-screen min-w-full max-w-content flex flex-col">
    <GameBanner v-if="currentRoute.name !== 'home'" />
    <NavigationElement />
    <RouterView />
    <FooterElement />
  </main>
</template>
