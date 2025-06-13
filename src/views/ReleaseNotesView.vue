<script setup lang="ts">
  import FluidElement from '@/components/elements/FluidElement.vue';
  import { releases } from '@/releaseNotes';

  const gitBaseUrl = "https://github.com/AndrewDavidsonDigital/exile-manager/"
  function resolveCommitUrl(commitHash: string){
    return `${gitBaseUrl}commit/${commitHash}`;
  }
  function resolveCompareUrl(commitHash: string){
    return `${gitBaseUrl}compare/${commitHash}`;
  }
</script>

<template>
  <section class="flex flex-col items-center m-2 pb-10 gap-2 overflow-y-scroll overflow-x-clip scrollbar max-h-[80dvh]">
    <template
      v-for="release, index in releases"
      :key="`release_notes_${index}`"
    >
      <FluidElement class="max-w-[32rem] w-full text-center">
        <h3 class="text-xl text-left font-semibold">
          v{{ release.version }}:
        </h3>
        <p
          v-if="release.isBreaking"
          class="text-lg text-amber-500 text-left pl-2"
        >
          Save Breaking
        </p>
        <p
          v-if="release.requiresPurge"
          class="text-lg text-orange-500 text-left pl-2"
        >
          Should require Data purge
        </p>
        <ul>
          <template
            v-for="note, nIndex in release.highlights"
            :key="`release_notes_${nIndex}-${index}`"
          >
            <li class="list-inside list-disc text-left">
              {{ note }}
            </li>
          </template>
        </ul>
        <p
          v-if="release.compare"
          class="opacity-60 text-left"
        >
          Commits: <a
            :href="resolveCompareUrl(release.compare)"
            target="_blank"
            class="break-words"
          >v{{ release.version }}</a>
        </p>
        <p
          v-else-if="release.commit"
          class="opacity-60 text-left"
        >
          Commit: <a
            :href="resolveCommitUrl(release.commit)"
            target="_blank"
            class="break-words"
          >{{ release.commit }}</a>
        </p>
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