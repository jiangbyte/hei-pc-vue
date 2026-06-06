<template>
  <ACard :bordered="false" class="message-page">
    <template #title>
      <div class="flex items-center justify-between">
        <span>即时通讯</span>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">未读: {{ totalUnread }} 条</span>
        </div>
      </div>
    </template>

    <ATabs v-model:activeKey="activeTab">
      <template #rightExtra>
        <template v-if="activeTab === 'friends'">
          <AButton type="primary" @click="showAddFriend = true">
            <template #icon><UserAddOutlined /></template>
            添加好友
          </AButton>
        </template>
        <template v-if="activeTab === 'groups'">
          <AButton type="primary" @click="showCreateGroup = true" class="mr-2">
            <template #icon><PlusOutlined /></template>
            创建群
          </AButton>
          <AInputSearch
            v-model:value="groupKeyword"
            placeholder="搜索群名称"
            @search="handleSearchGroups"
            enter-button
            style="width: 180px"
          />
        </template>
      </template>

      <ATabPane key="conversations" tab="对话">
        <div v-if="loading" class="text-center py-12 text-gray-400">加载中...</div>
        <div v-else-if="!conversations.length" class="text-center py-12 text-gray-400">
          暂无对话
        </div>

        <div v-else class="-mx-4 -mb-4">
          <div
            v-for="conv in conversations"
            :key="conv.conversation_id"
            class="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition border-b border-gray-100"
            @click="openConversation(conv)"
          >
            <AAvatar
              :size="40"
              :src="
                conv.conversation_type === 'group'
                  ? conv.group_avatar || undefined
                  : conv.other_avatar || undefined
              "
            >
              <template v-if="conv.conversation_type === 'group'"><TeamOutlined /></template>
              <template v-else>{{ conv.other_nickname?.[0] || '?' }}</template>
            </AAvatar>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <span class="font-medium text-sm truncate">
                  {{
                    conv.conversation_type === 'group'
                      ? conv.group_name
                      : conv.other_nickname || conv.other_user_id
                  }}
                </span>
                <span class="text-xs text-gray-400 shrink-0">{{ conv.last_time }}</span>
              </div>
              <div class="flex items-center justify-between mt-1">
                <span class="text-xs text-gray-500 truncate">
                  {{ conv.last_content || '(空)' }}
                </span>
                <ABadge
                  v-if="conv.unread_count > 0"
                  :count="conv.unread_count"
                  :overflow-count="99"
                  class="shrink-0"
                />
              </div>
              <div v-if="conv.conversation_type === 'group'" class="text-xs text-gray-400 mt-0.5">
                {{ conv.member_count }} 人 · 群聊
              </div>
            </div>
          </div>
        </div>
      </ATabPane>

      <ATabPane key="friends" tab="好友">
        <div v-if="friendsLoading" class="text-center py-12 text-gray-400">加载中...</div>
        <div
          v-else-if="!friends.length && !pendingIncoming.length"
          class="text-center py-12 text-gray-400"
        >
          暂无好友
        </div>

        <div v-if="pendingIncoming.length" class="mb-4">
          <div class="text-sm font-medium text-gray-500 mb-2">
            好友请求 ({{ pendingIncoming.length }})
          </div>
          <div
            v-for="req in pendingIncoming"
            :key="req.id"
            class="flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-lg mb-2"
          >
            <div class="flex-1 min-w-0">
              <div class="text-sm truncate">{{ req.sender_id }}</div>
              <div v-if="req.remark" class="text-xs text-gray-500">{{ req.remark }}</div>
            </div>
            <AButton type="primary" @click="handleAccept(req)">接受</AButton>
            <AButton @click="handleReject(req)">拒绝</AButton>
          </div>
        </div>

        <div
          v-for="f in friends"
          :key="f.user_id"
          class="flex items-center gap-3 px-4 py-3 border-b border-gray-100"
        >
          <AAvatar :size="40">{{ f.nickname?.[0] || '?' }}</AAvatar>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium truncate">{{ f.nickname || f.user_id }}</div>
            <div class="text-xs text-gray-400">
              {{ f.user_type === 'CONSUMER' ? 'C端' : '后台' }}用户
            </div>
          </div>
          <AButton type="link" @click="chatWithFriend(f)">发消息</AButton>
          <APopconfirm title="确定删除好友?" @confirm="handleRemoveFriend(f)">
            <AButton type="text" danger>删除</AButton>
          </APopconfirm>
        </div>
      </ATabPane>

      <ATabPane key="groups" tab="群组">
        <div v-if="loadingMyGroups" class="text-center py-6 text-gray-400">加载中...</div>
        <div v-else-if="myGroups.length > 0">
          <div class="text-sm font-medium text-gray-500 mb-2">我的群组</div>
          <div
            v-for="g in myGroups"
            :key="g.id"
            class="flex items-center gap-3 px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
            @click="openGroup(g)"
          >
            <AAvatar :size="40" :src="g.avatar || undefined"><TeamOutlined /></AAvatar>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <span class="font-medium text-sm truncate">{{ g.name }}</span>
                <span class="text-xs text-gray-400">{{ g.member_count }} 人</span>
              </div>
              <div class="text-xs text-gray-500 truncate">{{ g.last_content || '(空)' }}</div>
            </div>
            <ABadge v-if="g.unread_count > 0" :count="g.unread_count" :overflow-count="99" />
          </div>
        </div>
        <div v-else class="text-center py-12 text-gray-400">暂无群组</div>

        <div v-if="searchedGroup && searchGroupResults.length > 0" class="mt-4">
          <div class="text-sm font-medium text-gray-500 mb-2">搜索结果</div>
          <div
            v-for="g in searchGroupResults"
            :key="'s' + g.id"
            class="flex items-center gap-3 px-4 py-3 border-b border-gray-100"
          >
            <AAvatar :size="40" :src="g.avatar || undefined"><TeamOutlined /></AAvatar>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium truncate">{{ g.name }}</div>
              <div class="text-xs text-gray-400">{{ g.member_count }} 人</div>
            </div>
            <AButton v-if="g.is_member" @click="openGroup(g)">进入</AButton>
            <AButton v-else type="primary" @click="handleJoinGroup(g)">加入</AButton>
          </div>
        </div>

        <div v-if="searchingGroup" class="text-center py-4 text-gray-400">
          <LoadingOutlined />
          搜索中...
        </div>
        <div
          v-else-if="searchedGroup && !searchGroupResults.length"
          class="text-center py-4 text-gray-400"
        >
          未找到匹配的群组
        </div>
      </ATabPane>

      <ATabPane key="broadcasts" tab="通知">
        <div v-if="loadingBroadcasts" class="text-center py-12 text-gray-400">加载中...</div>
        <div v-else-if="!broadcasts.length" class="text-center py-12 text-gray-400">暂无通知</div>
        <div v-else>
          <div
            v-for="b in broadcasts"
            :key="b.id"
            class="flex items-start gap-3 px-4 py-3 border-b border-gray-100"
            @click="showBroadcastDetail(b)"
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <ABadge v-if="!b.read" color="red" />
                <span class="font-medium text-sm truncate">{{ b.title }}</span>
                <span class="text-xs text-gray-400 shrink-0">{{ b.created_at }}</span>
              </div>
              <div class="text-xs text-gray-500 truncate mt-0.5">{{ b.content || '(空)' }}</div>
              <ATag v-if="b.scope === 'BUSINESS'" color="blue" class="mt-1">后台</ATag>
              <ATag v-else-if="b.scope === 'CONSUMER'" color="green" class="mt-1">C端</ATag>
              <ATag v-else color="purple" class="mt-1">全站</ATag>
            </div>
          </div>
        </div>
      </ATabPane>
    </ATabs>

    <!-- Add Friend Drawer -->
    <ADrawer v-model:open="showAddFriend" title="添加好友" placement="right" width="360">
      <AInputSearch
        v-model:value="searchKeyword"
        placeholder="搜索用户名/昵称"
        @search="handleSearch"
        enter-button
      />
      <div v-if="searched" class="mt-4">
        <div
          v-for="u in searchResults"
          :key="u.user_id"
          class="flex items-center gap-3 py-2 border-b border-gray-50"
        >
          <AAvatar :size="36">{{ u.nickname?.[0] || '?' }}</AAvatar>
          <div class="flex-1 min-w-0">
            <div class="text-sm truncate">{{ u.nickname || u.user_id }}</div>
            <div class="text-xs text-gray-400">
              {{ u.user_type === 'CONSUMER' ? 'C端' : '后台' }}用户
            </div>
          </div>
          <AButton type="primary" @click="handleSendRequest(u)">添加</AButton>
        </div>
        <div v-if="!searchResults.length" class="text-center text-gray-400 py-4">未找到用户</div>
      </div>
    </ADrawer>

    <!-- Create Group Modal -->
    <AModal
      v-model:open="showCreateGroup"
      title="创建群"
      @ok="handleCreateGroup"
      :confirm-loading="creating"
      width="500px"
    >
      <AForm layout="vertical">
        <AFormItem label="群名称" required>
          <AInput v-model:value="groupForm.name" placeholder="输入群名称" />
        </AFormItem>
        <AFormItem label="邀请成员类型">
          <ARadioGroup v-model:value="groupForm.memberType">
            <ARadio value="BUSINESS">后台用户</ARadio>
            <ARadio value="CONSUMER">客户端用户</ARadio>
          </ARadioGroup>
        </AFormItem>
        <AFormItem label="邀请成员ID（可选，逗号分隔）">
          <AInput v-model:value="groupForm.memberIdsStr" placeholder="输入成员ID，逗号分隔" />
        </AFormItem>
      </AForm>
    </AModal>
    <!-- Send Broadcast Drawer -->
    <ADrawer v-model:open="showSendBroadcast" title="发送通知" placement="right" width="400">
      <AForm layout="vertical">
        <AFormItem label="标题" required>
          <AInput v-model:value="broadcastForm.title" placeholder="通知标题" />
        </AFormItem>
        <AFormItem label="内容">
          <ATextarea v-model:value="broadcastForm.content" :rows="4" placeholder="通知内容" />
        </AFormItem>
        <AFormItem label="发送范围" required>
          <ARadioGroup v-model:value="broadcastForm.scope">
            <ARadio value="ALL">全站</ARadio>
            <ARadio value="BUSINESS">仅后台用户</ARadio>
            <ARadio value="CONSUMER">仅C端用户</ARadio>
          </ARadioGroup>
        </AFormItem>
        <AFormItem>
          <AButton type="primary" @click="handleSendBroadcast" :loading="sendingBroadcast" block>
            发送
          </AButton>
        </AFormItem>
      </AForm>
    </ADrawer>
    <!-- Broadcast Detail Drawer -->
    <ADrawer v-model:open="showDetailDrawer" title="通知详情" placement="right" width="400">
      <template v-if="detailItem">
        <div class="mb-4">
          <div class="text-lg font-medium mb-2">{{ detailItem.title }}</div>
          <div class="text-xs text-gray-400 mb-3">{{ detailItem.created_at }}</div>
          <ATag v-if="detailItem.scope === 'BUSINESS'" color="blue">后台</ATag>
          <ATag v-else-if="detailItem.scope === 'CONSUMER'" color="green">C端</ATag>
          <ATag v-else color="purple">全站</ATag>
        </div>
        <div class="text-sm text-gray-700 whitespace-pre-wrap">
          {{ detailItem.content || '(无内容)' }}
        </div>
      </template>
    </ADrawer>
  </ACard>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  PlusOutlined,
  TeamOutlined,
  UserAddOutlined,
  LoadingOutlined,
  SendOutlined,
} from '@ant-design/icons-vue'
import { fetchConversations, fetchMarkAllRead } from '@/api/im/message'
import type { ConversationItem } from '@/api/im/message'
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
import { fetchMyGroups, fetchCreateGroup, fetchJoinGroup, fetchSearchGroups } from '@/api/im/group'
import type { GroupItem } from '@/api/im/group'
import {
  fetchSendBroadcast,
  fetchUnreadBroadcasts,
  fetchMarkBroadcastRead,
} from '@/api/im/broadcast'
import type { BroadcastItem } from '@/api/im/broadcast'
import { useWsStore } from '@/store'

