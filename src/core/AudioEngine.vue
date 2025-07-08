
<script setup lang="ts">
  import { computed, onMounted, watch } from 'vue';
  import { useBgmEngine, useInteractionEngine } from '&audio'
  import { useConfigurationStore } from '../stores/configuration';

  const bgmEngine = useBgmEngine();
  const interactionEngine = useInteractionEngine();
  const config = useConfigurationStore();

  const masterValue = computed(() => config.audio.master);
  const bgmValue = computed(() => config.audio.bgm);
  const sfxValue = computed(() => config.audio.sfx);

  onMounted(() => {
    // need small delay to ensure config has been loaded & init'd 
    // by the time we grab audio levels
    setTimeout(() => {
      // console.log(`config:`, config.audio)

      bgmEngine.init('_audio_bgm');
      bgmEngine.setVolume(config.audio.bgm);
      bgmEngine.setVolumeMulti(config.audio.master);

      interactionEngine.init('_audio_interaction');
      interactionEngine.setVolume(config.audio.sfx);
      interactionEngine.setVolumeMulti(config.audio.master);

    }, 100);
  });

  watch(masterValue, (newValue)=>{
    // console.log(`AUDIO: new masterVolume: ${newValue}`);
    bgmEngine.setVolumeMulti(newValue);
    bgmEngine.volumeRefresh();
    interactionEngine.setVolumeMulti(newValue);
    interactionEngine.volumeRefresh();

    config.save();
  });

  watch(bgmValue, (newValue)=>{
    // console.log(`AUDIO: new masterVolume: ${newValue}`);
    bgmEngine.setVolume(newValue);
    bgmEngine.volumeRefresh();

    config.save();
  });

  watch(sfxValue, (newValue)=>{
    // console.log(`AUDIO: new masterVolume: ${newValue}`);
    interactionEngine.setVolume(newValue);
    interactionEngine.volumeRefresh();

    config.save();
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
  <audio
    id="_audio_interaction"
    class="pointer-events-none"
    playsinline
    autoplay
  ></audio>
<!--
  <audio id="_audio_sfx" class="pointer-events-none" playsinline autoplay></audio>
  <audio id="_audio_voice" class="pointer-events-none" playsinline autoplay></audio>
-->
</template>
