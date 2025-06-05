<script setup lang="ts">
  import { trace } from '@/lib/logging';
  import { ref, watch } from 'vue';

  const LOGGING_PREFIX = '▫️Modal:\t';

  interface Props {
    id: string,
    show: boolean,
    disableLiteDismiss?: boolean,
  }
  const props = defineProps<Props>()
  const $emit = defineEmits(['open', 'close'])


  const dialogRef = ref<HTMLDialogElement>()


  watch(() => props.show, (newValue) => {
    let scrollRoot = document.getElementById('scrollRoot')
    if(newValue){
      dialogRef.value?.showModal();
      dialogRef.value?.blur();
      
      if(scrollRoot){
        scrollRoot.style.overflow = 'hidden';
      }

      $emit('open');
    } else {
      trace(`${LOGGING_PREFIX}closing modal`);
      dialogRef.value?.close()
      
      if(scrollRoot){
        scrollRoot.style.overflow = '';
      }
      $emit('close');
      // console.log(`**** ${Date.now()}`);
    }
  })

  /**
   * wrapper function for onClose, so when closed NON-programmatically (backdrop click)
   * that the events are are emitted correctly
   */
  function cascadeBackdropClose(){
    // console.log(`---- ${Date.now()}`);
    // console.log('close--->  current_state: ', props.show);
    if (props.show){
      let scrollRoot = document.getElementById('scrollRoot')
      if(scrollRoot){
        scrollRoot.style.overflow = '';
      }
      $emit('close');
    }
  };

</script>

<template>
  <dialog
    :id="props.id"
    ref="dialogRef"
    class="
      items-center m-auto
      p-[5vw]
      backdrop-blur-[5px] !outline-none

      border border-emerald-800
      backdrop:bg-slate-800/80
      bg-slate-800 rounded-xl

      transition-all duration-1000
      z-dialog

      hidden
      opacity-0

      backdrop:w-screen backdrop:h-screen
    "
    role="presentation"
    :closedby="disableLiteDismiss ? 'closerequest' : 'any'"
    @close="cascadeBackdropClose"
  >
    <slot></slot>
  </dialog>
</template>

<style scoped>
  @reference "@/assets/main.css";

  dialog[open]{
    @apply flex;
    @apply opacity-100;

    @starting-style {
      opacity: 0;
    }
  }

  dialog[open]::backdrop{
    @apply opacity-80;
  }

  @starting-style {
    dialog[open]::backdrop{
      @apply opacity-0;
    }
  }
</style>