import { createRouter, createWebHashHistory } from 'vue-router';
import settingsPage from '../entrypoints/popup/settingsPage.vue';
import addPage from '../entrypoints/popup/addPage.vue';
import editPage from '../entrypoints/popup/editPage.vue';
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
    component: addPage
  },
  {
    path: '/edit',
    name: 'edit',
    component: editPage,
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
