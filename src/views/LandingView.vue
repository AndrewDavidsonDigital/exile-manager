<script setup lang="ts">
  import FluidElement from '@/components/elements/FluidElement.vue';
  import router from '@/router';


</script>

<template>
  <section class="flex flex-col items-center my-auto mx-2">
    <FluidElement class="max-w-[32rem] text-center">
      <h2 class="capitalize text-lg mx-auto w-fit">
        Welcome adventurer
      </h2>
      <p>This is a small project (with minimal AI usage)</p>
      <p>To start adventuring navigate to `new-game` or click the button bellow</p>
      <p>
        Additionally due to the way audio auto-play works you'll need to interact with the audio element in the footer before you hear the glorious Stellaris bgm.
      </p><br>
      <h3 class="text-left">
        Notes:
      </h3>
      <ul class="text-left list-disc list-inside">
        <li>Unlike other ARPGs item tiers are meant to be asymmetrical</li>
        <li>Items are expected to be able to roll multiple Affixes of the same type</li>
        <li>Affix tier rolls will be banded relative to the item level of the item, both lower and upper</li>
      </ul>
      <button
        class="size-full"
        @click="() => router.push('/game-state')"
      >
        <FluidElement class="w-fit !p-2 mx-auto mt-2">
          Start / Continue a Run
        </FluidElement>
      </button>
    </FluidElement>
  </section>
</template>
