<template>
  <div>
    <!-- Hero -->
    <section
      class="bg-gradient-to-r from-[#1677ff] via-[#0958d9] to-[#0a3d8f] py-20 px-6 text-center text-white"
    >
      <div class="max-w-800px mx-auto">
        <h1 class="text-5xl font-bold mb-4 leading-tight">欢迎来到 Hei PC</h1>
        <p class="text-lg opacity-85 mb-8 leading-relaxed">
          一个面向公众的现代化服务平台，为您提供高效、安全、便捷的在线服务体验
        </p>
        <div class="flex gap-4 justify-center">
          <a-button
            type="primary"
            size="large"
            class="h-12 px-8 text-base rounded-lg"
            @click="router.push('/about')"
          >
            了解更多
          </a-button>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="py-16 px-6 max-w-1200px mx-auto">
      <h2 class="text-center text-3xl font-semibold mb-2 text-gray-800">核心优势</h2>
      <p class="text-center text-gray-500 mb-12 text-base">我们致力于为您提供最优质的服务</p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a-card
          v-for="item in features"
          :key="item.title"
          :bordered="false"
          class="rounded-xl hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
        >
          <template #title>
            <div class="flex items-center gap-2">
              <component :is="item.icon" class="text-xl text-primary" />
              <span>{{ item.title }}</span>
            </div>
          </template>
          <p class="text-gray-500 leading-relaxed min-h-12">{{ item.desc }}</p>
        </a-card>
      </div>
    </section>

    <!-- Latest notices -->
    <section class="py-16 px-6">
      <h2 class="text-center text-3xl font-semibold mb-2 text-gray-800">最新公告</h2>
      <p class="text-center text-gray-500 mb-12 text-base">了解平台最新动态和通知</p>
      <div class="max-w-800px mx-auto bg-white rounded-xl p-6 shadow-sm">
        <a-spin :spinning="loading">
          <a-empty v-if="!loading && notices.length === 0" description="暂无公告" />
          <a-list v-else :data-source="notices" :pagination="false" item-layout="horizontal">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #title>
                    <router-link
                      :to="`/notices/${item.id}`"
                      class="text-gray-800 font-medium no-underline hover:text-primary"
                    >
                      {{ item.title }}
                    </router-link>
                  </template>
                  <template #description>
                    <span class="text-xs text-gray-400">{{ item.create_time }}</span>
                    <a-tag v-if="item.level" :color="noticeLevelColor(item.level)" class="ml-2">
                      {{ item.level }}
                    </a-tag>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
          <div v-if="notices.length" class="text-center mt-4 pt-4 border-t border-gray-100">
            <router-link to="/notices" class="text-primary no-underline">
              查看全部公告 →
            </router-link>
          </div>
        </a-spin>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  ThunderboltOutlined,
  SafetyOutlined,
  AppstoreOutlined,
  SmileOutlined,
  TeamOutlined,
  RocketOutlined,
} from '@ant-design/icons-vue'
import { fetchNoticeLatest } from '@/api/sys/notice'

defineOptions({ name: 'PcHome' })

const router = useRouter()

const features = [
  {
    title: '高效便捷',
    desc: '快速响应的服务体验，满足您的各种需求。系统性能优越，操作流畅。',
    icon: ThunderboltOutlined,
  },
  {
    title: '安全可靠',
    desc: '数据加密传输，严格保护您的隐私安全。采用先进的安全防护机制。',
    icon: SafetyOutlined,
  },
  {
    title: '丰富功能',
    desc: '提供多种业务功能，一站式服务平台。持续迭代更新，满足不断变化的需求。',
    icon: AppstoreOutlined,
  },
  {
    title: '用户至上',
    desc: '以用户体验为核心，持续优化产品。专业的客服团队为您排忧解难。',
    icon: SmileOutlined,
  },
  {
    title: '专业团队',
    desc: '资深的研发与运营团队，保障平台稳定运行。多年的行业经验积累。',
    icon: TeamOutlined,
  },
  {
    title: '持续创新',
    desc: '拥抱前沿技术，不断推陈出新。引领行业标准，打造卓越服务平台。',
    icon: RocketOutlined,
  },
]

const loading = ref(false)
const notices = ref<any[]>([])

function noticeLevelColor(level: string) {
  const map: Record<string, string> = { 紧急: 'red', 重要: 'orange', 普通: 'blue' }
  return map[level] || 'default'
}

onMounted(async () => {
  loading.value = true
  try {
    const { data } = await fetchNoticeLatest({ size: 5 })
    if (data?.records) {
      notices.value = data.records
    } else if (Array.isArray(data)) {
      notices.value = data
    }
  } catch {
    // silently fail
  } finally {
    loading.value = false
  }
})
</script>
