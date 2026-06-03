<template>
  <ADropdown :trigger="['click']" placement="bottomRight" :overlay-style="{ width: '360px' }" @openChange="onOpenChange">
    <div class="message-bell inline-flex items-center">
      <ABadge :count="wsStore.unreadCount" :overflow-count="99" size="small">
        <BellOutlined class="text-lg cursor-pointer" />
      </ABadge>
    </div>
    <template #overlay>
      <div class="bg-white rounded-lg shadow-lg">
        <!-- Header -->
        <div class="flex items-center justify-between px-4 pt-3 pb-0">
          <span class="text-base font-medium text-gray-800">消息通知</span>
          <a-button type="link" @click="router.push('/message')">查看全部</a-button>
        </div>

        <!-- Tabs -->
        <ATabs v-model:activeKey="activeTab" :tab-bar-style="{ paddingLeft: '16px', marginBottom: 0 }" size="small">
          <ATabPane key="all" tab="全部" />
          <ATabPane key="unread" tab="未读" />
          <ATabPane key="read" tab="已读" />
        </ATabs>

        <!-- List -->
        <div class="max-h-80 overflow-y-auto">
          <div
            v-for="item in filteredList"
            :key="item.id"
            class="flex flex-col gap-1 px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors"
            @click="handleItemClick(item)"
          >
            <div class="flex items-center justify-between">
              <span
                class="text-sm font-medium truncate flex-1"
                :class="item.status === 'unread' ? 'text-gray-900' : 'text-gray-600'"
              >
                {{ item.title }}
              </span>
              <ATag v-if="item.status === 'unread'" color="processing" class="!text-xs !px-1.5 !py-0.5 !leading-none !ml-2">未读</ATag>
            </div>
            <div class="text-xs text-gray-400 truncate">{{ item.content || '-' }}</div>
            <div class="text-xs text-gray-300">{{ item.created_at }}</div>
          </div>

          <!-- Empty -->
          <div v-if="!filteredList.length" class="flex flex-col items-center py-10 text-gray-300">
            <BellOutlined class="text-3xl mb-2" />
            <span class="text-sm">暂无消息</span>
          </div>
        </div>
      </div>
    </template>
  </ADropdown>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { BellOutlined } from '@ant-design/icons-vue'
import { fetchMessagePage, fetchMarkRead } from '@/api/message'
import { useWsStore } from '@/store'

const router = useRouter()
const wsStore = useWsStore()
const list = ref<any[]>([])
const activeTab = ref('all')

const filteredList = computed(() => {
  if (activeTab.value === 'all') return list.value
  return list.value.filter((item) => item.status === activeTab.value)
})

async function loadList() {
  try {
    const res = await fetchMessagePage({ current: 1, size: 10 })
    if (res.success && res.data) {
      list.value = res.data.records || []
    }
  } catch {}
}

async function handleItemClick(item: any) {
  if (item.status === 'unread') {
    try {
      await fetchMarkRead({ id: item.id })
      item.status = 'read'
      wsStore.loadUnreadCount()
    } catch {}
  }
}

watch(() => wsStore.unreadVersion, () => {
  loadList()
  wsStore.loadUnreadCount()
});

function onOpenChange(open: boolean) {
  if (open) {
    loadList()
    wsStore.loadUnreadCount()
  }
}

onMounted(() => {
  wsStore.loadUnreadCount()
  loadList()
})
</script>
