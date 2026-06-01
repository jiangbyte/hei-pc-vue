import { createRouter, createWebHistory } from 'vue-router'
import { setupRouterGuard } from './guard'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'root',
      component: () => import('@/layouts/base-layout/index.vue'),
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/home/index.vue'),
          meta: { title: '首页' },
        },
        {
          path: 'about',
          name: 'about',
          component: () => import('@/views/about/index.vue'),
          meta: { title: '关于我们' },
        },
        {
          path: 'notices',
          name: 'notices',
          component: () => import('@/views/notice/index.vue'),
          meta: { title: '通知公告' },
        },
        {
          path: 'notices/:id',
          name: 'notice-detail',
          component: () => import('@/views/notice/detail.vue'),
          meta: { title: '公告详情' },
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/views/profile/index.vue'),
          meta: { title: '个人中心', requiresAuth: true },
        },
      ],
    },
    {
      path: '/auth',
      component: () => import('@/layouts/blank-layout/index.vue'),
      children: [
        {
          path: 'login',
          name: 'login',
          component: () => import('@/views/auth/login.vue'),
          meta: { title: '登录' },
        },
        {
          path: 'register',
          name: 'register',
          component: () => import('@/views/auth/register.vue'),
          meta: { title: '注册' },
        },
      ],
    },
    {
      path: '/403',
      name: '403',
      component: () => import('@/views/error/403.vue'),
      meta: { title: '无权限' },
    },
    {
      path: '/404',
      name: '404',
      component: () => import('@/views/error/404.vue'),
      meta: { title: '未找到' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/error/404.vue'),
    },
  ],
})

setupRouterGuard(router)

export { router }
export default router
