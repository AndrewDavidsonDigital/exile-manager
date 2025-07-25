<script setup lang="ts">
  import { useConfigurationStore } from '@/stores/configuration';
  import SwitchToggle from './elements/SwitchToggle.vue';
  import FluidElement from './elements/FluidElement.vue';
  import { resolveLabelFromKey } from '@/lib/language';
  import { getLogging, LoggingConfigKeys, updateLogging, type ILoggingConfig } from '@/lib/logging';
  import { ref } from 'vue';

  const configuration = useConfigurationStore();

  const localLogging = ref<ILoggingConfig>();
  localLogging.value = getLogging();

</script>

<template>
  <article class="flex flex-col gap-2 justify-start text-emerald-300">
    <div class="flex items-center gap-3">
      <h3 class="text-lg font-semibold text-slate-200 order-2">
        Options
      </h3>
      <button
        class="w-fit order-1"
        @click="configuration.isOpen = !configuration.isOpen; configuration.save();"
      >
        <FluidElement class="py-2 px-3">
          Close
        </FluidElement>
      </button>
    </div>
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
                :aria-label="`Audio volume slider: ${ resolveLabelFromKey(config) }`"
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
              :label="`${resolveLabelFromKey(config)}`"
              @updated="configuration.saveState"
            ></SwitchToggle>
          </span>
        </span>
      </template>
      <template
        v-else
      >
        <h3 class="text-lg">
          {{ resolveLabelFromKey(index) }}
        </h3>
        <span
          v-for="config,confIndex in Object.keys(configGroup as object)"
          :key="`settings_config_${index}-${confIndex}`"
        >
          <template v-if="typeof (configuration[index] as Record<string, boolean>)[config] === 'boolean'">

            <span class="flex justify-between gap-2 items-center md:max-w-1/2">
              <p class="ml-4">{{ resolveLabelFromKey(config) }}</p>
              <SwitchToggle
                v-model="(configuration[index] as Record<string, boolean>)[config]"
                :label="`${resolveLabelFromKey(config)}`"
                @updated="configuration.saveState();"
              ></SwitchToggle>
            </span>
          </template>
        </span>
      </template>
    </template>
    <h3 class="text-lg">
      Logging
    </h3>
    <template v-if="localLogging">
      <template 
        v-for="loggingConfig,index in LoggingConfigKeys"
        :key="`logging_settings_configGroup_${index}`"
      >
        <span class="flex justify-between gap-2 items-center md:max-w-1/2">
          <p class="ml-4">{{ resolveLabelFromKey(loggingConfig) }}</p>
          <SwitchToggle
            v-model="(localLogging[loggingConfig])"
            :label="`${resolveLabelFromKey(loggingConfig)}`"
            @updated="updateLogging(loggingConfig, localLogging[loggingConfig])"
          ></SwitchToggle>
        </span>
      </template>
    </template>
  </article>
</template> 