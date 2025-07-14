<script setup lang="ts">
  import FluidElement from '@/components/elements/FluidElement.vue';
  import PillElement from '@/components/elements/PillElement.vue';
  import { entries, TagsEnum } from '@/journal';
  import type { IEntry } from '@/journal';
  import { ErrorNumber } from '@/lib/typescript';
  import { computed, ref } from 'vue';

  const searchQuery = ref('');
  const selectedTags = ref<string[]>([]);
  const isTagsExpanded = ref(false);

  const allTags = computed(() => {
    const tags = new Set<string>();
    entries.forEach((entry: IEntry) => {
      entry.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  });

  const filterEntries = (entries: IEntry[]): IEntry[] => {
    return entries.filter(entry => {
      const matchesSearch = searchQuery.value === '' || 
        entry.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        entry.description.toLowerCase().includes(searchQuery.value.toLowerCase());
      
      const matchesTags = selectedTags.value.length === 0 ||
        selectedTags.value.every(tag => entry.tags.includes(tag as any));

      return matchesSearch && matchesTags;
    });
  };

  const implementedEntries = computed(() => 
    filterEntries(entries.filter(el => !(el.tags.includes(TagsEnum.NYI))))
  );
  
  const pendingEntries = computed(() => 
    filterEntries(entries.filter(el => (el.tags.includes(TagsEnum.NYI))))
  );

  const toggleTag = (tag: string): void => {
    const index = selectedTags.value.indexOf(tag);
    if (index === ErrorNumber.NOT_FOUND) {
      selectedTags.value.push(tag);
    } else {
      selectedTags.value.splice(index, 1);
    }
  };

  const toggleTagsExpanded = (): void => {
    isTagsExpanded.value = !isTagsExpanded.value;
  };
</script>

<template>
  <div class="flex flex-col items-center mx-auto">
    <div class="w-full max-w-4xl mb-8 px-4 sticky top-5 bg-slate-700 rounded-b-lg border-2 border-emerald-800 z-50 overflow-clip">
      <div class="my-4">
        <label
          for="search-terms"
          class="sr-only"
        >Search terms</label>
        <input
          id="search-terms"
          v-model="searchQuery"
          type="text"
          placeholder="Search terms..."
          class="w-full px-4 py-2 rounded-lg border border-emerald-700 bg-slate-900 text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div class="flex flex-col gap-2">
        <button
          class="md:hidden flex items-center justify-center gap-2 text-emerald-500 hover:text-emerald-400 transition-colors"
          @click="toggleTagsExpanded"
        >
          <span>Filter Tags</span>
          <svg
            class="w-4 h-4 transition-transform"
            :class="{ 'rotate-180': isTagsExpanded }"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
        <div
          class="flex flex-wrap gap-2 justify-center transition-all duration-300 md:pb-2"
          :class="[
            'md:flex',
            isTagsExpanded ? 'max-h-96 opacity-100 pb-2' : 'max-h-0 opacity-0 md:max-h-none md:opacity-100'
          ]"
        >
          <button
            v-for="tag in allTags"
            :key="tag"
            class="px-3 py-1 rounded-full text-sm transition-colors capitalize"
            :class="[
              selectedTags.includes(tag)
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-600 text-gray-300 hover:bg-slate-800'
            ]"
            @click="toggleTag(tag)"
          >
            {{ tag }}
          </button>
        </div>
      </div>
    </div>

    <h3 class="text-xl text-emerald-500">
      In Game Terms
    </h3>
    <section class="flex flex-wrap justify-center my-auto mx-2 gap-2 pt-4 pb-2 max-w-content">
      <h3 v-if="implementedEntries.length === 0">
        No results
      </h3>
      <template
        v-for="term, index in implementedEntries"
        :key="`term_${index}`"
      >
        <FluidElement 
          class="
          max-w-[30rem] w-full 
          text-center 
          grid grid-cols-1 gap-1

          transition-all duration-500
          hover:z-10
          hover:scale-125
        "
        >
          <div class="flex justify-between w-full">
            <h3 class="text-xl text-left font-semibold">
              {{ term.title }}:
            </h3>
          </div>
          <p class="text-left">
            {{ term.description }}
          </p>
          <div class="flex gap-2 justify-center items-center my-1">
            <template
              v-for="tag, tIndex in term.tags"
              :key="`term_tIndex_${tIndex}-${index}`"
            >
              <PillElement :copy="tag" />
            </template>
          </div>
        </FluidElement>
      </template>
    </section>
    <h3 class="text-xl">
      Not Yet Implemented
    </h3>
    <section class="flex flex-wrap justify-center my-auto mx-2 gap-2 pt-4 pb-2 max-w-content">
      <h3 v-if="pendingEntries.length === 0">
        No results
      </h3>
      <template
        v-for="term, index in pendingEntries"
        :key="`term_${index}`"
      >
        <FluidElement 
          class="
          max-w-[32rem] w-full 
          text-center 
          grid grid-cols-1

          transition-all duration-500
          hover:z-10
          hover:scale-125

          !border-red-400/50
        "
          :class="[
          // { '!border-cyan-500': feature.status === 'partial' },
          // { '!border-red-400': feature.status === 'pending' },
          ]"
        >
          <div class="flex justify-between w-full">
            <h3 class="text-xl text-left font-semibold">
              {{ term.title }}:
            </h3>
          <!-- <h3
            class="capitalize font-semibold"
            :class="[
              // { 'text-emerald-400': feature.status === 'completed' },
              // { 'text-cyan-500': feature.status === 'partial' },
              // { 'text-red-400': feature.status === 'pending' },
            ]"
          >
            {{ term.status }}
          </h3> -->
          </div>
          <p class="text-left">
            {{ term.description }}
          </p>
          <div class="flex gap-2 justify-center">
            <template
              v-for="tag, tIndex in term.tags"
              :key="`term_tIndex_${tIndex}-${index}`"
            >
              <PillElement
                v-if="tag !== 'NYI'"
                :copy="tag"
              />
            </template>
          </div>
        </FluidElement>
      </template>
    </section>
  </div>
</template>
