
<script setup lang="ts">
  import FluidElement from '@/components/elements/FluidElement.vue';
  import { SCROLL_ROOT_ID, toggleScrollLock } from '@/lib/ui';
  import { useConfigurationStore } from '@/stores/configuration';
  import { useOnboardingEngine } from '@/stores/onboarding';
  import { computed, onMounted, watch, } from 'vue';

  const onboardingEngine = useOnboardingEngine();
  const configurationEngine = useConfigurationStore();

  const isOnboarding = computed(() => onboardingEngine.isOnboarding);

  watch(isOnboarding, (newValue)=> {
    let scrollRoot = document.getElementById(SCROLL_ROOT_ID);
    if(scrollRoot){
      toggleScrollLock(newValue, scrollRoot);
    }
    if (newValue){
      document.body.dataset.onboarding = '';
      onboardingEngine.ensureSizeIsBound();
    }else{
      delete document.body.dataset.onboarding;
      onboardingEngine.ensureSizeIsBound();
    }
  });

  onMounted(() => {
    onboardingEngine.init();
  })

  function completeOnboarding(){
    onboardingEngine.stop(); 
    setTimeout(
      () => {
        configurationEngine.help.tutorial = false;
      },
      50,
    )
  }
  

</script>
<template>
  <section 
    class="fixed !text-fuchsia-500 md:top-15 w-full transition-all duration-200"
    :class="[
      { 'z-onboarding' : isOnboarding },
      { 'z-nav' : !isOnboarding },
      { 'top-30' : onboardingEngine.isStepPositioningTop || !isOnboarding },
      { 'bottom-[3dvh]' : !onboardingEngine.isStepPositioningTop && isOnboarding },
    ]"
    data-onboarding-engine
  >
    <div class="relative max-w-content mx-auto">
      <!-- Onboarding comp -->  
      <button
        class="w-fit z-onboarding fixed h-8"
        @click="!isOnboarding ? onboardingEngine.activate() : onboardingEngine.stop()"
      >
        <FluidElement
          is-thin
          class="!border-fuchsia-700"
        >
          {{ isOnboarding ? 'Cancel' : 'Start' }} Tutorial
        </FluidElement>
      </button>
      <template v-if="isOnboarding">
        <div class="flex gap-2 pt-10 mb-2 ">
          <button
            class="w-fit "
            :class="[
              { 'grayscale-100 pointer-events-none ' : onboardingEngine.activeTimerIds.length > 0 || onboardingEngine.currentStep === 0 },
            ]"
            @click="onboardingEngine.progress(false)"
          >
            <FluidElement
              is-thin
              class="!border-fuchsia-700"
            >
              Prev
            </FluidElement>
          </button>
          <button
            v-if="onboardingEngine.currentStep !== onboardingEngine.steps.length -1"
            class="w-fit "
            :class="[
              { 'grayscale-100 pointer-events-none ' : onboardingEngine.activeTimerIds.length > 0 },
            ]"
            @click="onboardingEngine.progress()"
          >
            <FluidElement
              is-thin
              class="!border-fuchsia-700"
            >
              Next
            </FluidElement>
          </button>
          <button
            v-if="onboardingEngine.currentStep >= onboardingEngine.steps.length -1"
            class="w-fit"
            :class="[
              { 'grayscale-100 pointer-events-none ' : onboardingEngine.activeTimerIds.length > 0 },
            ]"
            @click="completeOnboarding"
          >
            <FluidElement
              is-thin
              class="!border-fuchsia-700"
            >
              Complete
            </FluidElement>
          </button>
          <FluidElement
            is-thin
            class="!border-fuchsia-700"
          >
            {{ onboardingEngine.currentStep + 1 }} / {{ onboardingEngine.steps.length }}
          </FluidElement>
        </div>
        <FluidElement
          is-thin
          class="!border-fuchsia-700 w-fit grayscale-75 max-w-160"
        >
          <h2 class="text-2xl saturate-200 brightness-200 contrast-200">
            {{ onboardingEngine.getCurrentStep?.chapter }}
          </h2>
          <h3 class="text-xl saturate-200 brightness-200 contrast-200">
            {{ onboardingEngine.getCurrentStep?.title }}
          </h3>
          <p>{{ onboardingEngine.getCurrentStep.description }}</p>
        </FluidElement>
      </template>
    </div>
  </section>
</template>