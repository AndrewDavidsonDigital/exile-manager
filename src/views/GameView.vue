<script setup lang="ts">
  import FluidElement from '@/components/FluidElement.vue';

</script>

<template>
  <section class="flex flex-col items-center gap-2 mt-2 [&>*]:max-w-content [&>*]:w-full">
    <FluidElement>
      World Details
    </FluidElement>
    <div class="flex gap-2">
      <FluidElement class="w-full">
        Char Stats
      </FluidElement>
      <FluidElement class="w-full">
        Char inventory + equipment
      </FluidElement>
    </div>
    <FluidElement class="min-h-20">
      Events Log goes here
    </FluidElement>
  </section>
</template>
