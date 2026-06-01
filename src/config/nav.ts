/** 导航菜单项结构（与 admin 资源表一致） */
export interface NavItem {
  path: string
  label: string
  icon?: string
  children?: NavItem[]
  /** 排序号 */
  sort_code?: number
  /** 是否可见 */
  is_visible?: string
}

/** 静态导航菜单 */
export const STATIC_NAV_ITEMS: NavItem[] = [
  { path: '/', label: '首页' },
  { path: '/about', label: '关于我们' },
]

/**
 * 自定义导航数据获取函数
 *
 * backend / merge 模式下会调用此函数。
 * 替换为自己的 API 实现即可，如：
 *
 *   export async function fetchNavItems(): Promise<NavItem[]> {
 *     const { data } = await request.Get('/api/v1/public/c/nav/menus')
 *     return data ?? []
 *   }
 */
export async function fetchNavItems(): Promise<NavItem[]> {
  // 默认返回空，由用户自行实现
  return []
}
