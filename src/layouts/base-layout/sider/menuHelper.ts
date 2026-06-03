import { resolveIconRender } from '@/utils/iconUtil'
import type { NavItem } from '@/config/nav'

export function menuToItems(menus: NavItem[]): any[] {
  return menus
    .filter((m) => m.is_visible !== 'NO')
    .map((m) => {
      const processedChildren = m.children?.length ? menuToItems(m.children) : undefined
      return {
        key: m.path,
        icon: resolveIconRender(m.icon),
        label: m.label,
        children: processedChildren?.length ? processedChildren : undefined,
      }
    })
}
