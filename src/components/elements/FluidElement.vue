<script setup lang="ts">

defineProps<{
  isThin?: boolean;
}>();

</script>

<template>
  <div
    class=" bg-neutral-900 border-2 border-emerald-700 rounded-lg"
    :class="[
      { 'px-2 py-1' : isThin },
      { 'p-5' : !isThin },
    ]"
  >
    <slot></slot>
  </div>
</template>
