
<script setup lang="ts">
  import { onMounted } from 'vue';
  import { useBgmEngine } from '&audio'
  import { useConfiguration } from './stores/configuration';


  const bgmEngine = useBgmEngine();
  const config = useConfiguration();

  onMounted(() => {
    // need small delay to ensure config has been loaded & init'd 
    // by the time we grab audio levels
    setTimeout(() => {
      console.log(`config:`, config.audio)

      bgmEngine.init('_audio_bgm');
      bgmEngine.setVolume(config.audio.bgm * config.audio.master);

    }, 100);
  });

</script>

<template>
  <audio
    id="_audio_bgm"
    class="pointer-events-none"
    playsinline
    autoplay
    loop
  ></audio>
<!--
  <audio id="_audio_sfx" class="pointer-events-none" playsinline autoplay></audio>
  <audio id="_audio_interaction" class="pointer-events-none" playsinline autoplay></audio>
  <audio id="_audio_voice" class="pointer-events-none" playsinline autoplay></audio>
-->
</template>
