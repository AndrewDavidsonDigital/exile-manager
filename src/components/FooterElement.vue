<!-- eslint-disable prettier/prettier -->
<script setup lang="ts">
  import { useGameEngine } from '@/stores/game';
  import BgmBar from './BgmBar.vue';
  import { useAdventuringStore } from '@/stores/adventuring';
  import { useRouter } from 'vue-router';
  import { useGameState } from '@/lib/storage';

  const gameEngine = useGameEngine();
  const adventuringStore = useAdventuringStore();
  const router = useRouter();

  function purgeData(){
    useGameState().remove();

    router.go(0);
  }
</script>

<template>
  <footer class="mt-auto bg-neutral-800 w-full text-white flex flex-col items-center gap-x-2 justify-center pb-4 pt-2 px-2 max-w-content mx-auto [&>*]:whitespace-nowrap">
    <BgmBar />
    <div>Game version: {{ gameEngine.getVersions.game }}</div>
    <button 
      class=" border border-black px-2 rounded-lg bg-amber-700 text-black"
      :class="[
        {'pointer-events-none': adventuringStore.isAdventuring },
      ]"
      @click="() => purgeData()"
    >
      Purge Save Data - only use if game broken
    </button>
    <div>© {{ (new Date()).getFullYear() }}</div>
    <div>
      Contact: 
      <a 
        href="mailto:andrew.davidson.digital@gmail.com" 
        class="transition-all duration-300 hover:text-orange-300 underline underline-offset-4 decoration-transparent hover:decoration-orange-300"
      >andrew.davidson.digital@gmail.com</a>
    </div>
    <div>
      GitHub:
      <a 
        href="https://github.com/AndrewDavidsonDigital" 
        class="transition-all duration-300 hover:text-orange-300 underline underline-offset-4 decoration-transparent hover:decoration-orange-300"
        target="_blank"
      >github.com/AndrewDavidsonDigital</a>
    </div>
  </footer>
</template>
