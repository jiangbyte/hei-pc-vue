<template>
  <div>
    <!-- Hero -->
    <section
      class="bg-gradient-to-r from-[#1677ff] via-[#0958d9] to-[#0a3d8f] py-20 px-6 text-center text-white"
    >
      <div class="max-w-800px mx-auto">
        <h1 class="text-5xl font-bold mb-4 leading-tight">欢迎来到 Hei PC</h1>
        <p class="text-lg opacity-85 mb-8 leading-relaxed">
          基于 Vue 3 + Vite + TypeScript + Ant Design Vue 构建的 C 端前台解决方案，与 HEI 后端框架配套使用
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
    <section class="py-16 px-6  mx-auto">
      <h2 class="text-center text-3xl font-semibold mb-2 text-gray-800">特性</h2>
      <p class="text-center text-gray-500 mb-12 text-base">C 端前台功能特性概览</p>
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
      <div class="mx-auto p-6">
        <a-spin :spinning="loading">
          <a-empty v-if="!loading && notices.length === 0" description="暂无公告" />
          <a-list v-else :data-source="notices" :pagination="false" item-layout="horizontal">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #title>
                    <router-link
                      :to="{ path: '/notices/detail', query: { id: item.id } }"
                      class="text-gray-800 font-medium no-underline hover:text-primary text-base"
                    >
                      {{ item.title }}
                    </router-link>
                  </template>
                  <template #description>
                    <div class="flex items-center justify-between w-full">
                      <div>
                        <a-tag v-if="item.type">{{ $dict.label('NOTICE_TYPE', item.type) }}</a-tag>
                        <a-tag v-if="item.level" :color="$dict.color('NOTICE_LEVEL', item.level)" class="ml-1">
                          {{ $dict.label('NOTICE_LEVEL', item.level) }}
                        </a-tag>
                      </div>
                      <span class="text-xs text-gray-400">{{ item.created_at }}</span>
                    </div>
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
    title: '公开访问',
    desc: '页面和接口默认对游客开放，仅个人中心和 IM 等需要登录认证，降低使用门槛。',
    icon: ThunderboltOutlined,
  },
  {
    title: 'C 端认证',
    desc: '完整的 C 端用户认证体系，支持验证码登录、SM2 国密加密传输、用户注册与管理。',
    icon: SafetyOutlined,
  },
  {
    title: '字典系统',
    desc: '接入公开字典树，支持字典驱动的动态渲染，标签颜色映射与全局字典回显。',
    icon: AppstoreOutlined,
  },
  {
    title: '通知公告',
    desc: '公共公告列表与详情展示，支持分类标签和等级标记，首页实时展示最新公告。',
    icon: SmileOutlined,
  },
  {
    title: '即时通讯',
    desc: '内置 WebSocket 实时消息系统，支持好友单聊、群组聊天、会话管理与在线状态感知。',
    icon: TeamOutlined,
  },
  {
    title: '导航菜单',
    desc: '三种导航模式：纯前端静态、后端动态获取、静态+后端合并，灵活适配各类需求。',
    icon: RocketOutlined,
  },
]

const loading = ref(false)
const notices = ref<any[]>([])

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
