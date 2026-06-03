<template>
  <ACard :bordered="false" class="flex flex-col max-w-3xl mx-auto mt-4" :style="{ height: 'calc(100vh - 180px)' }">
    <template #title>
      <div class="flex items-center gap-2">
        <ArrowLeftOutlined class="cursor-pointer" @click="goBack" />
        <AAvatar :size="28" :src="otherAvatar || undefined">
          {{ otherNickname?.[0] || '?' }}
        </AAvatar>
        <span class="font-medium">{{ otherNickname || '对话' }}</span>
      </div>
    </template>

    <!-- Messages -->
    <div ref="messagesRef" class="flex-1 overflow-y-auto -mx-4 -mt-1 px-4 space-y-3 py-3" @scroll="onScroll">
      <div v-if="loadingMore" class="text-center text-gray-400 text-xs py-2">加载中...</div>
      <div v-if="!hasMore && messages.length > 0" class="text-center text-gray-300 text-xs py-2">没有更多消息</div>

      <div
        v-for="msg in displayedMessages"
        :key="msg.id"
        class="flex"
        :class="msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'"
      >
        <div
          class="max-w-[70%] rounded-lg px-3 py-2 text-sm break-words"
          :class="msg.sender_id === currentUserId
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-800'"
        >
          <div>{{ msg.content || '' }}</div>
          <div
            class="text-xs mt-1"
            :class="msg.sender_id === currentUserId ? 'text-blue-200' : 'text-gray-400'"
          >
            {{ msg.created_at }}
          </div>
        </div>
      </div>

      <div v-if="!messages.length && !loadingMore" class="text-center text-gray-400 py-12">
        暂无消息
      </div>
    </div>

    <!-- Send area -->
    <div class="border-t border-gray-100 -mx-4 -mb-4 px-4 pt-3 pb-4">
      <div class="flex gap-2">
        <ATextarea
          v-model:value="sendContent"
          :rows="2"
          placeholder="输入消息..."
          @keydown.enter.exact.prevent="handleSend"
        />
        <AButton type="primary" :loading="sending" @click="handleSend" class="shrink-0">
          发送
        </AButton>
      </div>
    </div>
  </ACard>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeftOutlined } from '@ant-design/icons-vue'
import {
  fetchConversationMessages,
  fetchConversations,
  fetchSendMessage,
  fetchMarkConversationRead,
} from '@/api/message'
import type { ConversationItem, ConversationMessage } from '@/api/message'
import { useAuthStore } from '@/store/auth'
import { useWsStore } from '@/store'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const wsStore = useWsStore()
const currentUserId = computed(() => authStore.userInfo?.id || '')

const conversationId = route.query.conversation_id as string

const otherNickname = ref('')
const otherAvatar = ref('')
const otherUserId = ref('')
const otherUserType = ref('')

const messages = ref<ConversationMessage[]>([])
const hasMore = ref(true)
const loadingMore = ref(false)
const sendContent = ref('')
const sending = ref(false)
const messagesRef = ref<HTMLElement | null>(null)

const displayedMessages = computed(() => [...messages.value].reverse())

async function loadUserInfo() {
  try {
    const res = await fetchConversations()
    if (res.success && res.data) {
      const conv = res.data.find((c: ConversationItem) => c.conversation_id === conversationId)
      if (conv) {
        otherNickname.value = conv.other_nickname
        otherAvatar.value = conv.other_avatar
        otherUserId.value = conv.other_user_id
        otherUserType.value = conv.other_user_type
      }
    }
  } catch {}
}

async function loadMessages(cursor?: string) {
  if (cursor) loadingMore.value = true
  try {
    const res = await fetchConversationMessages({
      conversation_id: conversationId,
      cursor,
      size: 20,
    })
    if (res.success && res.data) {
      if (cursor) {
        messages.value = [...(res.data.records || []), ...messages.value]
      } else {
        messages.value = res.data.records || []
      }
      hasMore.value = res.data.has_more
    }
  } finally {
    loadingMore.value = false
  }
}

function onScroll(e: Event) {
  const el = e.target as HTMLElement
  if (el.scrollTop < 50 && hasMore.value && !loadingMore.value) {
    const lastMsg = messages.value[0]
    if (lastMsg) loadMessages(lastMsg.created_at)
  }
}

async function handleSend() {
  const content = sendContent.value.trim()
  if (!content) return

  sending.value = true
  try {
    const res = await fetchSendMessage({
      title: content.length > 50 ? content.slice(0, 50) + '...' : content,
      content,
      receiver_ids: [otherUserId.value],
      receiver_type: otherUserType.value,
    })
    if (res.success) {
      sendContent.value = ''
      await loadMessages()
      await nextTick()
      scrollToBottom()
    }
  } finally {
    sending.value = false
  }
}

function scrollToBottom() {
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  }
}

function goBack() {
  router.push('/message')
}

watch(() => wsStore.unreadVersion, () => {
  loadMessages()
})

onMounted(async () => {
  await loadUserInfo()
  await loadMessages()
  try {
    await fetchMarkConversationRead({ conversation_id: conversationId })
  } catch {}
  await nextTick()
  scrollToBottom()
})
</script>
