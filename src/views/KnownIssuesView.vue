<script setup lang="ts">
  import FluidElement from '@/components/elements/FluidElement.vue';
  import { issues } from '@/knownIssues';


</script>

<template>
  <section class="flex flex-col items-center m-2 pb-10 gap-2 overflow-y-scroll overflow-x-clip scrollbar max-h-[80dvh]">
    <template
      v-for="issue, index in issues"
      :key="`issues_${index}`"
    >
      <FluidElement class="max-w-[32rem] w-full text-center">
        <h3 class="text-xl text-left font-semibold">
          {{ issue.title }}:
        </h3>
        <p class="text-left">
          {{ issue.description }}:
        </p>
        <ul>
          <template
            v-for="detail, nIndex in issue.details"
            :key="`release_notes_${nIndex}-${index}`"
          >
            <li class="list-inside list-disc text-left">
              {{ detail }}
            </li>
          </template>
        </ul>
      </FluidElement>
    </template>
  </section>
  <section class="mask-b"></section>
</template>

<style scoped>
  @reference "@/assets/main.css";
  .mask-b{
    @apply relative;
    @apply before:absolute before:w-[calc(100%_-_1rem)] before:h-16 before:bottom-0 before:left-0;
    @apply before:bg-slate-800;
  }
  .mask-b::before {
    mask-image: linear-gradient(
      to bottom, 
      transparent,
      black 80%
    );
    @apply z-10;
  }
</style>