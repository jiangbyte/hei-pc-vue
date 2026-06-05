<template>
  <ACard :bordered="false" class="message-page max-w-3xl mx-auto mt-4">
    <template #title>
      <div class="flex items-center justify-between">
        <span>站内信</span>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">未读: {{ totalUnread }} 条</span>
        </div>
      </div>
    </template>

    <ATabs v-model:activeKey="activeTab">
      <ATabPane key="conversations" tab="对话">
        <template #extra>
          <AButton type="primary" size="small" @click="showCreateGroup = true">
            <template #icon><PlusOutlined /></template>创建群
          </AButton>
        </template>

        <div v-if="loading" class="text-center py-12 text-gray-400">加载中...</div>
        <div v-else-if="!conversations.length" class="text-center py-12 text-gray-400">暂无对话</div>

        <div v-else class="-mx-4 -mb-4">
          <div
            v-for="conv in conversations"
            :key="conv.conversation_id"
            class="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition border-b border-gray-100"
            @click="openConversation(conv)"
          >
            <AAvatar :size="40" :src="conv.conversation_type === 'group' ? (conv.group_avatar || undefined) : (conv.other_avatar || undefined)">
              <template v-if="conv.conversation_type === 'group'"><TeamOutlined /></template>
              <template v-else>{{ conv.other_nickname?.[0] || '?' }}</template>
            </AAvatar>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <span class="font-medium text-sm truncate">
                  {{ conv.conversation_type === 'group' ? conv.group_name : (conv.other_nickname || conv.other_user_id) }}
                </span>
                <span class="text-xs text-gray-400 shrink-0">{{ conv.last_time }}</span>
              </div>
              <div class="flex items-center justify-between mt-1">
                <span class="text-xs text-gray-500 truncate">{{ conv.last_content || '(空)' }}</span>
                <ABadge v-if="conv.unread_count > 0" :count="conv.unread_count" :overflow-count="99" size="small" class="shrink-0" />
              </div>
              <div v-if="conv.conversation_type === 'group'" class="text-xs text-gray-400 mt-0.5">{{ conv.member_count }} 人 · 群聊</div>
            </div>
          </div>
        </div>

        <!-- Create Group Modal -->
        <AModal v-model:open="showCreateGroup" title="创建群" @ok="handleCreateGroup" :confirm-loading="creating" width="500px">
          <AForm layout="vertical">
            <AFormItem label="群名称" required>
              <AInput v-model:value="groupForm.name" placeholder="输入群名称" />
            </AFormItem>
            <AFormItem label="邀请成员ID（可选，逗号分隔）">
              <AInput v-model:value="groupForm.memberIdsStr" placeholder="输入成员ID，逗号分隔" />
            </AFormItem>
          </AForm>
        </AModal>
      </ATabPane>

      <ATabPane key="friends" tab="好友">
        <template #extra>
          <AButton type="primary" size="small" @click="showAddFriend = true">
            <template #icon><UserAddOutlined /></template>添加好友
          </AButton>
        </template>

        <div v-if="friendsLoading" class="text-center py-12 text-gray-400">加载中...</div>
        <div v-else-if="!friends.length && !pendingIncoming.length" class="text-center py-12 text-gray-400">暂无好友</div>

        <div v-if="pendingIncoming.length" class="mb-4">
          <div class="text-sm font-medium text-gray-500 mb-2">好友请求 ({{ pendingIncoming.length }})</div>
          <div v-for="req in pendingIncoming" :key="req.id" class="flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-lg mb-2">
            <div class="flex-1 min-w-0">
              <div class="text-sm truncate">{{ req.sender_id }}</div>
              <div v-if="req.remark" class="text-xs text-gray-500">{{ req.remark }}</div>
            </div>
            <AButton size="small" type="primary" @click="handleAccept(req)">接受</AButton>
            <AButton size="small" @click="handleReject(req)">拒绝</AButton>
          </div>
        </div>

        <div v-for="f in friends" :key="f.user_id" class="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <AAvatar :size="40">{{ f.nickname?.[0] || '?' }}</AAvatar>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium truncate">{{ f.nickname || f.user_id }}</div>
          </div>
          <AButton size="small" type="link" @click="chatWithFriend(f)">发消息</AButton>
          <APopconfirm title="确定删除好友?" @confirm="handleRemoveFriend(f)">
            <AButton size="small" type="text" danger>删除</AButton>
          </APopconfirm>
        </div>
      </ATabPane>
    </ATabs>

    <!-- Add Friend Modal -->
    <AModal v-model:open="showAddFriend" title="添加好友" footer null width="500px">
      <AInputSearch v-model:value="searchKeyword" placeholder="搜索用户名/昵称" @search="handleSearch" enter-button />
      <div v-if="searchResults.length" class="mt-4">
        <div v-for="u in searchResults" :key="u.user_id" class="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <AAvatar :size="36">{{ u.nickname?.[0] || '?' }}</AAvatar>
          <div class="flex-1 min-w-0">
            <div class="text-sm truncate">{{ u.nickname || u.user_id }}</div>
          </div>
          <AButton size="small" type="primary" @click="handleSendRequest(u)">添加好友</AButton>
        </div>
      </div>
      <div v-if="searched && !searchResults.length" class="text-center py-8 text-gray-400">未找到用户</div>
    </AModal>
  </ACard>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { PlusOutlined, TeamOutlined, UserAddOutlined } from '@ant-design/icons-vue'
