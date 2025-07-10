
<script setup lang="ts">
  import FluidElement from '@/components/elements/FluidElement.vue';
  import { SCROLL_ROOT_ID, toggleScrollLock } from '@/lib/ui';
  import { useOnboardingEngine } from '@/stores/onboarding';
  import { computed, onMounted, watch, } from 'vue';

  const onboardingEngine = useOnboardingEngine();

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
    }
  });

  onMounted(() => {
    onboardingEngine.init();
  })
  

</script>
<template>
  <section 
    class="fixed !text-fuchsia-500 top-30 md:top-15 w-full"
    :class="[
      { 'z-onboarding' : isOnboarding },
      { 'z-nav' : !isOnboarding },
    ]"
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
            @click="onboardingEngine.stop"
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
          <h2 class="text-xl saturate-200 brightness-200 contrast-200">
            {{ onboardingEngine.getCurrentStep.title }}
          </h2>
          <p>{{ onboardingEngine.getCurrentStep.description }}</p>
        </FluidElement>
      </template>
    </div>
  </section>
</template>