<script setup lang="ts">
  import { useConfigurationStore } from '@/stores/configuration';
  import SwitchToggle from './elements/SwitchToggle.vue';
  import FluidElement from './elements/FluidElement.vue';
  import { resolveLabelFromKey } from '@/lib/language';

  const configuration = useConfigurationStore();

</script>

<template>
  <section class="flex flex-col gap-2 justify-start">
    <button
      class="w-fit"
      @click="configuration.isOpen = !configuration.isOpen"
    >
      <FluidElement class="py-2 px-3">
        Close
      </FluidElement>
    </button>
    <template
      v-for="configGroup,index in configuration.getConfigurables"
      :key="`settings_configGroup_${index}`"
    >
      <template
        v-if="index === 'audio'"
      >
        <h3 class="text-lg capitalize">
          {{ index }}
        </h3>
        <ul class="md:max-w-1/3">
          <li
            v-for="config,confIndex in Object.keys(configGroup as object)"
            :key="`settings_config_${index}-${confIndex}`"
            class="flex gap-2 justify-between"
          >
            <p class="ml-4">
              {{ resolveLabelFromKey(config) }}
            </p>
            <label v-if="['master','bgm', 'sfx'].includes(config)">
              <input 
                v-model="configuration.audio[(config as 'master'|'bgm'|'sfx')]"
                type="range"
                class="max-w-[6rem] thin-slider"
                :min="0"
                :max="1"
                :step="0.05"
              />
            </label> 
          </li>
        </ul>
      </template>
      <template
        v-else-if="index === 'ui'"
      >
        <h3 class="text-lg uppercase">
          {{ index }}
        </h3>
        <span
          v-for="config,confIndex in Object.keys(configGroup as object)"
          :key="`settings_config_${index}-${confIndex}`"
          class="hidden md:block"
        >
          <span class="flex justify-between gap-2 items-center md:max-w-1/2">
            <p class="ml-4">{{ resolveLabelFromKey(config) }}{{ configuration.ui.healthManaBars ? 'Use Bars' : 'Use Text' }}</p>
            <SwitchToggle
              v-model="configuration.ui.healthManaBars"
              @updated="configuration.saveState"
            ></SwitchToggle>
          </span>
        </span>
      </template>
    </template>
  </section>
</template> 