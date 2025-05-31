<!-- eslint-disable prettier/prettier -->
<script setup lang="ts">
  import { useBgmEngine } from '@/stores/audio';
import { ref } from 'vue';
import { IconPlay, IconPause } from './icons';
  
  const bgmEngine = useBgmEngine();
  const isPaused = ref<boolean>(false);
  const playingFile = ref('');

  // bgmEngine.el?.src.split('/')[] || ''
  bgmEngine.$onAction((el)=> {
    const startTime = Date.now()
    console.log(`NAV $onAction: \t[${el.name}]` );
    el.onError((error) => {
      console.warn(
        `Failed "${el.name}" after ${Date.now() - startTime}ms.\nError: ${error}.`
      )
    })

    if (el.name === 'pause'){
      el.after((_result) => {
        console.log('pause-triggered');
        isPaused.value = true;
      })
    }

    else if (el.name === 'play'){
      el.after((_result) => {
        isPaused.value = false;
        const src = bgmEngine.el?.src.split('/') || [''];
        playingFile.value =  src[src.length -1 ];
      })
    }
    
    // else { console.trace(`NAV OTHER CALL: \t${el.name}` );}
  });

</script>

<template>
  <section class="flex items-center gap-2 text-emerald-500">
    <button
      class="inline-flex"
      @click="bgmEngine.playPause()"
    >
      <div class="grid-area-stack">
        <IconPlay
          class="size-6 transition-opacity duration-300"
          :class="{ 'opacity-0': isPaused }"
        />
        <IconPause
          class="size-6 transition-opacity duration-300"
          :class="{ 'opacity-0': !isPaused }"
        />
      </div>
      <span class="text-sm">{{ isPaused ? 'Paused' : `Playing: ${playingFile}` }}</span>
    </button>
    <label for="audio_range">
    </label>
    <input 
      id="audio_range"
      v-model="bgmEngine.volumeRaw"
      type="range"
      class="max-w-[6rem] thin-slider"
      :min="0"
      :max="1"
      :step="0.05"
      @input="() => bgmEngine.volumeRefresh()"
    />
  </section>
</template>

<style scoped>
</style>
