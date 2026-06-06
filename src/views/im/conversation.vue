<template>
  <div
    class="h-full flex flex-col bg-white rounded-lg shadow-sm"
    :style="{ height: 'calc(100vh - 120px)' }"
  >
    <!-- Header -->
    <div class="flex items-center gap-2 px-4 py-3 border-b border-gray-100 shrink-0">
      <ArrowLeftOutlined class="cursor-pointer text-base" @click="goBack" />
      <AAvatar
        :size="28"
        :src="convType === 'group' ? groupAvatar || undefined : otherAvatar || undefined"
      >
        <TeamOutlined v-if="convType === 'group'" />
        <template v-else>{{ otherNickname?.[0] || '?' }}</template>
      </AAvatar>
      <div class="flex flex-col">
        <span class="font-medium text-sm">{{ displayName || '对话' }}</span>
        <span v-if="convType === 'group' && memberCount" class="text-xs text-gray-400">
          {{ memberCount }} 人
        </span>
      </div>
      <div class="flex-1" />
      <AButton v-if="convType === 'group'" type="text" @click="showGroupInfo = true">
        <InfoCircleOutlined />
      </AButton>
    </div>

    <!-- Messages area -->
    <div class="flex-1 relative min-h-0">
      <div
        ref="messagesRef"
        class="absolute inset-0 overflow-y-auto px-4 py-3 space-y-3"
        @scroll="onScroll"
      >
        <div v-if="loadingMore" class="text-center text-gray-400 text-xs py-2">
          <LoadingOutlined class="mr-1" />
          加载中...
        </div>
        <div v-if="!hasMore && messages.length > 0" class="text-center text-gray-300 text-xs py-2">
          没有更多消息
        </div>

        <div
          v-for="msg in messages"
          :key="msg.id"
          class="flex flex-col"
          :class="
            String(msg.sender_id || '') === String(currentUserId) ? 'items-end' : 'items-start'
          "
        >
          <div v-if="msg.msg_type === 'SYSTEM'" class="text-center w-full">
            <span class="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
              {{ msg.content }}
            </span>
          </div>

          <template v-else>
            <div
              v-if="String(msg.sender_id || '') !== String(currentUserId)"
              class="text-xs text-gray-400 mb-0.5 ml-1"
            >
              {{ msg.sender_id }}
            </div>
            <div
              class="max-w-[70%] rounded-lg px-3 py-2 text-sm break-words group relative"
              :class="
                String(msg.sender_id || '') === String(currentUserId)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              "
            >
              <div v-if="msg.msg_type === 'IMAGE' && imageExtra(msg.extra)" class="mb-1">
                <img
                  :src="msg.file_url || imageExtra(msg.extra)!.thumbnail || msg.content"
                  :style="{ maxWidth: '240px', maxHeight: '240px', cursor: 'pointer' }"
                  class="rounded object-cover"
                  @click="previewImage(msg.file_url || msg.content)"
                />
              </div>

              <div
                v-else-if="msg.msg_type === 'FILE' && fileExtra(msg.extra)"
                class="flex items-center gap-2"
              >
                <FileOutlined class="text-lg" />
                <div class="flex-1 min-w-0">
                  <div class="text-sm truncate">{{ fileExtra(msg.extra)!.name }}</div>
                  <div class="text-xs opacity-70">
                    {{ formatFileSize(fileExtra(msg.extra)!.size) }}
                  </div>
                </div>
                <DownloadOutlined
                  class="cursor-pointer"
                  @click="downloadFile(msg.file_url || msg.content)"
                />
              </div>

              <div v-else>{{ msg.content }}</div>

              <div class="flex items-center justify-between gap-2 mt-1">
                <span
                  class="text-xs"
                  :class="
                    String(msg.sender_id || '') === String(currentUserId)
                      ? 'text-blue-200'
                      : 'text-gray-400'
                  "
                >
                  {{ msg.created_at }}
                </span>
                <span
                  v-if="canRecall(msg)"
                  class="text-xs cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                  :class="
                    String(msg.sender_id || '') === String(currentUserId)
                      ? 'text-blue-200'
                      : 'text-blue-500'
                  "
                  @click="handleRecall(msg)"
                >
                  撤回
                </span>
              </div>
            </div>
          </template>
        </div>

        <div v-if="!messages.length && !loadingMore" class="text-center text-gray-400 py-12">
          暂无消息
        </div>
      </div>

      <div
        v-if="hasNewMessage"
        class="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 cursor-pointer"
        @click="scrollToBottom"
      >
        <div
          class="bg-blue-500 text-white text-xs px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 hover:bg-blue-600 transition-colors"
        >
          <ArrowDownOutlined />
          <span>新消息</span>
        </div>
      </div>
    </div>

    <!-- Send area -->
    <div class="border-t border-gray-100 px-4 pt-3 pb-4 shrink-0 bg-white">
      <div class="flex gap-2 items-end">
        <div class="flex-1">
          <ATextarea
            v-model:value="sendContent"
            :rows="2"
            placeholder="输入消息..."
            @keydown.enter.exact.prevent="handleSend"
          />
          <div class="flex gap-1 mt-1">
            <AUpload :show-upload-list="false" :before-upload="beforeImageUpload" accept="image/*">
              <AButton type="text" :loading="uploading">
                <PictureOutlined />
                图片
              </AButton>
            </AUpload>
            <AUpload :show-upload-list="false" :before-upload="beforeFileUpload">
              <AButton type="text" :loading="uploading">
                <FileAddOutlined />
                文件
              </AButton>
            </AUpload>
          </div>
        </div>
        <AButton type="primary" :loading="sending" @click="handleSend">发送</AButton>
      </div>
    </div>

    <!-- Group Info Drawer -->
    <ADrawer v-model:open="showGroupInfo" title="群信息" placement="right" width="360">
      <template v-if="groupDetail">
        <div class="text-center mb-4">
          <AAvatar :size="64" :src="groupDetail.avatar || undefined"><TeamOutlined /></AAvatar>
          <div class="text-lg font-medium mt-2">{{ groupDetail.name }}</div>
          <div class="text-sm text-gray-500">{{ memberCount }} 人</div>
        </div>
        <ADivider />
        <div class="text-sm"><strong>群公告</strong></div>
        <div class="text-sm text-gray-600 mt-1 mb-4">{{ groupDetail.notice || '无' }}</div>
        <ADivider />
        <div class="text-sm font-medium mb-2">成员列表</div>
        <div v-for="m in members" :key="m.user_id" class="flex items-center gap-2 py-1">
          <AAvatar :size="24">{{ m.nickname?.[0] || m.user_id[0] }}</AAvatar>
          <div class="flex-1 text-sm">{{ m.nickname || m.user_id }}</div>
          <ATag v-if="m.role === 'owner'" color="gold">群主</ATag>
          <ATag v-else-if="m.role === 'admin'" color="blue">管理</ATag>
        </div>
      </template>
    </ADrawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message as antMsg } from 'ant-design-vue'
