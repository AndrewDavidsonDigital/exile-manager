<script setup lang="ts">
  import FluidElement from '@/components/FluidElement.vue';
  import { releases } from '@/releaseNotes';

  const gitBaseUrl = "https://github.com/AndrewDavidsonDigital/exile-manager/commit/"
  function resolveCommitUrl(commitHash: string){
    return `${gitBaseUrl}${commitHash}`;
  }
</script>

<template>
  <section class="flex flex-col items-center my-auto mx-2 gap-2">
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
          v-if="release.commit"
          class="opacity-60 text-left"
        >
          Commit: <a
            :href="resolveCommitUrl(release.commit)"
            target="_blank"
          >{{ release.commit }}</a>
        </p>
      </FluidElement>
    </template>
  </section>
</template>
