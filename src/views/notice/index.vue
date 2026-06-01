<template>
  <div class="notice-list-page">
    <div class="page-header">
      <h1 class="page-title">通知公告</h1>
      <p class="page-desc">了解平台最新动态和通知信息</p>
    </div>

    <div class="page-content">
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
                  <router-link :to="`/notices/${item.id}`" class="notice-title">
                    {{ item.title }}
                  </router-link>
                </template>
                <template #description>
                  <span class="notice-time">{{ item.create_time }}</span>
                  <a-tag v-if="item.level" :color="levelColor(item.level)">{{ item.level }}</a-tag>
                </template>
              </a-list-item-meta>
              <div v-if="item.summary" class="notice-summary">
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
import { fetchNoticePage } from '@/api/notice'

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

<style scoped>
.notice-list-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 24px;
}
.page-header {
  text-align: center;
  margin-bottom: 40px;
}
.page-title {
  font-size: 32px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}
.page-desc {
  color: #666;
  font-size: 16px;
}
.page-content {
  background: #fff;
  border-radius: 12px;
  padding: 24px 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.notice-title {
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
  text-decoration: none;
}
.notice-title:hover {
  color: var(--primary-color, #1677ff);
}
.notice-time {
  font-size: 13px;
  color: #999;
  margin-right: 8px;
}
.notice-summary {
  color: #666;
  margin-top: 8px;
  line-height: 1.6;
}
</style>
