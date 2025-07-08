
<script setup lang="ts">
  import { trace } from '@/lib/logging';
  import { useGameEngine } from '@/stores/game';
  import { useWorldEngine } from '@/stores/world';

  const LOGGING_PREFIX = '⌛ Sync:\t';

  const gameEngine = useGameEngine();
  const worldEngine = useWorldEngine();

  gameEngine.$onAction((el)=> {
    const startTime = Date.now()
    trace(`${LOGGING_PREFIX}Game: $onAction: \t${el.name}` );
    trace(`${LOGGING_PREFIX}Game: args: \t${JSON.stringify(el.args)}` );
    el.onError((error) => {
      console.warn(
        `Failed "${el.name}" after ${Date.now() - startTime}ms.\nError: ${error}.`
      )
    })

    if (el.name === 'saveState'){
      el.after((_result) => {
        // check that _cascade arg exists and is set to false
        if (!(el.args.length > 0 && el.args[0] === false)){
          trace(`${LOGGING_PREFIX}Game: propagating save to [world]` );
          worldEngine.saveState(false);
        }
      })
    }
    else { trace(`${LOGGING_PREFIX}Game: OTHER CALL: \t${el.name}` );}

  });

  worldEngine.$onAction((el)=> {
    const startTime = Date.now()
    trace(`${LOGGING_PREFIX}World: $onAction: \t${el.name}` );
    trace(`${LOGGING_PREFIX}World: args: \t${JSON.stringify(el.args)}` );
    el.onError((error) => {
      console.warn(
        `Failed "${el.name}" after ${Date.now() - startTime}ms.\nError: ${error}.`
      )
    })

    if (el.name === 'saveState'){
      el.after((_result) => {
        // check that _cascade arg exists and is set to false
        if (!(el.args.length > 0 && el.args[0] === false)){
          trace(`${LOGGING_PREFIX}World: propagating save to [game]` );
          gameEngine.saveState(false);
        }
      })
    }
    else { trace(`${LOGGING_PREFIX}World: OTHER CALL: \t${el.name}` );}

  });


</script>
<template>
  <div
    v-if="false"
    class="hidden"
  >
    <!-- StateSync comp -->
  </div>
</template>