import { createRouter, createWebHashHistory } from 'vue-router';
import settingsPage from '../entrypoints/popup/settingsPage.vue';
import createPage from '../entrypoints/popup/createPage.vue';
import index from '../entrypoints/popup/index.vue';

const routes = [
  {
    path: '/',
    redirect: '/index'
  },
  {
    path: '/index',
    name: 'home',
    component: index
  },
  {
    path: '/settings',
    name: 'settings',
    component: settingsPage
  },
  {
    path: '/add',
    name: 'add',
    component: createPage
  },
  {
    path: '/edit',
    name: 'edit',
    component: createPage,
    props: true
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
