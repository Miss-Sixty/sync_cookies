import { createRouter, createWebHashHistory } from 'vue-router';
import settingsPage from '../entrypoints/popup/settingsPage.vue';
import home from '../entrypoints/popup/home/index.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: home
  },
  {
    path: '/settings',
    name: 'settings',
    component: settingsPage
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
