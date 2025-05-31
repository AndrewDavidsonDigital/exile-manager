<script setup lang="ts">
  import FluidElement from '@/components/FluidElement.vue';
  import router from '@/router';


</script>

<template>
  <section class="flex flex-col items-center my-auto">
    <FluidElement>
      <h2 class="capitalize text-lg mx-auto w-fit">
        Welcome adventurer
      </h2>
      <p>This is a small quick project (currently ~6hrs of dev and minimal AI usage)</p>
      <p>To start adventuring navigate to `new-game` or click the button bellow</p>
      <FluidElement class="w-fit !p-2">
        <button
          class="size-full"
          @click="() => router.push('/game-state')"
        >
          Start a new Run
        </button>
      </FluidElement>
    </FluidElement>
  </section>
</template>
