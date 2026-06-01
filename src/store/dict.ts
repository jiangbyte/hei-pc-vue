import { defineStore } from 'pinia'
import { fetchBizDictTree } from '@/api/dict'

export const useDictStore = defineStore('dict', {
  state: () => ({
    dictMap: {} as Record<string, any[]>,
    treeData: [] as any[],
    loaded: false,
    _loadingPromise: null as Promise<void> | null,
  }),
  actions: {
    setDict(category: string, data: any[]) {
      this.dictMap[category] = data
    },
    getDict(category: string) {
      return this.dictMap[category] || []
    },

    async loadDict() {
      if (this.loaded) return
      if (this._loadingPromise) return this._loadingPromise
      this._loadingPromise = this._doLoad()
      return this._loadingPromise
    },

    async _doLoad() {
      try {
        await this.refreshDict()
        this.loaded = true
      } catch {
        this.loaded = false
      } finally {
        this._loadingPromise = null
      }
    },

    async refreshDict() {
      const { data } = await fetchBizDictTree()
      if (data) {
        this.treeData = data
        this._buildIndex(data)
      }
    },

    _buildIndex(tree: any[]) {
      for (const node of tree) {
        if (node.code && node.children?.length) {
          this.dictMap[node.code] = node.children.map((c: any) => ({
            label: c.label,
            value: c.value,
            color: c.color,
            status: c.status,
          }))
        }
        if (node.children?.length) {
          this._buildIndex(node.children)
        }
      }
    },

    getDictItems(typeCode: string): any[] {
      if (this.dictMap[typeCode]) return this.dictMap[typeCode]
      if (this.treeData.length) {
        this._buildIndex(this.treeData)
      }
      return this.dictMap[typeCode] || []
    },

    dictLabel(typeCode: string, value: string): string {
      const items = this.getDictItems(typeCode)
      const item = items.find((i: any) => i.value === value)
      return item?.label ?? value
    },

    dictColor(typeCode: string, value: string): string {
      const items = this.getDictItems(typeCode)
      const item = items.find((i: any) => i.value === value)
      return item?.color ?? 'default'
    },
  },
})
