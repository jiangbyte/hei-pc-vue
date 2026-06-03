import type { RouteRecordRaw } from 'vue-router'

/** Static (non-auth) route definitions */
export const staticRoutes: RouteRecordRaw[] = [
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
]
