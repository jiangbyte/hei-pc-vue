<template>
  <div class="max-w-900px mx-auto py-10 px-6">
    <div class="text-center mb-10">
      <h1 class="text-3xl font-semibold text-gray-800 mb-2">通知公告</h1>
      <p class="text-base text-gray-500">了解平台最新动态和通知信息</p>
    </div>

    <div class="bg-white rounded-xl px-8 py-6 shadow-sm">
      <a-spin :spinning="loading">
        <a-empty v-if="!loading && notices.length === 0" description="暂无公告" />
        <a-list
          v-else
          :data-source="notices"
          item-layout="vertical"
          :pagination="{
            current: page,
            pageSize: size,
            total,
            onChange: onPageChange,
            showSizeChanger: false,
          }"
        >
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
                  <span class="text-xs text-gray-400 mr-2">{{ item.create_time }}</span>
                  <a-tag v-if="item.level" :color="levelColor(item.level)">{{ item.level }}</a-tag>
                </template>
              </a-list-item-meta>
              <div v-if="item.summary" class="text-gray-500 mt-2 leading-relaxed">
                {{ item.summary }}
              </div>
            </a-list-item>
          </template>
        </a-list>
      </a-spin>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchNoticePage } from '@/api/sys/notice'

defineOptions({ name: 'PcNotices' })

const loading = ref(false)
const notices = ref<any[]>([])
const page = ref(1)
const size = ref(10)
const total = ref(0)

function levelColor(level: string) {
  const map: Record<string, string> = { 紧急: 'red', 重要: 'orange', 普通: 'blue' }
  return map[level] || 'default'
}

async function loadNotices() {
  loading.value = true
  try {
    const { data } = await fetchNoticePage({ page: page.value, size: size.value })
    if (data) {
      notices.value = data.records || []
      total.value = data.total || 0
    }
  } catch {
    notices.value = []
  } finally {
    loading.value = false
  }
}

function onPageChange(p: number) {
  page.value = p
  loadNotices()
}

onMounted(loadNotices)
</script>