const router = useRouter()
const route = useRoute()
const wsStore = useWsStore()

const activeTab = ref('conversations')
const totalUnread = ref(0)

// ===== Conversations =====
const loading = ref(true)
const conversations = ref<ConversationItem[]>([])

async function loadConversations() {
  loading.value = true
  try {
    const res = await fetchConversations()
    if (res.success && res.data) {
      conversations.value = (res.data as any)?.records || []
      totalUnread.value = conversations.value.reduce((sum, c) => sum + (c.unread_count || 0), 0)
    }
  } finally {
    loading.value = false
  }
}

function openConversation(conv: ConversationItem) {
  router.push({ path: '/im/conversation', query: { conversation_id: conv.conversation_id } })
}

const showCreateGroup = ref(false)
const creating = ref(false)
const groupForm = ref({ name: '', memberType: 'BUSINESS', memberIdsStr: '' })

async function handleCreateGroup() {
  if (!groupForm.value.name) {
    message.warning('请输入群名称')
    return
  }
  creating.value = true
  try {
    const memberIds = groupForm.value.memberIdsStr
      ? groupForm.value.memberIdsStr
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
      : []
    const res = await fetchCreateGroup({
      name: groupForm.value.name,
      member_ids: memberIds,
      member_type: memberIds.length ? groupForm.value.memberType : undefined,
    })
    if (res.success) {
      message.success('创建成功')
      showCreateGroup.value = false
      groupForm.value = { name: '', memberType: 'BUSINESS', memberIdsStr: '' }
      loadConversations()
      loadMyGroupsFn()
    }
  } finally {
    creating.value = false
  }
}

