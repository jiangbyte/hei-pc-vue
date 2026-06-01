import type { Router } from 'vue-router'
import { useAuthStore } from '@/store'

export function setupRouterGuard(router: Router) {
  router.beforeEach(async (to, _from, next) => {
    const authStore = useAuthStore()

    // Pages that require login
    const requiresAuth = to.matched.some(r => r.meta.requiresAuth)

    if (requiresAuth && !authStore.isLogin) {
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }

    next()
  })
}
