<script setup lang="ts">
  import FluidElement from '@/components/FluidElement.vue';
  import router from '@/router';


</script>

<template>
  <section class="flex flex-col items-center my-auto mx-2">
    <FluidElement class="max-w-[32rem] text-center">
      <h2 class="capitalize text-lg mx-auto w-fit">
        Welcome adventurer
      </h2>
      <p>This is a small quick project (currently ~15hrs of dev and minimal AI usage)</p>
      <p>To start adventuring navigate to `new-game` or click the button bellow</p>
      <p>
        Additionally due to the way auto-play works you'll need to interact with the audio element in the footer before you hear the glorious Stellaris bgm
      </p>
      <button
        class="size-full"
        @click="() => router.push('/game-state')"
      >
        <FluidElement class="w-fit !p-2 mx-auto mt-2">
          Start a new Run
        </FluidElement>
      </button>
    </FluidElement>
  </section>
</template>
