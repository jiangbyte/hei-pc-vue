import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNavMenu } from '@/hooks/useNavMenu'
import { menuToItems } from './menuHelper'

export function useMenu() {
  const route = useRoute()
  const router = useRouter()
  const { navItems } = useNavMenu()
  const openKeys = ref<(string | number)[]>([])

  const menuItems = computed(() => menuToItems(navItems.value))

  function findAncestorPath(items: any[], path: string): string[] | null {
    for (const item of items) {
      if (item.key === path) {
        return item.children?.length ? [item.key] : []
      }
      if (item.children) {
        const found = findAncestorPath(item.children, path)
        if (found !== null) {
          return [item.key, ...found]
        }
      }
    }
    return null
  }

  function isSubmenuKey(items: any[], key: string | number): boolean {
    for (const item of items) {
      if (item.key === key) return !!item.children?.length
      if (item.children && isSubmenuKey(item.children, key)) return true
    }
    return false
  }

  watch(
    () => route.path,
    (path) => {
      const ancestorPath = findAncestorPath(menuItems.value, path)
      if (ancestorPath) {
        openKeys.value = ancestorPath
        return
      }
      openKeys.value = []
    }
  )

  function handleMenuClick({ key }: { key: string | number }) {
    if (isSubmenuKey(menuItems.value, key)) return
    router.push(String(key))
  }

  function handleOpenChange(keys: (string | number)[]) {
    openKeys.value = keys
  }

  return {
    openKeys,
    menuItems,
    handleMenuClick,
    handleOpenChange,
  }
}
