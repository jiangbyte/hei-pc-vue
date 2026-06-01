<template>
  <div class="max-w-1200px mx-auto p-6">
    <!-- Hero section -->
    <div class="hero-section mb-8">
      <h1 class="text-4xl font-bold mb-3">欢迎来到 Hei PC</h1>
      <p class="text-lg text-secondary mb-6">一个面向公众的现代化服务平台</p>
      <a-button type="primary" size="large" @click="router.push('/about')">了解更多</a-button>
    </div>

    <!-- Features -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <a-card v-for="feature in features" :key="feature.title" :bordered="false" class="feature-card">
        <template #title>
          <div class="flex items-center gap-2">
            <component :is="feature.icon" class="text-xl" />
            <span>{{ feature.title }}</span>
          </div>
        </template>
        <p class="text-secondary">{{ feature.desc }}</p>
      </a-card>
    </div>

    <!-- Dict demo section (public BIZ dict) -->
    <a-card title="字典数据展示（公开 BIZ）" :bordered="false" class="mb-8">
      <a-table
        :dataSource="dictItems"
        :columns="columns"
        rowKey="value"
        :pagination="{ pageSize: 10 }"
        size="small"
      />
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  AppstoreOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons-vue'
import { useDictStore } from '@/store'

defineOptions({ name: 'PcHome' })

const router = useRouter()
const dictStore = useDictStore()

const features = [
  { title: '高效便捷', desc: '快速响应的服务体验，满足您的各种需求。', icon: ThunderboltOutlined },
  { title: '安全可靠', desc: '数据加密传输，保障您的信息安全。', icon: SafetyOutlined },
  { title: '丰富功能', desc: '提供多种业务功能，一站式服务。', icon: AppstoreOutlined },
]

const columns = [
  { title: '字典编码', dataIndex: 'code', key: 'code' },
  { title: '标签', dataIndex: 'label', key: 'label' },
  { title: '值', dataIndex: 'value', key: 'value' },
  { title: '颜色', dataIndex: 'color', key: 'color' },
]

const dictItems = ref<any[]>([])

onMounted(async () => {
  await dictStore.loadDict()
  // Flatten dict for table display
  const items: any[] = []
  for (const [code, children] of Object.entries(dictStore.dictMap)) {
    for (const child of children as any[]) {
      items.push({ code, ...child })
    }
  }
  dictItems.value = items
})
</script>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, #1677ff 0%, #0a3d8f 100%);
  border-radius: 12px;
  padding: 48px;
  color: #fff;
}
.text-secondary {
  color: rgba(255, 255, 255, 0.75);
}
</style>
