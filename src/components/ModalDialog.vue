<script setup lang="ts">
  import { trace } from '@/lib/logging';
  import { ref, watch } from 'vue';

  const LOGGING_PREFIX = '▫️Modal:\t';

  interface Props {
    id: string,
    show: boolean,
  }
  const props = defineProps<Props>()
  const $emit = defineEmits(['open', 'close'])


  const dialogRef = ref<HTMLDialogElement>()


  watch(() => props.show, (newValue) => {
    if(newValue){
      dialogRef.value?.showModal();
      dialogRef.value?.blur();
      $emit('open');
    } else {
      trace(`${LOGGING_PREFIX}closing modal`);
      dialogRef.value?.close()
      $emit('close');
    }
  })

  // function checkBackdropClick(event: MouseEvent ){
  //   const target = event.target as HTMLElement;
  //   const bounds = target.getBoundingClientRect()
  //   const click = {
  //     x: event.clientX,
  //     y: event.clientY,
  //   }

  //   if (!(bounds.left < click.x  && click.x < bounds.right
  //     && bounds.top < click.y  && click.y < bounds.bottom
  //   )){
  //     dialogRef.value?.close();
  //   }
  // }

</script>

<template>
  <dialog
    :id="props.id"
    ref="dialogRef"
    class="
      items-center m-auto
      p-[5vw]
      backdrop-blur-[5px] !outline-none

      backdrop:bg-red-800
      bg-slate-800 rounded-xl

      transition-all duration-1000
      z-dialog

      hidden
      opacity-0

      backdrop:w-screen backdrop:h-screen
    "
    role="presentation"
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