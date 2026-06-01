import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { STATIC_NAV_ITEMS, fetchNavItems } from '@/config/nav'
import type { NavItem } from '@/config/nav'

export type NavMode = 'static' | 'backend' | 'merge'

/**
 * Navigation menu composable.
 *
 * Modes:
 * - static: 纯前端静态导航
 * - backend: 纯后端获取（数据源由 config/nav.ts 的 fetchNavItems 定义）
 * - merge: 前端静态为基础，后端数据覆盖/追加
 */
export function useNavMenu() {
  const route = useRoute()
  const navItems = ref<NavItem[]>([])
  const loading = ref(false)
  const mode = (import.meta.env.VITE_NAV_MODE as NavMode) || 'static'

  function isActive(path: string): boolean {
    if (path === '/') {
      return route.path === '/'
    }
    return route.path.startsWith(path)
  }

  async function loadFromBackend(): Promise<NavItem[]> {
    try {
      const data = await fetchNavItems()
      if (Array.isArray(data)) {
        return data
      }
    } catch {
      // backend unreachable
    }
    return []
  }

  function mergeItems(staticItems: NavItem[], backendItems: NavItem[]): NavItem[] {
    if (!backendItems.length) return staticItems

    const merged = [...staticItems]
    for (const backendItem of backendItems) {
      const idx = merged.findIndex(
        item => item.path === backendItem.path || item.label === backendItem.label
      )
      if (idx !== -1) {
        merged[idx] = { ...merged[idx], ...backendItem }
      } else {
        merged.push(backendItem)
      }
    }
    return merged
  }

  async function init() {
    loading.value = true
    try {
      switch (mode) {
        case 'static':
          navItems.value = STATIC_NAV_ITEMS
          break

        case 'backend': {
          const backendItems = await loadFromBackend()
          navItems.value = backendItems.length ? backendItems : STATIC_NAV_ITEMS
          break
        }

        case 'merge': {
          const backendItems = await loadFromBackend()
          navItems.value = mergeItems(STATIC_NAV_ITEMS, backendItems)
          break
        }

        default:
          navItems.value = STATIC_NAV_ITEMS
      }
    } finally {
      loading.value = false
    }
  }

  onMounted(init)

  return { navItems, loading, isActive, mode }
}