// ===== Friends =====
const friendsLoading = ref(false)
const friends = ref<FriendItem[]>([])
const pendingIncoming = ref<FriendRequestItem[]>([])
const pendingOutgoing = ref<FriendRequestItem[]>([])
const showAddFriend = ref(false)
const searchKeyword = ref('')
const searched = ref(false)
const searchResults = ref<SearchUserResult[]>([])

async function loadFriends() {
  friendsLoading.value = true
  try {
    const [listRes, reqRes] = await Promise.all([fetchFriendList(), fetchPendingRequests()])
    if (listRes.success && listRes.data) friends.value = listRes.data as any
    if (reqRes.success && reqRes.data) {
      pendingIncoming.value = (reqRes.data as any).incoming || []
      pendingOutgoing.value = (reqRes.data as any).outgoing || []
    }
  } finally {
    friendsLoading.value = false
  }
}

function chatWithFriend(f: FriendItem) {
  const list = Array.isArray(conversations.value) ? conversations.value : []
  const conv = list.find(c => c.other_user_id === f.user_id && c.other_user_type === f.user_type)
  if (conv) {
    router.push({ path: '/im/conversation', query: { conversation_id: conv.conversation_id } })
  } else {
    router.push({ path: '/im/conversation', query: { user_id: f.user_id, user_type: f.user_type } })
  }
}

