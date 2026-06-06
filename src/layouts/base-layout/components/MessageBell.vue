<template>
  <ADropdown :trigger="['click']" placement="bottomRight" :overlay-style="{ width: '380px' }" @openChange="onOpenChange">
    <div class="message-bell inline-flex items-center">
      <ABadge :count="totalUnread" :overflow-count="99" size="small">
        <BellOutlined class="text-lg cursor-pointer" />
      </ABadge>
    </div>
    <template #overlay>
      <div class="bg-white rounded-lg shadow-lg">
        <!-- Header -->
        <div class="flex items-center justify-between px-4 pt-3 pb-2">
          <span class="text-base font-medium text-gray-800">消息</span>
          <a-button type="link" size="small" @click="router.push('/im')">查看全部</a-button>
        </div>

        <!-- Tabs -->
        <ATabs v-model:activeKey="activeTab" :tab-bar-style="{ paddingLeft: '16px', marginBottom: 0 }" size="small">
          <ATabPane key="conversation" :tab="`对话${convUnread ? ' ('+convUnread+')' : ''}`" />
          <ATabPane key="broadcast" :tab="`通知${broadcastUnread ? ' ('+broadcastUnread+')' : ''}`" />
        </ATabs>

        <!-- Conversation list -->
        <div v-if="activeTab === 'conversation'" class="max-h-96 overflow-y-auto">
          <div
            v-for="conv in conversations"
            :key="conv.conversation_id"
            class="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50"
            @click="handleConvClick(conv)"
          >
            <AAvatar :size="36" :src="conv.conversation_type === 'group' ? (conv.group_avatar || undefined) : (conv.other_avatar || undefined)">
              <template v-if="conv.conversation_type === 'group'"><TeamOutlined /></template>
              <template v-else>{{ conv.other_nickname?.[0] || '?' }}</template>
            </AAvatar>

            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium truncate">
                  {{ conv.conversation_type === 'group' ? conv.group_name : (conv.other_nickname || conv.other_user_id) }}
                </span>
                <span class="text-xs text-gray-400 shrink-0 ml-2">{{ conv.last_time }}</span>
              </div>
              <div class="flex items-center justify-between mt-0.5">
                <span class="text-xs text-gray-500 truncate">{{ conv.last_content || '(空)' }}</span>
                <ABadge v-if="conv.unread_count > 0" :count="conv.unread_count" :overflow-count="99" size="small" class="shrink-0 ml-2" />
              </div>
              <div v-if="conv.conversation_type === 'group'" class="text-xs text-gray-400 mt-0.5">{{ conv.member_count }} 人</div>
            </div>
          </div>

          <div v-if="!conversations.length" class="flex flex-col items-center py-10 text-gray-300">
            <BellOutlined class="text-3xl mb-2" />
            <span class="text-sm">暂无对话</span>
          </div>
        </div>

        <!-- Broadcast list -->
        <div v-if="activeTab === 'broadcast'" class="max-h-96 overflow-y-auto">
          <div
            v-for="b in broadcasts"
            :key="b.id"
            class="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50"
            @click="handleBroadcastClick(b)"
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <ABadge v-if="!b.read" color="red" />
                <span class="text-sm font-medium truncate">{{ b.title }}</span>
                <span class="text-xs text-gray-400 shrink-0 ml-auto">{{ b.created_at }}</span>
              </div>
              <div class="text-xs text-gray-500 truncate mt-0.5">{{ b.content || '(空)' }}</div>
            </div>
          </div>

          <div v-if="!broadcasts.length" class="flex flex-col items-center py-10 text-gray-300">
            <BellOutlined class="text-3xl mb-2" />
            <span class="text-sm">暂无通知</span>
          </div>
        </div>
      </div>
    </template>
  </ADropdown>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { BellOutlined, TeamOutlined } from '@ant-design/icons-vue'
import { fetchConversations } from '@/api/im/message'
import type { ConversationItem } from '@/api/im/message'
import { fetchUnreadBroadcasts, fetchMarkBroadcastRead } from '@/api/im/broadcast'
import type { BroadcastItem } from '@/api/im/broadcast'
import { useWsStore } from '@/store'

const router = useRouter()
const wsStore = useWsStore()

const activeTab = ref('conversation')
const conversations = ref<ConversationItem[]>([])
const broadcasts = ref<BroadcastItem[]>([])
const loading = ref(false)

const convUnread = computed(() =>
  conversations.value.reduce((sum, c) => sum + c.unread_count, 0)
)

const broadcastUnread = computed(() =>
  broadcasts.value.filter(b => !b.read).length
)

const totalUnread = computed(() => convUnread.value + broadcastUnread.value)

async function loadConversations() {
  try {
    const res = await fetchConversations()
    if (res.success && res.data) {
      conversations.value = Array.isArray(res.data) ? res.data : ((res.data as any)?.records || [])
    }
  } catch {}
}

async function loadBroadcasts() {
  try {
    const res = await fetchUnreadBroadcasts()
    if (res.success && res.data) {
      broadcasts.value = Array.isArray(res.data) ? res.data : []
    }
  } catch {}
}

function loadAll() {
  Promise.all([loadConversations(), loadBroadcasts()])
}

function handleConvClick(conv: ConversationItem) {
  router.push({ path: '/im/conversation', query: { conversation_id: conv.conversation_id } })
}

function handleBroadcastClick(b: BroadcastItem) {
  router.push({ path: '/im', query: { tab: 'broadcasts' } })
  if (!b.read) {
    fetchMarkBroadcastRead({ broadcast_id: b.id }).catch(() => {})
    b.read = true
  }
}

function onOpenChange(open: boolean) {
  if (open) loadAll()
}

watch(() => wsStore.conversationVersion, () => {
  loadConversations()
})

onMounted(() => {
  loadAll()
})
</script>
