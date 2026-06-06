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
          item-layout="horizontal"
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
