<script setup lang="ts">
  import { RouterView, useRoute } from 'vue-router'
  import AudioEngine from './core/AudioEngine.vue';
  import NavigationElement from './components/elements/NavigationElement.vue';
  import { useBgmEngine } from './stores/audio';
  import { computed, onMounted, onUnmounted, provide, ref, watch } from 'vue';
  import { trace } from './lib/logging';
  import { useConfigurationStore } from './stores/configuration';
  import bgmTrack from '@/assets/audio/bgm_track.mp3';
  import GameBanner from './components/GameBanner.vue';
  import FooterElement from './components/FooterElement.vue';
  import { toggleScrollLock } from './lib/ui';
  import OptionSettings from './components/OptionSettings.vue';
import StateSync from './core/StateSync.vue';

  const configuration = useConfigurationStore();
  const currentRoute = useRoute();

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

  const showOptionsPanel = computed(() => configuration.isOpen);

  watch(showOptionsPanel, (newValue) => {
    const scrollRoot = document.getElementById('scrollRoot')
    if(newValue){
      scrollRoot ? toggleScrollLock(true, scrollRoot ) : null;
      console.warn('OPEN OPTIONS');
    }else{
      scrollRoot ? toggleScrollLock(false, scrollRoot ) : null;
      console.warn('CLOSE SETTINGS');
    }
  });

</script>

<template>
  <AudioEngine />
  <StateSync />
  <main class="bg-slate-800 text-green-500 min-h-screen min-w-full max-w-content flex flex-col">
    <GameBanner v-if="currentRoute.name !== 'home'" />
    <NavigationElement />
    <RouterView />
    <FooterElement />
  </main>
  <aside
    class="
      duration-500 transition-all translate-x-full 
      w-screen h-screen 
      fixed top-0 right-0 
      z-nav 
      
      bg-gradient-to-r from-transparent via-5% via-black/50 to-black/50
      
      flex justify-end
    "
    :class="[
      { '!translate-x-0' : showOptionsPanel }
    ]"
  >
    <div
      class="my-6 p-6 h-[calc(100dvh_-_3rem)] w-[calc(100%_-_2rem)] md:w-1/2 rounded-l-lg  bg-slate-700 text-emerald-500 border-2 border-emerald-800"
    >
      <OptionSettings />
    </div>
  </aside>
</template>
