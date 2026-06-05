<template>
  <div class="max-w-3xl mx-auto mt-4 h-full flex flex-col bg-white rounded-lg shadow-sm" :style="{ height: 'calc(100vh - 180px)' }">
    <!-- Header -->
    <div class="flex items-center gap-2 px-4 py-3 border-b border-gray-100 shrink-0">
      <ArrowLeftOutlined class="cursor-pointer text-base" @click="goBack" />
      <AAvatar :size="28" :src="groupAvatar || undefined"><TeamOutlined v-if="!groupAvatar" /></AAvatar>
      <div class="flex flex-col">
        <span class="font-medium text-sm">{{ groupName || '群聊' }}</span>
        <span class="text-xs text-gray-400">{{ memberCount }} 人</span>
      </div>
      <div class="flex-1" />
      <AButton size="small" type="text" @click="showGroupInfo = true">
        <InfoCircleOutlined />
      </AButton>
    </div>

    <div class="flex-1 relative min-h-0">
      <div ref="messagesRef" class="h-full overflow-y-auto px-4 py-3 space-y-3" @scroll="onScroll">
        <div v-if="loadingMore" class="text-center text-gray-400 text-xs py-2"><LoadingOutlined class="mr-1" />加载中...</div>
        <div v-if="!hasMore && messages.length > 0" class="text-center text-gray-300 text-xs py-2">没有更多消息</div>

        <div v-for="msg in displayedMessages" :key="msg.id" class="flex flex-col"
          :class="String(msg.sender_id || '') === String(currentUserId) ? 'items-end' : 'items-start'">
          <div v-if="msg.msg_type === 'SYSTEM'" class="text-center w-full">
            <span class="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">{{ msg.content }}</span>
          </div>
          <template v-else>
            <div v-if="String(msg.sender_id || '') !== String(currentUserId)" class="text-xs text-gray-400 mb-0.5 ml-1">{{ msg.sender_id }}</div>
            <div class="max-w-[70%] rounded-lg px-3 py-2 text-sm break-words group relative"
              :class="String(msg.sender_id || '') === String(currentUserId) ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'">
              <div v-if="msg.msg_type === 'IMAGE' && imageExtra(msg.extra)" class="mb-1">
                <img :src="imageExtra(msg.extra)!.thumbnail || msg.content" :style="{ maxWidth: '240px', maxHeight: '240px', cursor: 'pointer' }" class="rounded object-cover" @click="previewImage(msg.content)" />
              </div>
              <div v-else-if="msg.msg_type === 'FILE' && fileExtra(msg.extra)" class="flex items-center gap-2">
                <FileOutlined class="text-lg" />
                <div class="flex-1 min-w-0">
                  <div class="text-sm truncate">{{ fileExtra(msg.extra)!.name }}</div>
                  <div class="text-xs opacity-70">{{ formatFileSize(fileExtra(msg.extra)!.size) }}</div>
                </div>
                <DownloadOutlined class="cursor-pointer" @click="downloadFile(msg.content)" />
              </div>
              <div v-else>{{ msg.content }}</div>
              <div class="flex items-center justify-between gap-2 mt-1">
                <span class="text-xs" :class="String(msg.sender_id || '') === String(currentUserId) ? 'text-blue-200' : 'text-gray-400'">{{ msg.created_at }}</span>
                <span v-if="canRecall(msg)" class="text-xs cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity text-blue-200" @click="handleRecall(msg)">撤回</span>
              </div>
            </div>
          </template>
        </div>
        <div v-if="!messages.length && !loadingMore" class="text-center text-gray-400 py-12">暂无消息</div>
      </div>
      <div v-if="hasNewMessage" class="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 cursor-pointer" @click="scrollToBottom">
        <div class="bg-blue-500 text-white text-xs px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 hover:bg-blue-600 transition-colors">
          <ArrowDownOutlined /><span>新消息</span>
        </div>
      </div>
    </div>

    <!-- Send area with upload -->
    <div class="border-t border-gray-100 px-4 pt-3 pb-4 shrink-0 bg-white">
      <div class="flex gap-2 items-end">
        <div class="flex-1">
          <ATextarea v-model:value="sendContent" :rows="2" placeholder="输入消息..." @keydown.enter.exact.prevent="handleSend" />
          <div class="flex gap-1 mt-1">
            <AUpload :show-upload-list="false" :before-upload="beforeImageUpload" accept="image/*">
              <AButton size="small" type="text" :loading="uploading"><PictureOutlined />图片</AButton>
            </AUpload>
            <AUpload :show-upload-list="false" :before-upload="beforeFileUpload">
              <AButton size="small" type="text" :loading="uploading"><PaperClipOutlined />文件</AButton>
            </AUpload>
            <span v-if="inviteLink" class="text-xs text-blue-500 cursor-pointer ml-2" @click="copyInviteLink">复制邀请链接</span>
          </div>
        </div>
        <AButton type="primary" :loading="sending" @click="handleSend">发送</AButton>
      </div>
    </div>

    <!-- Group Info Drawer -->
    <ADrawer v-model:open="showGroupInfo" title="群信息" placement="right" width="380px">
      <ADescriptions v-if="groupDetail" :column="1" size="small" bordered>
        <ADescriptionsItem label="群名称">{{ groupDetail.name }}</ADescriptionsItem>
        <ADescriptionsItem label="群类型">{{ groupDetail.group_type === 'consumer_only' ? '仅C端' : '混合' }}</ADescriptionsItem>
        <ADescriptionsItem label="成员数">{{ groupDetail.member_count }}</ADescriptionsItem>
        <ADescriptionsItem label="群公告">{{ groupDetail.notice || '无' }}</ADescriptionsItem>
        <ADescriptionsItem label="创建时间">{{ groupDetail.created_at }}</ADescriptionsItem>
      </ADescriptions>
      <ADivider>成员列表 ({{ members.length }})</ADivider>
      <div v-for="m in members" :key="m.user_id" class="flex items-center gap-2 py-2">
        <span class="text-sm">{{ m.nickname || m.user_id }}</span>
        <ATag v-if="m.role === 'owner'" color="gold" size="small">群主</ATag>
        <ATag v-else-if="m.role === 'admin'" color="blue" size="small">管理员</ATag>
        <span v-if="m.is_muted" class="text-xs text-red-400 ml-auto">禁言中</span>
      </div>
    </ADrawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message as antMsg } from 'ant-design-vue'
