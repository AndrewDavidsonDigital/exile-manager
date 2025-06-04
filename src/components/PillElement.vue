<script setup lang="ts">
  interface Props {
    copy: string
    small?: boolean;
    collapse?: boolean;
  }

  const props = defineProps<Props>();
</script>

<template>
  <span 
    class="
      capitalize rounded-full 
      border dark:border-emerald-400 border-cyan-700 
      pb-0.5 
      w-fit h-fit"
    :class="[
      { 'text-sm/[1.2]' : props.small },
      { 'px-2' : !(props.collapse) },
      { 'px-0.5 md:px-2 max-w-5 md:!max-w-[unset] rounded-sm md:rounded-full' : props.collapse },
      { 'truncate md:overflow-visible md:[text-overflow]' : props.collapse },
      { 'min-w-4 md:min-w-[unset]' : props.collapse },
    ]"
  >{{ props.copy }}</span>
</template>