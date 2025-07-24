<script setup lang="ts">
  import { useWorldEngine } from '@/stores/world';
  import SwitchToggle from '../elements/SwitchToggle.vue';
  import { AudioKey, EVENT_AUDIO_KEY, type EventWithAudio } from '@/lib/core';

  const worldEngine = useWorldEngine();

</script>

<template>
  <div>
    <!-- Arcanum Global Configs -->
    <ul
      v-for="unlock, index in worldEngine.townConfigurations.Arcanum"
      :key="`_smithy_unlocks_config_${index}`"
    >
      <li class="grid grid-cols-2 gap-4 min-h-6 items-center">
        <p class="text-right">
          {{ unlock.name }}
          <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
        </p> <span 
          class="w-fit"
          @click="e => (e as EventWithAudio)[EVENT_AUDIO_KEY] = AudioKey.SCROLL"
          @touchend="e => (e as EventWithAudio)[EVENT_AUDIO_KEY] = AudioKey.SCROLL"
          @keydown.enter="e => (e as EventWithAudio)[EVENT_AUDIO_KEY] = AudioKey.SCROLL"
          @keydown.space="e => (e as EventWithAudio)[EVENT_AUDIO_KEY] = AudioKey.SCROLL"
        ><SwitchToggle
          v-model="unlock.state"
          :label="`Toggle - ${unlock.name}`"
          :class="`${unlock.state ? '' : 'grayscale-75'}`"
        /></span>
      </li>
    </ul>
  </div>
</template>