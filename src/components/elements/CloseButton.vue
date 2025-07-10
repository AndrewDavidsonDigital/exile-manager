<script setup lang="ts">
import FluidElement from './FluidElement.vue';

  const $emit = defineEmits<{
  // <eventName>: <expected arguments>
  click: [event: Event]
}>();

</script>

<template>
  <button
    class="absolute top-2 right-2 w-fit"
    @click="e => $emit('click', e)"
  >
    <FluidElement class="!rounded-full !py-0 !px-1.5 border-slate-400 text-slate-300 bg-transparent hover:text-amber-600 hover:border-amber-600 transition-colors duration-300">
      <div class="font-semibold">
        X
      </div>
    </FluidElement>
  </button>
</template>
