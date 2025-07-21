import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { preloadAudioFiles } from './lib/audioPreloader';

const app = createApp(App)

app.use(createPinia())
app.use(router)

function setupAudioPreloadTrigger() {
  let triggered = false;
  const trigger = () => {
    if (triggered) return;
    triggered = true;
    preloadAudioFiles();
    removeListeners();
  };
  const removeListeners = () => {
    document.removeEventListener('DOMContentLoaded', trigger);
    document.removeEventListener('click', trigger);
    document.removeEventListener('keydown', trigger);
    document.removeEventListener('touchstart', trigger);
    document.removeEventListener('pointerdown', trigger);
    document.removeEventListener('mousedown', trigger);
  };
  document.addEventListener('DOMContentLoaded', trigger, { once: true });
  document.addEventListener('click', trigger, { once: true });
  document.addEventListener('keydown', trigger, { once: true });
  document.addEventListener('touchstart', trigger, { once: true });
  document.addEventListener('pointerdown', trigger, { once: true });
  document.addEventListener('mousedown', trigger, { once: true });
}

setupAudioPreloadTrigger();

app.mount('#app')
