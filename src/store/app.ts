import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    loading: false,
    reloadCounter: 0,
  }),
  actions: {
    setLoading(v: boolean) {
      this.loading = v
    },
    reloadPage() {
      this.reloadCounter++
    },
  },
  persist: true,
})
