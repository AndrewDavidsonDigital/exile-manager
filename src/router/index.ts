import { createRouter, createWebHistory } from 'vue-router'
import type { IRoute } from '@/lib/interfaces';
import Landing from '../views/LandingView.vue'
import Game from '@/views/GameView.vue';
import ReleaseNotes from '@/views/ReleaseNotesView.vue';
import RoadmapView from '@/views/RoadmapView.vue';
import JournalView from '@/views/JournalView.vue';
import KnownIssuesView from '@/views/KnownIssuesView.vue';

export const routes: IRoute[] = [
  {
    path: '/',
    name: 'home',
    component: Landing
  },
  {
    path: '/game-state',
    name: 'Game',
    title: 'Game',
    component: Game
  },
  {
    path: '/journal',
    name: 'journal',
    title: 'Help',
    component: JournalView,
  },
  {
    path: '/roadmap',
    name: 'roadmap',
    title: 'Roadmap',
    component: RoadmapView,
  },
  {
    path: '/release-notes',
    name: 'releaseNotes',
    title: 'Release Notes',
    component: ReleaseNotes,
  },
  {
    path: '/known-issues',
    name: 'knownIssues',
    title: 'Known Issues',
    component: KnownIssuesView,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;

