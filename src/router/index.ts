import { createRouter, createWebHistory } from 'vue-router'
import type { IRoute } from '@/lib/interfaces';
import Landing from '../views/LandingView.vue'
import Game from '@/views/GameView.vue';
import ReleaseNotes from '@/views/ReleaseNotesView.vue';

export const routes: IRoute[] = [
  {
    path: '/',
    name: 'home',
    component: Landing
  },
  {
    path: '/release-notes',
    name: 'releaseNotes',
    component: ReleaseNotes,
  },
  {
    path: '/game-state',
    name: 'Game',
    title: 'New Game',
    component: Game
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;

