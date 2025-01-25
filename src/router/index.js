import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import MainView from '../views/MainView.vue'
import { useUserStore } from '../stores/userStore' // Adjusted import path

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/main',
      name: 'main',
      component: MainView,
    },
  ],
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  userStore.loadSession();
  if (!userStore.isLoggedIn && to.name !== 'main') {
    next({ name: 'main' });
  } else {
    next();
  }
});

export default router