import {
  ArrowLeftOutlined,
  ArrowDownOutlined,
  InfoCircleOutlined,
  TeamOutlined,
  PictureOutlined,
  FileAddOutlined,
  LoadingOutlined,
  FileOutlined,
  DownloadOutlined,
} from '@ant-design/icons-vue'
import {
  fetchConversations,
  fetchConversationMessages,
  fetchMarkConversationRead,
  fetchSendMessage,
} from '@/api/im/message'
import type { ConversationItem, ConversationMessage } from '@/api/im/message'
import {
  fetchSendGroupMessage,
  fetchGroupMessages,
  fetchRecallMessage,
  fetchMarkGroupRead,
  fetchGroupDetail,
  fetchGroupMembers,
} from '@/api/im/group'
import type { MemberItem, GroupItem } from '@/api/im/group'
import { useWsStore } from '@/store'
import { useAuthStore } from '@/store/auth'
import { uploadImFile } from '@/api/im/file'

const route = useRoute()
const router = useRouter()
const wsStore = useWsStore()
const authStore = useAuthStore()

const currentUserId = ref(authStore.userInfo?.id || '')
const conversationId = ref((route.query.conversation_id as string) || '')
const userFriendId = ref((route.query.user_id as string) || '')
const userFriendType = ref((route.query.user_type as string) || '')
const isNewConversation = computed(() => !conversationId.value && !!userFriendId.value)

const convType = computed(() => {
  if (!conversationId.value && !userFriendId.value) return 'single'
  const cid = conversationId.value
  if (cid && cid.startsWith('group:')) return 'group'
  return 'single'
})
const groupId = computed(() => {
  if (convType.value === 'group' && conversationId.value) {
    return conversationId.value.substring(6)
  }
  return ''
})

