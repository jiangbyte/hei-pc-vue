<template>
  <AConfigProvider :theme="themeConfig" :locale="zhCN">
    <!-- Standalone loading overlay (not wrapping content) -->
    <div
      v-show="app.loading"
      class="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-white"
    >
      <a-spin size="large" :spinning="true" />
      <div class="mt-4 text-sm" style="color: var(--text-secondary, #00000073)">加载中...</div>
    </div>
    <!-- App content -->
    <div v-show="!app.loading">
      <router-view :key="app.reloadCounter" />
    </div>
  </AConfigProvider>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { theme } from 'ant-design-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import 'dayjs/locale/zh-cn'
import { useAppStore, useDictStore } from '@/store'
import { useWs } from '@/hooks/useWs'

const app = useAppStore()
const dictStore = useDictStore()

const themeConfig = computed(() => ({
  algorithm: theme.defaultAlgorithm,
  components: {
    Menu: {
      colorActiveBarHeight: 0,
      colorActiveBarBorderSize: 0,
    },
  },
}))

// WebSocket connection for real-time messaging
useWs()

// Preload dict on mount
onMounted(() => {
  dictStore.loadDict()
})
</script>
