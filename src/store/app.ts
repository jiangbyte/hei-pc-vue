import { defineStore } from 'pinia'

/** 主题模式 */
export type ThemeMode = 'light' | 'dark' | 'realDark'

export const useAppStore = defineStore('app', {
  state: () => ({
    /** 全局加载中（路由切换等过渡场景） */
    loading: false,
    /** 页面刷新计数器 */
    reloadCounter: 0,
    /** 主题模式 */
    theme: 'light' as ThemeMode,
    /** 主题色 */
    colorPrimary: '#1677ff',
    /** 灰色模式 */
    grayMode: false,
    /** 色弱模式 */
    colorWeak: false,
    /** 面包屑显示 */
    showBreadcrumb: true,
    /** 页脚显示 */
    showFooter: true,
  }),
  actions: {
    setLoading(v: boolean) {
      this.loading = v
    },
    reloadPage() {
      this.reloadCounter++
    },
    setTheme(theme: ThemeMode) {
      this.theme = theme
    },
    toggleGrayMode() {
      this.grayMode = !this.grayMode
    },
    toggleColorWeak() {
      this.colorWeak = !this.colorWeak
    },
  },
  persist: true,
})