async function handleAccept(req: FriendRequestItem) {
  try {
    const res = await fetchAcceptFriendRequest({ request_id: req.id })
    if (res.success) {
      message.success('已添加好友')
      loadFriends()
    }
  } catch {
    message.error('操作失败')
  }
}

async function handleReject(req: FriendRequestItem) {
  try {
    const res = await fetchRejectFriendRequest({ request_id: req.id })
    if (res.success) {
      message.success('已拒绝')
      loadFriends()
    }
  } catch {
    message.error('操作失败')
  }
}

async function handleRemoveFriend(f: FriendItem) {
  try {
    const res = await fetchRemoveFriend({ friend_id: f.user_id, friend_type: f.user_type })
    if (res.success) {
      message.success('已删除')
      loadFriends()
    }
  } catch {
    message.error('操作失败')
  }
}

async function handleSearch() {
  const kw = searchKeyword.value.trim()
  if (!kw) return
  searched.value = true
  try {
    const res = await fetchSearchUsers({ keyword: kw })
    if (res.success && res.data) searchResults.value = res.data as any
  } catch {
    searchResults.value = []
  }
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
  } catch {
    message.error('操作失败')
  }
}

// ===== Groups =====
const loadingMyGroups = ref(false)
const myGroups = ref<GroupItem[]>([])
const groupKeyword = ref('')
const searchedGroup = ref(false)
const searchingGroup = ref(false)
const searchGroupResults = ref<(GroupItem & { is_member?: boolean })[]>([])

