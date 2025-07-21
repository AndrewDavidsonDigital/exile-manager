<script setup lang="ts">
  import { RouterView, useRoute } from 'vue-router'
  import AudioEngine from './core/AudioEngine.vue';
  import NavigationElement from './components/elements/NavigationElement.vue';
  import { useBgmEngine, useInteractionEngine } from './stores/audio';
  import { computed, onMounted, onUnmounted, provide, ref, watch } from 'vue';
  import { trace } from './lib/logging';
  import { useConfigurationStore } from './stores/configuration';
  import GameBanner from './components/GameBanner.vue';
  import FooterElement from './components/FooterElement.vue';
  import { SCROLL_ROOT_ID, toggleScrollLock } from './lib/ui';
  import OptionSettings from './components/OptionSettings.vue';
  import StateSync from './core/StateSync.vue';
  import { AudioKey, EVENT_AUDIO_KEY, type EventWithAudio } from './lib/core';
  import { chooseRandom } from './lib/array';
  
  import bgmTrack from '/audio/bgm_track.m4a';

  import clickTrack from '/audio/sfx/click.m4a';
  import brushTrack from '/audio/sfx/brush.m4a';
  import swooshDownTrack from '/audio/sfx/swoosh_down.m4a';
  import swooshUpTrack from '/audio/sfx/swoosh_up.m4a';

  import goldTrack1 from '/audio/sfx/gold_1.m4a';
  import goldTrack2 from '/audio/sfx/gold_2.m4a';

  import scrollTrack1 from '/audio/sfx/scroll_1.m4a';
  import scrollTrack2 from '/audio/sfx/scroll_2.m4a';
  import scrollTrack3 from '/audio/sfx/scroll_3.m4a';
  
  import smithTrack1 from '/audio/sfx/smith_1.m4a';
  import smithTrack2 from '/audio/sfx/smith_2.m4a';
  import smithTrack3 from '/audio/sfx/smith_3.m4a';

  import armourTrack1 from '/audio/sfx/armour_1.m4a';
  import armourTrack2 from '/audio/sfx/armour_2.m4a';
  import armourTrack3 from '/audio/sfx/armour_3.m4a';
  import armourTrack4 from '/audio/sfx/armour_4.m4a';
  import armourTrack5 from '/audio/sfx/armour_5.m4a';

  import jewelleryTrack1 from '/audio/sfx/jewellery_1.m4a';
  import jewelleryTrack2 from '/audio/sfx/jewellery_2.m4a';
  import jewelleryTrack3 from '/audio/sfx/jewellery_3.m4a';
  import jewelleryTrack4 from '/audio/sfx/jewellery_4.m4a';
  import jewelleryTrack5 from '/audio/sfx/jewellery_5.m4a';
  import jewelleryTrack6 from '/audio/sfx/jewellery_6.m4a';

  import OnboardingEngine from './core/OnboardingEngine.vue';
  import { useGameEngine } from './stores/game';
  import { ErrorNumber } from './lib/typescript';

  const configuration = useConfigurationStore();
  const currentRoute = useRoute();

  const LOGGING_PREFIX = '🎮 INIT:';
  const bgmEngine = useBgmEngine();
  const interactionEngine = useInteractionEngine();
  const gameEngine = useGameEngine();

  const goldTracks = [
    goldTrack1,
    goldTrack2,
  ];
  const scrollTracks = [
    scrollTrack1,
    scrollTrack2,
    scrollTrack3,
  ];
  const smithTracks = [
    smithTrack1,
    smithTrack2,
    smithTrack3,
  ];
  const armourTracks = [
    armourTrack1,
    armourTrack2,
    armourTrack3,
    armourTrack4,
    armourTrack5,
  ];
  const jewelleryTracks = [
    jewelleryTrack1,
    jewelleryTrack2,
    jewelleryTrack3,
    jewelleryTrack4,
    jewelleryTrack5,
    jewelleryTrack6,
  ];
  

  const DEBOUNCE_INTERVAL = 500;
  const debounceLast = ref<number>(Date.now());

  const MIN_SFX_INTERVAL = 300;
  const lastSfx = ref<number>(Date.now());

  const ctrlPressed = ref(false);
  provide(/* key */ 'ctrlPressed', /* value */ ctrlPressed);
  

  function keyDownCallback(e: KeyboardEvent): void{
    if (Date.now() - DEBOUNCE_INTERVAL > debounceLast.value){
      if(e.ctrlKey){
        // console.log(Date.now(), '____', e);
        ctrlPressed.value = true;
        debounceLast.value = Date.now();
      }
    }
  }
  function keyUpCallback(e: KeyboardEvent): void{
    if(e.key === 'Control'){
      // console.log(`RUNNNN`,  Date.now(), '____', e);
      ctrlPressed.value = false;
    }
  }
  function clickCallback(_e: MouseEvent): void{
    // console.log(` Click: `, _e);
    if ((lastSfx.value + MIN_SFX_INTERVAL) < Date.now()){
      if (Object.keys(_e).includes(EVENT_AUDIO_KEY)){
        const e = _e as EventWithAudio;
        const key = e[EVENT_AUDIO_KEY];
        switch (key) {
          case AudioKey.GOLD:
            interactionEngine.setTrack(chooseRandom(goldTracks, goldTrack1), true);
            break;

          case AudioKey.SCROLL:
            interactionEngine.setTrack(chooseRandom(scrollTracks, scrollTrack1), true);
            break;

          case AudioKey.BRUSH:
            interactionEngine.setTrack(brushTrack, true);
            break;

          case AudioKey.RESET:
            interactionEngine.setTrack(clickTrack, true);
            break;

          case AudioKey.LOCK:
            interactionEngine.setTrack(clickTrack, true);
            break;

          case AudioKey.SWOOSH_UP:
            interactionEngine.setTrack(swooshUpTrack, true);
            break;

          case AudioKey.SWOOSH_DOWN:
            interactionEngine.setTrack(swooshDownTrack, true);
            break;

          case AudioKey.ARMOUR:
            interactionEngine.setTrack(chooseRandom(armourTracks, armourTrack1), true);
            break;

          case AudioKey.JEWELLERY:
            interactionEngine.setTrack(chooseRandom(jewelleryTracks, jewelleryTrack1), true);
            break;

          case AudioKey.SMITH:
            interactionEngine.setTrack(chooseRandom(smithTracks, smithTrack1), true);
            break;

          case AudioKey.DEFAULT:
          default:
            interactionEngine.setTrack(clickTrack, true);
            break;
        }
      } else {
        interactionEngine.setTrack(clickTrack, true);
      }
      lastSfx.value = Date.now();
    }
  }

  onUnmounted(() =>{
    document.removeEventListener('click', (_e: MouseEvent) => clickCallback(_e));

    document.removeEventListener('keydown', keyDownCallback);
    document.removeEventListener('keyup', keyUpCallback);
  });


  onMounted(() => {

    document.addEventListener('click', (_e: MouseEvent) => clickCallback(_e));

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
    const scrollRoot = document.getElementById(SCROLL_ROOT_ID)
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
  <OnboardingEngine v-if="currentRoute.name === 'Game' && gameEngine.getCharacter !== ErrorNumber.NOT_FOUND && configuration.showTutorial" />
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
