import type { Router } from 'vue-router'
import { useAuthStore, useAppStore } from '@/store'

let _retryingNotFound = false

export function setupRouterGuard(router: Router) {
  router.beforeEach(async (to, _from, next) => {
    const authStore = useAuthStore()
    const appStore = useAppStore()

    // Root path redirect: logged in → home, not → login
    if (to.name === 'root') {
      if (authStore.isLogin) {
        next({ path: '/', replace: true })
        return
      }
      next({ name: 'login', query: { redirect: '/' } })
      return
    }

    // Pages that require auth
    const requiresAuth = to.matched.some(r => r.meta.requiresAuth)

    if (requiresAuth && !authStore.isLogin) {
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }

    // Handle 404 retry after auth route initialization
    if (to.name === 'not-found' && !_retryingNotFound) {
      _retryingNotFound = true
      next({ path: to.fullPath, query: to.query, hash: to.hash, replace: true })
      return
    }
    if (to.name !== 'not-found') {
      _retryingNotFound = false
    }

    next()
  })

  // After each route change, stop loading
  router.afterEach(() => {
    const appStore = useAppStore()
    appStore.setLoading(false)
  })
}
