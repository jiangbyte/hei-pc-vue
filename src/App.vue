<template>
  <AConfigProvider :locale="zhCN" :theme="themeConfig">
    <div v-show="!app.loading">
      <router-view :key="app.reloadCounter" />
    </div>
  </AConfigProvider>
</template>

<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import 'dayjs/locale/zh-cn'
import { computed } from 'vue'
import { useAppStore, useDictStore } from '@/store'

const app = useAppStore()
const dictStore = useDictStore()

const themeConfig = computed(() => ({
  hashed: false,
  components: {
    Menu: {
      colorActiveBarHeight: 0,
      colorActiveBarBorderSize: 0,
    },
  },
}))

dictStore.loadDict()
</script>