import { ArrowLeftOutlined, ArrowDownOutlined, LoadingOutlined, TeamOutlined, FileOutlined, DownloadOutlined, PictureOutlined, PaperClipOutlined, InfoCircleOutlined } from '@ant-design/icons-vue'
import { fetchGroupMessages, fetchSendGroupMessage, fetchRecallMessage, fetchGroupDetail, fetchGroupMembers, fetchMarkGroupRead } from '@/api/im/group'
import type { GroupMessageVO, GroupItem, MemberItem } from '@/api/im/group'
import { uploadFile } from '@/api/file'
import { useAuthStore } from '@/store/auth'
import { useWsStore } from '@/store'

interface FileExtra { name: string; size: number; mime: string }
interface ImageExtra { w?: number; h?: number; format?: string; thumbnail?: string }

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const wsStore = useWsStore()
const currentUserId = computed(() => authStore.userInfo?.id || '')
const groupId = route.query.group_id as string

const groupName = ref('')
const groupAvatar = ref('')
const memberCount = ref(0)
const groupDetail = ref<GroupItem | null>(null)
const members = ref<MemberItem[]>([])
const messages = ref<GroupMessageVO[]>([])
const hasMore = ref(true)
const loadingMore = ref(false)
const sendContent = ref('')
const sending = ref(false)
const uploading = ref(false)
const messagesRef = ref<HTMLElement | null>(null)
const hasNewMessage = ref(false)
const showGroupInfo = ref(false)
const inviteLink = ref('')

const displayedMessages = computed(() => [...messages.value].reverse())

