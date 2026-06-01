<template>
  <div class="notice-detail-page">
    <a-spin :spinning="loading">
      <template v-if="notice">
        <div class="breadcrumb">
          <router-link to="/notices">通知公告</router-link>
          <span class="sep">/</span>
          <span>{{ notice.title }}</span>
        </div>

        <div class="detail-card">
          <h1 class="detail-title">{{ notice.title }}</h1>
          <div class="detail-meta">
            <span>{{ notice.create_time }}</span>
            <a-tag v-if="notice.level" :color="levelColor(notice.level)">{{ notice.level }}</a-tag>
          </div>
          <div class="detail-body" v-html="notice.content"></div>
        </div>
      </template>
      <a-empty v-else-if="!loading" description="公告不存在" />
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { fetchNoticeDetail } from '@/api/notice'

defineOptions({ name: 'PcNoticeDetail' })

const route = useRoute()
const loading = ref(false)
const notice = ref<any>(null)

function levelColor(level: string) {
  const map: Record<string, string> = { 紧急: 'red', 重要: 'orange', 普通: 'blue' }
  return map[level] || 'default'
}

onMounted(async () => {
  loading.value = true
  try {
    const { data } = await fetchNoticeDetail({ id: route.params.id as string })
    notice.value = data
  } catch {
    notice.value = null
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.notice-detail-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 24px;
}
.breadcrumb {
  margin-bottom: 24px;
  font-size: 14px;
  color: #999;
}
.breadcrumb a {
  color: var(--primary-color, #1677ff);
  text-decoration: none;
}
.sep {
  margin: 0 8px;
}
.detail-card {
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.detail-title {
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
}
.detail-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #999;
  font-size: 14px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 24px;
}
.detail-body {
  line-height: 1.8;
  font-size: 15px;
  color: #333;
}
</style>