import { fetchConversations } from '@/api/message'
import { fetchCreateGroup } from '@/api/im/group'
import type { ConversationItem } from '@/api/message'
import {
  fetchFriendList,
  fetchPendingRequests,
  fetchSendFriendRequest,
  fetchAcceptFriendRequest,
  fetchRejectFriendRequest,
  fetchRemoveFriend,
  fetchSearchUsers,
} from '@/api/im/friend'
import type { FriendItem, FriendRequestItem, SearchUserResult } from '@/api/im/friend'
import { useWsStore } from '@/store'

const router = useRouter()
const wsStore = useWsStore()

const activeTab = ref('conversations')

// Conversations
const loading = ref(true)
const conversations = ref<ConversationItem[]>([])
const totalUnread = ref(0)
const showCreateGroup = ref(false)
const creating = ref(false)
const groupForm = ref({ name: '', memberIdsStr: '' })

// Friends
const friendsLoading = ref(true)
const friends = ref<FriendItem[]>([])
const pendingIncoming = ref<FriendRequestItem[]>([])
const showAddFriend = ref(false)
const searchKeyword = ref('')
const searchResults = ref<SearchUserResult[]>([])
const searched = ref(false)

// ===== Conversations =====

async function loadConversations() {
  loading.value = true
  try {
    const res = await fetchConversations()
    if (res.success && res.data) {
      conversations.value = res.data
      totalUnread.value = res.data.reduce((sum, c) => sum + c.unread_count, 0)
      wsStore.loadUnreadCount()
    }
  } finally { loading.value = false }
}

function openConversation(conv: ConversationItem) {
  router.push({ path: '/message/conversation', query: { conversation_id: conv.conversation_id } })
}

async function handleCreateGroup() {
  if (!groupForm.value.name) { message.warning('请输入群名称'); return }
  creating.value = true
  try {
    const memberIds = groupForm.value.memberIdsStr
      ? groupForm.value.memberIdsStr.split(',').map(s => s.trim()).filter(Boolean)
      : []
    const res = await fetchCreateGroup({
      name: groupForm.value.name,
      member_ids: memberIds,
      member_type: memberIds.length ? 'CONSUMER' : undefined,
    })
    if (res.success) {
      message.success('创建成功')
      showCreateGroup.value = false
      groupForm.value = { name: '', memberIdsStr: '' }
      loadConversations()
    }
  } finally { creating.value = false }
}

// ===== Friends =====

async function loadFriends() {
  friendsLoading.value = true
  try {
    const [listRes, reqRes] = await Promise.all([
      fetchFriendList(),
      fetchPendingRequests(),
    ])
    if (listRes.success && listRes.data) friends.value = listRes.data
    if (reqRes.success && reqRes.data) {
      pendingIncoming.value = reqRes.data.incoming || []
    }
  } finally { friendsLoading.value = false }
}

function chatWithFriend(f: FriendItem) {
  const conv = conversations.value.find(c => c.other_user_id === f.user_id && c.other_user_type === f.user_type)
  if (conv) {
    router.push({ path: '/message/conversation', query: { conversation_id: conv.conversation_id } })
  } else {
    message.info('请先发送一条消息开始对话')
  }
}

async function handleAccept(req: FriendRequestItem) {
  try {
    const res = await fetchAcceptFriendRequest({ request_id: req.id })
    if (res.success) { message.success('已添加好友'); loadFriends() }
  } catch { message.error('操作失败') }
}

async function handleReject(req: FriendRequestItem) {
  try {
    const res = await fetchRejectFriendRequest({ request_id: req.id })
    if (res.success) { message.success('已拒绝'); loadFriends() }
  } catch { message.error('操作失败') }
}

async function handleRemoveFriend(f: FriendItem) {
  try {
    const res = await fetchRemoveFriend({ friend_id: f.user_id, friend_type: f.user_type })
    if (res.success) { message.success('已删除'); loadFriends() }
  } catch { message.error('操作失败') }
}

async function handleSearch() {
  const kw = searchKeyword.value.trim()
  if (!kw) return
  searched.value = true
  try {
    const res = await fetchSearchUsers({ keyword: kw })
    if (res.success && res.data) searchResults.value = res.data
  } catch { searchResults.value = [] }
}

async function handleSendRequest(u: SearchUserResult) {
  try {
    const res = await fetchSendFriendRequest({ receiver_id: u.user_id, receiver_type: u.user_type })
    if (res.success) {
      message.success('好友请求已发送')
      searchResults.value = []
      searchKeyword.value = ''
      showAddFriend.value = false
    }
  } catch { message.error('操作失败') }
}

watch(() => activeTab.value, (tab) => {
  if (tab === 'friends') loadFriends()
})

watch(() => wsStore.conversationVersion, () => {
  if (activeTab.value === 'conversations') loadConversations()
})

onMounted(async () => {
  await loadConversations()
  if (activeTab.value === 'friends') loadFriends()
})
</script>
