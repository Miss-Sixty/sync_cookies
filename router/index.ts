import { createRouter, createWebHashHistory } from 'vue-router';
import Settings from '../entrypoints/popup/Settings.vue';
import AddOrEditPage from '../entrypoints/popup/AddOrEditPage.vue';
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
    component: Settings
  },
  {
    path: '/add',
    name: 'add',
    component: AddOrEditPage
  },
  {
    path: '/edit',
    name: 'edit',
    component: AddOrEditPage,
    props: true
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
