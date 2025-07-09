<script setup lang="ts">

interface Props {
  class?: string;
}

const props = defineProps<Props>();

const $emit = defineEmits<{
  (_e: 'updated'): void
}>();

const model = defineModel();

function update(): void {
  model.value = !(model.value);
  $emit('updated');
}

</script>

<template>
  <label>
    <input
      v-model="model"
      type="checkbox"
      class="hidden"
    >
  </label>
  <button 
    class="
      dark:bg-slate-600 dark:outline-emerald-400 
      bg-slate-400 outline-blue-600 
      outline rounded-full 
      min-w-8 w-8 h-4 p-0.5 
      flex relative 
      transition-all duration-300 ease-in
      cursor-pointer
    "
    :class="props.class"
    @click="update"
  >
    <div 
      class="dark:bg-green-300 bg-blue-600 rounded-full w-3 h-3 absolute  transition-all duration-300"
      :class="{ 'translate-x-[130%]' : model }"
    ></div>
  </button>
</template>

<style scoped>
</style>
