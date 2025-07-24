<script setup lang="ts">

  defineProps<{
    tooltipKey: string;
  }>();


</script>

<template>
  <div
    class="tooltip-parent"
    :style="`anchor-name: --tooltip-${tooltipKey};`"
  >
    <slot name="wrapper"></slot>
    <div
      class="tooltip"
      :style="`position-anchor: --tooltip-${tooltipKey};`"
    >
      <div class="flex flex-col gap-1">
        <slot name="tooltip"></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
  @reference "@/assets/main.css";

  .tooltip {
    @apply fixed hidden bg-gray-900 border border-gray-600/40 rounded-md;
    @apply text-gray-200 text-sm whitespace-nowrap;
    @apply p-2 z-50;
    @apply cursor-default;
    top: anchor(bottom);
    justify-self: anchor-center;
  }

  .tooltip-parent:hover .tooltip {
    @apply block;
  }
</style> 