function imageExtra(extra?: string): ImageExtra | null { if (!extra) return null; try { return JSON.parse(extra) } catch { return null } }
function fileExtra(extra?: string): FileExtra | null { if (!extra) return null; try { return JSON.parse(extra) } catch { return null } }
function formatFileSize(bytes: number): string { if (bytes < 1024) return bytes + 'B'; if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB'; return (bytes / 1024 / 1024).toFixed(1) + 'MB' }
function previewImage(url: string) { window.open(url, '_blank') }
function downloadFile(url: string) { window.open(url, '_blank') }

function isOwnMsg(msg: { sender_id: string }): boolean {
  return String(msg.sender_id || '') === String(currentUserId.value)
}

function canRecall(msg: GroupMessageVO): boolean {
  if (!isOwnMsg(msg)) return false
  if (msg.msg_type === 'SYSTEM') return false
  return Date.now() - new Date(msg.created_at.replace(' ', 'T')).getTime() < 5 * 60 * 1000
}

async function handleRecall(msg: GroupMessageVO) {
  try {
    const res = await fetchRecallMessage({ group_id: groupId, message_id: msg.id })
    if (res.success) { msg.content = '消息已被撤回'; msg.msg_type = 'SYSTEM' }
  } catch {}
}

async function uploadAndSend(file: File, msgType: string) {
  uploading.value = true
  try {
    const res = await uploadFile(file)
    if (res.success && res.data) {
      const fileUrl = res.data.url || res.data.path
      const extra = msgType === 'IMAGE'
        ? JSON.stringify({ w: 0, h: 0, thumbnail: fileUrl })
        : JSON.stringify({ name: file.name, size: file.size, mime: file.type })
      await fetchSendGroupMessage({ group_id: groupId, content: fileUrl, msg_type: msgType, extra })
      await loadMessages()
      await nextTick()
      scrollToBottom()
    } else {
      antMsg.error('上传失败')
    }
  } catch { antMsg.error('上传失败') } finally { uploading.value = false }
}

function beforeImageUpload(file: File) { uploadAndSend(file, 'IMAGE'); return false }
function beforeFileUpload(file: File) { uploadAndSend(file, 'FILE'); return false }

async function loadGroupInfo() {
  try {
    const [d, m] = await Promise.all([
      fetchGroupDetail({ group_id: groupId }),
      fetchGroupMembers({ group_id: groupId }),
    ])
    if (d.success && d.data) {
      groupDetail.value = d.data
      groupName.value = d.data.name
      groupAvatar.value = d.data.avatar
      memberCount.value = d.data.member_count || 0
      inviteLink.value = `${location.origin}/c/im/group/messages?group_id=${groupId}`
    }
    if (m.success && m.data) members.value = m.data
  } catch {}
}

async function loadMessages(cursor?: string) {
  if (cursor) loadingMore.value = true
  try {
    const res = await fetchGroupMessages({ group_id: groupId, cursor, size: 20 })
    if (res.success && res.data) {
      const el = messagesRef.value; const prev = el?.scrollHeight || 0
      if (cursor) { const ids = new Set(messages.value.map(m => m.id)); const n = (res.data.records || []).filter(m => !ids.has(m.id)); messages.value = [...n, ...messages.value]; await nextTick(); if (el) el.scrollTop = el.scrollHeight - prev }
      else { messages.value = res.data.records || []; await nextTick(); scrollToBottom() }
      hasMore.value = res.data.has_more
    }
  } finally { loadingMore.value = false }
}

function onScroll(e: Event) {
  const el = e.target as HTMLElement
  if (el.scrollTop < 80 && hasMore.value && !loadingMore.value) { const o = messages.value[0]; if (o) loadMessages(o.created_at) }
  if (el.scrollHeight - el.scrollTop - el.clientHeight < 80) hasNewMessage.value = false
}

async function handleSend() {
  const c = sendContent.value.trim()
  if (!c) return; sending.value = true
  try { const r = await fetchSendGroupMessage({ group_id: groupId, content: c }); if (r.success) { sendContent.value = ''; await loadMessages(); await nextTick(); scrollToBottom() } } finally { sending.value = false }
}

function scrollToBottom() { hasNewMessage.value = false; if (messagesRef.value) messagesRef.value.scrollTop = messagesRef.value.scrollHeight }
function goBack() { router.push('/message') }

function copyInviteLink() {
  navigator.clipboard.writeText(inviteLink.value).then(() => antMsg.success('邀请链接已复制'))
}

watch(() => wsStore.conversationVersion, () => { loadMessages() })
onMounted(async () => { await loadGroupInfo(); await loadMessages(); try { await fetchMarkGroupRead({ group_id: groupId, message_id: '' }) } catch {}; await nextTick(); scrollToBottom() })
</script>
