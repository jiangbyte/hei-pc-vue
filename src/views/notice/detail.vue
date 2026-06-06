<template>
  <div class="max-w-900px mx-auto py-10 px-6">
    <a-spin :spinning="loading">
      <template v-if="notice">
        <div class="text-sm text-gray-400 mb-6">
          <router-link to="/notices" class="text-primary no-underline">通知公告</router-link>
          <span class="mx-2">/</span>
          <span>{{ notice.title }}</span>
        </div>

        <div class="bg-white rounded-xl p-10 shadow-sm">
          <h1 class="text-3xl font-semibold text-gray-800 mb-4">{{ notice.title }}</h1>
          <div
            class="flex items-center justify-between text-sm text-gray-400 pb-6 border-b border-gray-100 mb-6"
          >
            <div class="flex items-center gap-3">
              <a-tag v-if="notice.type">{{ $dict.label('NOTICE_TYPE', notice.type) }}</a-tag>
              <a-tag v-if="notice.level" :color="$dict.color('NOTICE_LEVEL', notice.level)">{{ $dict.label('NOTICE_LEVEL', notice.level) }}</a-tag>
            </div>
            <span>{{ notice.created_at }}</span>
          </div>
          <div class="leading-relaxed text-base text-gray-700" v-html="notice.content"></div>
        </div>
      </template>
      <a-empty v-else-if="!loading" description="公告不存在" />
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { fetchNoticeDetail } from '@/api/sys/notice'

defineOptions({ name: 'PcNoticeDetail' })

const route = useRoute()
const loading = ref(false)
const notice = ref<any>(null)

onMounted(async () => {
  loading.value = true
  try {
    const { data } = await fetchNoticeDetail({ id: route.query.id as string })
    notice.value = data
  } catch {
    notice.value = null
  } finally {
    loading.value = false
  }
})
</script>