// User/group info
const displayName = ref('')
const otherNickname = ref('')
const otherAvatar = ref('')
const otherUserId = ref('')
const otherUserType = ref('')
const groupName = ref('')
const groupAvatar = ref('')
const memberCount = ref(0)
const groupDetail = ref<GroupItem | null>(null)
const members = ref<MemberItem[]>([])
const showGroupInfo = ref(false)

// Messages
const messages = ref<ConversationMessage[]>([])
const loadingMore = ref(false)
const hasMore = ref(true)
const scrollLock = ref(false)
let scrollTimer: ReturnType<typeof setTimeout> | null = null
const hasNewMessage = ref(false)
const sendContent = ref('')
const sending = ref(false)
const uploading = ref(false)
const messagesRef = ref<HTMLElement | null>(null)

// messages is always ASC (oldest first)

function imageExtra(extra?: string): any {
  if (!extra) return null
  try {
    return JSON.parse(extra)
  } catch {
    return null
  }
}
function fileExtra(extra?: string): any {
  if (!extra) return null
  try {
    return JSON.parse(extra)
  } catch {
    return null
  }
}
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + 'B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB'
  return (bytes / 1024 / 1024).toFixed(1) + 'MB'
}
function previewImage(url: string) {
  window.open(url, '_blank')
}
function downloadFile(url: string) {
  window.open(url, '_blank')
}

function canRecall(msg: ConversationMessage): boolean {
  if (String(msg.sender_id || '') !== String(currentUserId.value)) return false
  if (msg.msg_type === 'SYSTEM') return false
  return Date.now() - new Date(msg.created_at.replace(' ', 'T')).getTime() < 5 * 60 * 1000
}

async function handleRecall(msg: ConversationMessage) {
  try {
    if (convType.value === 'group') {
      await fetchRecallMessage({ group_id: groupId.value, message_id: msg.id })
    } else {
      const { fetchRecallMessage: recallSingle } = await import('@/api/im/message')
      await recallSingle({ message_id: msg.id })
    }
    msg.content = '消息已被撤回'
    msg.msg_type = 'SYSTEM'
  } catch {}
}

async function loadUserInfo() {
  if (isNewConversation.value) {
    otherUserId.value = userFriendId.value
    otherUserType.value = userFriendType.value
    displayName.value = userFriendId.value
    return
  }
  try {
    const res = await fetchConversations()
    if (res.success && res.data) {
      const conv = ((res.data as any)?.records || []).find(
        (c: any) => c.conversation_id === conversationId.value
      )
      if (conv) {
        if (conv.conversation_type === 'group') {
          displayName.value = conv.group_name || ''
          memberCount.value = conv.member_count || 0
          groupAvatar.value = conv.group_avatar || ''
          try {
            const [d, m] = await Promise.all([
              fetchGroupDetail({ group_id: groupId.value }),
              fetchGroupMembers({ group_id: groupId.value }),
            ])
            if (d.success && d.data) groupDetail.value = d.data as any
            if (m.success && m.data) members.value = m.data as any
          } catch {}
        } else {
          otherNickname.value = conv.other_nickname || ''
          otherAvatar.value = conv.other_avatar || ''
          otherUserId.value = conv.other_user_id || ''
          otherUserType.value = conv.other_user_type || ''
          displayName.value = conv.other_nickname || ''
        }
      }
    }
  } catch {}
}

async function loadMessages(cursor?: string) {
  if (isNewConversation.value) {
    messages.value = []
    return
  }
  // Prevent concurrent scroll-triggered loads
  if (cursor && loadingMore.value) return
  if (cursor) loadingMore.value = true
  try {
    let records: ConversationMessage[] = []
    let more = false
    if (convType.value === 'group') {
      const res = await fetchGroupMessages({ group_id: groupId.value, cursor, size: 20 })
      if (res.success && res.data) {
        records = (res.data.records || []).map((m: any) => ({
          ...m,
          sender_id: m.sender_id || '',
        }))
        more = res.data.has_more
      }
    } else {
      const res = await fetchConversationMessages({
        conversation_id: conversationId.value,
        cursor,
        size: 20,
      })
      if (res.success && res.data) {
        records = res.data.records || []
        more = res.data.has_more
      }
    }

    const el = messagesRef.value
    const prevScrollHeight = el?.scrollHeight || 0

    if (cursor) {
      const existingIds = new Set(messages.value.map(m => m.id))
      const newRecords = records.filter(m => !existingIds.has(m.id))
      if (newRecords.length > 0) {
        messages.value = [...newRecords, ...messages.value]
        await nextTick()
        if (el) el.scrollTop = el.scrollHeight - prevScrollHeight
      }
      hasMore.value = more && records.length > 0
    } else {
      // Backend returns DESC for initial load, reverse to ASC
      messages.value = records.reverse()
      await nextTick()
      scrollToBottom()
      hasMore.value = more
    }
  } finally {
    loadingMore.value = false
  }
}

