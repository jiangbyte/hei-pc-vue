<template>
  <AConfigProvider :locale="zhCN">
    <div v-show="!app.loading">
      <router-view :key="app.reloadCounter" />
    </div>
  </AConfigProvider>
</template>

<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import 'dayjs/locale/zh-cn'
import { useAppStore, useDictStore } from '@/store'

const app = useAppStore()
const dictStore = useDictStore()

// Preload dict data on app start
dictStore.loadDict()
</script>
