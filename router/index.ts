import { createRouter, createWebHashHistory } from 'vue-router';
import settingsPage from '../entrypoints/popup/settingsPage.vue';
import addPage from '../entrypoints/popup/addPage.vue';
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
    component: addPage
  },
  // {
  //   path: '/edit',
  //   name: 'edit',
  //   props: {
  //     type: 'edit'
  //   },
  //   component: createPage,
  // }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
