<!-- eslint-disable prettier/prettier -->
<script setup lang="ts">
  import { useRoute } from 'vue-router'
  import { routes } from '@/router';
  import { ref } from 'vue';
  import { IconPlus } from '../icons';

  const MOBILE_SPLIT_INDEX = 3;
  const toggleMobile = ref<Boolean>(false);
  const currentRoute = useRoute();

</script>

<template>
  <header class="h-fit bg-slate-900 sticky top-0 z-nav text-lg">
    <!-- Desktop Navigation -->
    <nav class="gap-x-4 justify-center hidden md:flex">
      <template   
        v-for="(value, _index) in routes"
        :key="'routerKey_' + _index"
      >
        <RouterLink
          :to="value.path"
          class="truncate duration-500 hover:text-orange-400"
          :class="[
            { 'pointer-events-none cursor-default truncate !text-cyan-500' : value.path === currentRoute.path},
          ]"
          :title="value.title"
        >
          {{ value.title }}
        </RouterLink>
      </template>
    </nav>

    <!-- Mobile Rendition -->
    <div class="flex flex-col md:hidden">
      <nav class="gap-x-4 justify-center flex mx-auto">
        <template   
          v-for="(value, _index) in routes"
          :key="'routerKey_' + _index"
        >
          <template v-if="_index < MOBILE_SPLIT_INDEX">
            <RouterLink
              :to="value.path"
              class="truncate duration-500 hover:text-orange-400"
              :class="[
                { 'pointer-events-none cursor-default truncate !text-cyan-500' : value.path === currentRoute.path},
              ]"
              :title="value.title"
            >
              {{ value.title }}
            </RouterLink>
          </template>
        </template>
        <button 
          v-if="routes.length > MOBILE_SPLIT_INDEX"
          @click="toggleMobile = !toggleMobile"
        >
          <IconPlus 
            :class="[
              { 'closed' : toggleMobile },
            ]"
          />
        </button>
      </nav>
      <nav
        class="gap-x-4 justify-center flex mx-auto transition-all h-auto transition-discrete max-h-fit"
        :class="[
          { '!max-h-0' : !toggleMobile }
        ]"
      >
        <template   
          v-for="(value, _index) in routes"
          :key="'routerKey_' + _index"
        >
          <template v-if="_index >= MOBILE_SPLIT_INDEX">
            <RouterLink
              :to="value.path"
              class="truncate duration-500 hover:text-orange-400"
              :class="[
                { 'pointer-events-none cursor-default truncate !text-cyan-500' : value.path === currentRoute.path},
              ]"
              :title="value.title"
            >
              {{ value.title }}
            </RouterLink>
          </template>
        </template>
      </nav>
    </div>
  </header>
</template>
