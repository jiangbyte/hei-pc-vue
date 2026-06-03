<template>
  <ACard :bordered="false" class="message-page max-w-3xl mx-auto mt-4">
    <template #title>
      <div class="flex items-center justify-between">
        <span>站内信</span>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">未读: {{ totalUnread }} 条</span>
          <AButton type="primary" size="small" @click="showSendModal = true">
            <template #icon><PlusOutlined /></template>
            发送消息
          </AButton>
        </div>
      </div>
    </template>

    <div v-if="loading" class="text-center py-12 text-gray-400">加载中...</div>
    <div v-else-if="!conversations.length" class="text-center py-12 text-gray-400">暂无消息</div>

    <div v-else class="-mx-4 -mb-4">
      <div
        v-for="conv in conversations"
        :key="conv.conversation_id"
        class="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition border-b border-gray-100"
        @click="openConversation(conv)"
      >
        <AAvatar :size="40" :src="conv.other_avatar || undefined">
          {{ conv.other_nickname?.[0] || '?' }}
        </AAvatar>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <span class="font-medium text-sm truncate">{{ conv.other_nickname || conv.other_user_id }}</span>
            <span class="text-xs text-gray-400 shrink-0">{{ conv.last_time }}</span>
          </div>
          <div class="flex items-center justify-between mt-1">
            <span class="text-xs text-gray-500 truncate">{{ conv.last_content || '(空)' }}</span>
            <ABadge v-if="conv.unread_count > 0" :count="conv.unread_count" :overflow-count="99" size="small" class="shrink-0" />
          </div>
        </div>
      </div>
    </div>

    <!-- Send Modal -->
    <AModal v-model:open="showSendModal" title="发送消息" @ok="handleSendModal" :confirm-loading="sending" width="600px">
      <AForm :model="sendForm" layout="vertical">
        <AFormItem label="接收方类型" required>
          <ARadioGroup v-model:value="sendForm.receiverType">
            <ARadio value="CONSUMER">用户</ARadio>
            <ARadio value="BUSINESS">管理员</ARadio>
          </ARadioGroup>
        </AFormItem>
        <AFormItem label="接收用户ID" required>
          <ASelect
            v-model:value="sendForm.receiverIds"
            mode="tags"
            placeholder="输入用户ID，回车添加"
            style="width: 100%"
            :options="[]"
          />
          <div class="text-xs text-gray-400 mt-1">输入接收用户的ID后按回车添加，支持多人</div>
        </AFormItem>
        <AFormItem label="标题" required>
          <AInput v-model:value="sendForm.title" placeholder="消息标题" />
        </AFormItem>
        <AFormItem label="内容">
          <ATextarea v-model:value="sendForm.content" :rows="4" placeholder="消息内容（可选）" />
        </AFormItem>
      </AForm>
    </AModal>
  </ACard>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { fetchConversations, fetchSendMessage } from '@/api/message'
import type { ConversationItem } from '@/api/message'
import { useWsStore } from '@/store'

const router = useRouter()
const wsStore = useWsStore()
const loading = ref(true)
const conversations = ref<ConversationItem[]>([])
const totalUnread = ref(0)

// Send modal
const showSendModal = ref(false)
const sending = ref(false)

const sendForm = ref({
  title: '',
  content: '',
  receiverType: 'CONSUMER',
  receiverIds: [] as string[],
})

async function loadConversations() {
  loading.value = true
  try {
    const res = await fetchConversations()
    if (res.success && res.data) {
      conversations.value = res.data
      totalUnread.value = res.data.reduce((sum, c) => sum + c.unread_count, 0)
      wsStore.loadUnreadCount()
    }
  } finally {
    loading.value = false
  }
}

function openConversation(conv: ConversationItem) {
  router.push({
    path: '/message/conversation',
    query: { conversation_id: conv.conversation_id },
  })
}

async function handleSendModal() {
  if (!sendForm.value.title) {
    message.warning('请输入消息标题')
    return
  }
  if (!sendForm.value.receiverIds.length) {
    message.warning('请填写接收用户ID')
    return
  }
  sending.value = true
  try {
    const res = await fetchSendMessage({
      title: sendForm.value.title,
      content: sendForm.value.content || undefined,
      receiver_ids: sendForm.value.receiverIds,
      receiver_type: sendForm.value.receiverType,
    })
    if (res.success) {
      message.success('发送成功')
      showSendModal.value = false
      sendForm.value = { title: '', content: '', receiverType: 'CONSUMER', receiverIds: [] }
      loadConversations()
    }
  } finally {
    sending.value = false
  }
}

watch(() => wsStore.unreadVersion, () => {
  loadConversations()
})

onMounted(loadConversations)
</script>
