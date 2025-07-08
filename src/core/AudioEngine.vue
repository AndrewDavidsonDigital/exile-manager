
<script setup lang="ts">
  import { computed, onMounted, watch } from 'vue';
  import { useBgmEngine } from '&audio'
  import { useConfigurationStore } from '../stores/configuration';

  const bgmEngine = useBgmEngine();
  const config = useConfigurationStore();

  const masterValue = computed(() => config.audio.master);
  const bgmValue = computed(() => config.audio.bgm);
  // const sfxValue = computed(() => config.audio.sfx);

  onMounted(() => {
    // need small delay to ensure config has been loaded & init'd 
    // by the time we grab audio levels
    setTimeout(() => {
      // console.log(`config:`, config.audio)

      bgmEngine.init('_audio_bgm');
      bgmEngine.setVolume(config.audio.bgm * config.audio.master);

    }, 100);
  });

  watch(masterValue, (newValue)=>{
    // console.log(`AUDIO: new masterVolume: ${newValue}`);
    bgmEngine.setVolumeMulti(newValue);
    bgmEngine.volumeRefresh();

    config.save();
  });

  watch(bgmValue, (newValue)=>{
    // console.log(`AUDIO: new masterVolume: ${newValue}`);
    bgmEngine.setVolume(newValue);
    bgmEngine.volumeRefresh();

    config.save();
  });

  // watch(sfxValue, (newValue)=>{
  //   console.log(`AUDIO: new masterVolume: ${newValue}`);
  // });

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
