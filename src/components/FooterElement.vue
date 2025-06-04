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
  <footer 
    class="
      mt-auto  
      max-w-content w-full
      text-white text-sm
      flex flex-col items-center justify-center
      gap-x-2
      pb-4 pt-2 px-2 
      mx-auto 
      bg-neutral-800

      [&>*]:whitespace-nowrap
    "
  >
    <BgmBar />
    <button 
      class=" border border-black px-2 rounded-lg bg-amber-700 text-black"
      :class="[
        {'pointer-events-none': adventuringStore.isAdventuring },
      ]"
      @click="() => purgeData()"
    >
      Purge Save Data - only use if game broken
    </button>
    <div>
      <RouterLink
        :to="{ name: 'releaseNotes' }"
        class="truncate duration-500 hover:text-orange-400"
      >
        Release Notes: {{ gameEngine.getVersions.game }}
      </RouterLink>
    </div>
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
