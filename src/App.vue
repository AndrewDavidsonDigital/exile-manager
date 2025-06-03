<script setup lang="ts">
  import { RouterView, useRoute } from 'vue-router'
  import AudioEngine from './AudioEngine.vue';
  import NavigationElement from './components/NavigationElement.vue';
  import { useBgmEngine } from './stores/audio';
  import { onMounted, onUnmounted, provide, ref } from 'vue';
  import { trace } from './lib/logging';

  const currentRoute = useRoute();

  import bgmTrack from '@/assets/audio/bgm_track.mp3';
  import GameBanner from './components/GameBanner.vue';
  import FooterElement from './components/FooterElement.vue';

  const LOGGING_PREFIX = '🎮 INIT:';
  const bgmEngine = useBgmEngine();
  

  const DEBOUNCE_INTERVAL = 500;
  const debounceLast = ref<number>(Date.now());
  const ctrlPressed = ref(false);
  provide(/* key */ 'ctrlPressed', /* value */ ctrlPressed);
  

  function keyDownCallback(e: KeyboardEvent){
    if (Date.now() - DEBOUNCE_INTERVAL > debounceLast.value){
      if(e.ctrlKey){
        // console.log(Date.now(), '____', e);
        ctrlPressed.value = true;
        debounceLast.value = Date.now();
      }
    }
  }
  function keyUpCallback(e: KeyboardEvent){
    if(e.key === 'Control'){
      // console.log(`RUNNNN`,  Date.now(), '____', e);
      ctrlPressed.value = false;
    }
  }

  onUnmounted(() =>{
    document.removeEventListener('keydown', keyDownCallback);
    document.removeEventListener('keyup', keyUpCallback);
  });

  onMounted(() => {
    document.addEventListener('keydown', keyDownCallback);
    document.addEventListener('keyup', keyUpCallback);
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
