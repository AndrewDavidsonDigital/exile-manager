<script setup lang="ts">
  import { useWorldEngine } from '@/stores/world';
  import SwitchToggle from '../elements/SwitchToggle.vue';

  const worldEngine = useWorldEngine();

</script>

<template>
  <section>
    <!-- Smithy Global Configs -->
    <ul
      v-for="unlock, index in worldEngine.townConfigurations.Smithy"
      :key="`_smithy_unlocks_config_${index}`"
    >
      <li class="grid grid-cols-2 gap-4 min-h-6 items-center ">
        <p class="text-right">
          {{ unlock.name }}
        </p> <span><SwitchToggle
          v-model="unlock.state"
          :class="`${unlock.state ? '' : 'grayscale-75'}`"
        /></span>
      </li>
    </ul>
  </section>
</template>