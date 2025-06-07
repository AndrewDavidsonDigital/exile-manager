<script setup lang="ts">
  interface Props {
    count: number;
  }

  const props = defineProps<Props>();
</script>

<template>
  <span 
    class="counter"
    :style="`--counter-value: ${props.count}; --counter-name: counter_suffix_right_${Date.now()}`"
  ></span>
</template>

<style lang="css" scoped>
  @property --counter-value {
    syntax: "<integer>";
    initial-value: 0;
    inherits: true;
  }

  @property --counter-name {
    syntax: "<counter-name>";
    initial-value: '';
    inherits: true;
  }

  .counter {
    counter-increment: var(--counter-name) 0;
    counter-reset: var(--counter-name) var(--counter-value);
  }

  .counter::after {
    content: counter(var(--counter-name), upper-roman) "";
  }
</style>