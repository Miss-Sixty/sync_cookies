import { createRouter, createWebHashHistory } from 'vue-router';
import settingsPage from '../entrypoints/popup/settingsPage.vue';
import addOrEditPage from '../entrypoints/popup/addOrEditPage/index.vue';
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
  {
    path: '/add',
    name: 'add',
    component: addOrEditPage
  },
  {
    path: '/edit',
    name: 'edit',
    component: addOrEditPage,
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