async function loadMyGroupsFn() {
  loadingMyGroups.value = true
  try {
    const res = await fetchMyGroups()
    if (res.success && res.data) myGroups.value = res.data as any
  } finally {
    loadingMyGroups.value = false
  }
}

function openGroup(g: GroupItem) {
  router.push({ path: '/im/conversation', query: { conversation_id: 'group:' + g.id } })
}

async function handleSearchGroups(val: string) {
  if (!val.trim()) return
  searchingGroup.value = true
  searchedGroup.value = true
  try {
    const res = await fetchSearchGroups({ keyword: val.trim() })
    if (res.success && res.data) {
      const myGroupIds = new Set(myGroups.value.map(g => g.id))
      searchGroupResults.value = (res.data as any[]).map(g => ({
        ...g,
        is_member: myGroupIds.has(g.id),
      }))
    }
  } finally {
    searchingGroup.value = false
  }
}

async function handleJoinGroup(g: GroupItem) {
  try {
    const res = await fetchJoinGroup({ group_id: g.id })
    if (res.success) {
      message.success('入群申请已提交')
      const found = searchGroupResults.value.find(s => s.id === g.id)
      if (found) found.is_member = true
    }
  } catch {
    message.error('加入失败')
  }
}

// ===== Broadcasts =====
const loadingBroadcasts = ref(false)
const broadcasts = ref<BroadcastItem[]>([])

async function loadBroadcasts() {
  loadingBroadcasts.value = true
  try {
    const res = await fetchUnreadBroadcasts()
    if (res.success && res.data) broadcasts.value = res.data as any
  } finally {
    loadingBroadcasts.value = false
  }
}

const showDetailDrawer = ref(false)
const detailItem = ref<BroadcastItem | null>(null)

function showBroadcastDetail(b: BroadcastItem) {
  detailItem.value = b
  showDetailDrawer.value = true
  if (!b.read) {
    fetchMarkBroadcastRead({ broadcast_id: b.id }).catch(() => {})
    b.read = true
  }
}

// ===== Send Broadcast =====
const showSendBroadcast = ref(false)
const sendingBroadcast = ref(false)
const broadcastForm = ref({ title: '', content: '', scope: 'ALL' })

async function handleSendBroadcast() {
  if (!broadcastForm.value.title) {
    message.warning('请输入通知标题')
    return
  }
  sendingBroadcast.value = true
  try {
    const res = await fetchSendBroadcast(broadcastForm.value)
    if (res.success) {
      message.success('通知已发送')
      showSendBroadcast.value = false
      broadcastForm.value = { title: '', content: '', scope: 'ALL' }
      loadBroadcasts()
    }
  } catch {
    message.error('发送失败')
  } finally {
    sendingBroadcast.value = false
  }
}

// ===== Watchers =====
watch(
  () => activeTab.value,
  tab => {
    if (tab === 'friends') loadFriends()
    if (tab === 'groups') loadMyGroupsFn()
    if (tab === 'conversations') loadConversations()
    if (tab === 'broadcasts') loadBroadcasts()
  }
)

watch(
  () => wsStore.conversationVersion,
  () => {
    if (activeTab.value === 'conversations') loadConversations()
  }
)

watch(
  () => wsStore.lastEvent,
  () => {
    if (wsStore.lastEvent?.type === 'friend_request' && activeTab.value === 'friends') loadFriends()
  }
)

watch(
  () => route.query.tab,
  tab => {
    if (tab === 'broadcasts') activeTab.value = 'broadcasts'
  }
)

onMounted(async () => {
  if (route.query.tab === 'broadcasts') activeTab.value = 'broadcasts'
  await loadConversations()
  if (activeTab.value === 'friends') loadFriends()
  if (activeTab.value === 'groups') loadMyGroupsFn()
  if (activeTab.value === 'broadcasts') loadBroadcasts()
})
</script>
