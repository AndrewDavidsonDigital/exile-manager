<!-- eslint-disable prettier/prettier -->
<script setup lang="ts">
  import { useRoute } from 'vue-router'
  import { routes } from '@/router';

  const currentRoute = useRoute();

</script>

<template>
  <header class="h-fit bg-slate-900 sticky top-0 z-nav">
    <nav class="flex gap-x-4 justify-center">
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
  </header>
</template>
