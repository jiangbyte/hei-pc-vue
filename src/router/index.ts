import { createRouter, createWebHistory } from 'vue-router'
import { setupRouterGuard } from './guard'
import { staticRoutes } from './routes'

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
          component: () => import('@/views/sys/profile/index.vue'),
          meta: { title: '个人中心', requiresAuth: true },
        },
        {
          path: 'im',
          name: 'im',
          component: () => import('@/views/im/index.vue'),
          meta: { title: '即时通讯', requiresAuth: true },
        },
        {
          path: 'im/conversation',
          name: 'im-conversation',
          component: () => import('@/views/im/conversation.vue'),
          meta: { title: '消息详情', requiresAuth: true },
        },
        {
          path: 'im/group',
          name: 'im-group',
          component: () => import('@/views/im/group/index.vue'),
          meta: { title: '群组管理', requiresAuth: true },
        },
      ],
    },
    ...staticRoutes,
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