function onScroll(e: Event) {
  const el = e.target as HTMLElement
  // Debounce: reset timer on each scroll event
  if (scrollTimer) clearTimeout(scrollTimer)
  scrollTimer = setTimeout(() => {
    if (el.scrollTop < 80 && hasMore.value && !loadingMore.value) {
      // messages is ASC, oldest is at [0]
      const oldestMsg = messages.value[0]
      if (oldestMsg && oldestMsg.created_at) {
        loadMessages(oldestMsg.created_at)
      } else {
        hasMore.value = false
      }
    }
  }, 150)
  if (el.scrollHeight - el.scrollTop - el.clientHeight < 50) {
    hasNewMessage.value = false
  }
}

async function handleSend() {
  const content = sendContent.value.trim()
  if (!content) return
  sending.value = true
  const wasNew = isNewConversation.value
  try {
    if (convType.value === 'group') {
      await fetchSendGroupMessage({ group_id: groupId.value, content })
    } else {
      const sendRes = await fetchSendMessage({
        content,
        receiver_ids: [otherUserId.value],
        receiver_type: otherUserType.value,
      })
      // Use conversation_id from send response for new conversations
      if (wasNew && sendRes.success && (sendRes.data as any)?.conversation_id) {
        conversationId.value = (sendRes.data as any).conversation_id
        router.replace({ query: { conversation_id: conversationId.value } })
      }
    }
    sendContent.value = ''
    await loadMessages()
    await nextTick()
    scrollToBottom()
  } finally {
    sending.value = false
  }
}

function scrollToBottom() {
  hasNewMessage.value = false
  if (messagesRef.value) messagesRef.value.scrollTop = messagesRef.value.scrollHeight
}

function isAtBottom(): boolean {
  const el = messagesRef.value
  if (!el) return true
  return el.scrollHeight - el.scrollTop - el.clientHeight < 50
}

function goBack() {
  router.push('/im')
}

async function uploadAndSend(file: File, msgType: string) {
  uploading.value = true
  try {
    const res = await uploadImFile(file, msgType)
    if (res.success && res.data) {
      const fd = res.data
      const extra =
        msgType === 'IMAGE'
          ? JSON.stringify({ engine: fd.engine, bucket: fd.bucket, w: 0, h: 0, thumbnail: '' })
          : JSON.stringify({
              engine: fd.engine,
              bucket: fd.bucket,
              name: file.name,
              size: file.size,
              mime: file.type,
            })
      if (convType.value === 'group') {
        await fetchSendGroupMessage({
          group_id: groupId.value,
          content: fd.file_key,
          msg_type: msgType,
          extra,
        })
      } else {
        await fetchSendMessage({
          content: fd.file_key,
          msg_type: msgType,
          extra,
          receiver_ids: [otherUserId.value],
          receiver_type: otherUserType.value,
        })
      }
      await loadMessages()
      await nextTick()
      scrollToBottom()
    } else {
      antMsg.error('上传失败')
    }
  } catch {
    antMsg.error('上传失败')
  } finally {
    uploading.value = false
  }
}

function beforeImageUpload(file: File) {
  uploadAndSend(file, 'IMAGE')
  return false
}
function beforeFileUpload(file: File) {
  uploadAndSend(file, 'FILE')
  return false
}

watch(
  () => wsStore.conversationVersion,
  async () => {
    if (!isAtBottom()) {
      hasNewMessage.value = true
    } else {
      await loadMessages()
      await nextTick()
      scrollToBottom()
    }
  }
)

onMounted(async () => {
  await loadUserInfo()
  await loadMessages()
  try {
    if (convType.value === 'group') {
      await fetchMarkGroupRead({ group_id: groupId.value, message_id: '' })
    } else if (!isNewConversation.value) {
      await fetchMarkConversationRead({ conversation_id: conversationId.value })
    }
  } catch {}
  await nextTick()
  scrollToBottom()
})
</script>
