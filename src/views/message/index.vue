<template>
  <ACard :bordered="false" class="message-page max-w-3xl mx-auto mt-4">
    <template #title>
      <div class="flex items-center justify-between">
        <span>站内信</span>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">未读消息: {{ unreadCount }} 条</span>
          <AButton @click="handleMarkAllRead" :disabled="unreadCount === 0">
            全部已读
          </AButton>
          <AButton type="primary" @click="showSendModal = true">
            <template #icon><PlusOutlined /></template>
            发送消息
          </AButton>
        </div>
      </div>
    </template>

    <div class="mb-4 flex items-center gap-2">
      <ASelect
        v-model:value="queryParams.status"
        placeholder="消息状态"
        allow-clear
        style="width: 120px"
        @change="handleSearch"
      >
        <ASelectOption value="">全部</ASelectOption>
        <ASelectOption value="unread">未读</ASelectOption>
        <ASelectOption value="read">已读</ASelectOption>
      </ASelect>
    </div>

    <ATable
      :data-source="records"
      :columns="columns"
      :pagination="pagination"
      :loading="loading"
      row-key="id"
      size="middle"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <ATag :color="record.status === 'unread' ? 'processing' : 'default'">
            {{ record.status === 'unread' ? '未读' : '已读' }}
          </ATag>
        </template>
        <template v-else-if="column.key === 'created_at'">
          {{ record.created_at }}
        </template>
        <template v-else-if="column.key === 'action'">
          <ASpace>
            <AButton type="link" size="small" @click="handleDetail(record)">查看</AButton>
            <AButton type="link" size="small" @click="handleRemove(record)">删除</AButton>
          </ASpace>
        </template>
      </template>
    </ATable>

    <!-- Detail Modal -->
    <AModal v-model:open="detailVisible" title="消息详情" :footer="null" width="600px">
      <ADescriptions v-if="currentMessage" :column="1" bordered size="small">
        <ADescriptionsItem label="标题">{{ currentMessage.title }}</ADescriptionsItem>
        <ADescriptionsItem label="内容">{{ currentMessage.content || '-' }}</ADescriptionsItem>
        <ADescriptionsItem label="状态">
          <ATag :color="currentMessage.status === 'unread' ? 'processing' : 'default'">
            {{ currentMessage.status === 'unread' ? '未读' : '已读' }}
          </ATag>
        </ADescriptionsItem>
        <ADescriptionsItem label="发送时间">{{ currentMessage.created_at }}</ADescriptionsItem>
        <ADescriptionsItem v-if="currentMessage.read_at" label="阅读时间">{{ currentMessage.read_at }}</ADescriptionsItem>
      </ADescriptions>
    </AModal>

    <!-- Send Modal -->
    <AModal v-model:open="showSendModal" title="发送消息" @ok="handleSend" :confirm-loading="sending" width="600px">
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
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import {
  fetchMessagePage,
  fetchSendMessage,
  fetchMarkRead,
  fetchMarkAllRead,
  fetchRemoveMessages,
  fetchUnreadCount,
} from '@/api/message'
import { useWsStore } from '@/store'

const wsStore = useWsStore()
const loading = ref(false)
const records = ref<any[]>([])
const unreadCount = ref(0)
const detailVisible = ref(false)
const currentMessage = ref<any>(null)

// Send modal
const showSendModal = ref(false)
const sending = ref(false)

const sendForm = reactive({
  title: '',
  content: '',
  receiverType: 'CONSUMER',
  receiverIds: [] as string[],
})

const queryParams = reactive({
  current: 1,
  size: 10,
  status: '',
})

const total = ref(0)

const pagination = computed(() => ({
  current: queryParams.current,
  pageSize: queryParams.size,
  total: total.value,
  showSizeChanger: true,
  showTotal: (t: number) => `共 ${t} 条`,
}))

const columns = [
  { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true },
  { title: '内容', dataIndex: 'content', key: 'content', ellipsis: true },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
  { title: '发送时间', dataIndex: 'created_at', key: 'created_at', width: 180 },
  { title: '操作', key: 'action', width: 130 },
]

async function loadData() {
  loading.value = true
  try {
    const res = await fetchMessagePage({
      current: queryParams.current,
      size: queryParams.size,
      status: queryParams.status || undefined,
    })
    if (res.success && res.data) {
      records.value = res.data.records || []
      total.value = res.data.total || 0
    }
  } finally {
    loading.value = false
  }
}

async function loadUnreadCount() {
  try {
    const res = await fetchUnreadCount()
    if (res.success && res.data) {
      unreadCount.value = res.data.count || 0
    }
  } catch {}
}

function handleSearch() {
  queryParams.current = 1
  loadData()
}

function handleTableChange(pagination: any) {
  queryParams.current = pagination.current
  queryParams.size = pagination.pageSize
  loadData()
}

async function handleDetail(record: any) {
  detailVisible.value = true
  currentMessage.value = record
  if (record.status === 'unread') {
    try {
      await fetchMarkRead({ id: record.id })
      record.status = 'read'
      await loadUnreadCount()
    } catch {}
  }
}

async function handleMarkAllRead() {
  try {
    await fetchMarkAllRead()
    message.success('已全部标记为已读')
    unreadCount.value = 0
    loadData()
  } catch {}
}

async function handleRemove(record: any) {
  try {
    await fetchRemoveMessages({ ids: [record.id] })
    message.success('删除成功')
    unreadCount.value = Math.max(0, unreadCount.value - (record.status === 'unread' ? 1 : 0))
    loadData()
  } catch {}
}

// ---- Send logic ----
async function handleSend() {
  if (!sendForm.title) {
    message.warning('请输入消息标题')
    return
  }
  if (!sendForm.receiverIds.length) {
    message.warning('请填写接收用户ID')
    return
  }
  sending.value = true
  try {
    const res = await fetchSendMessage({
      title: sendForm.title,
      content: sendForm.content || undefined,
      receiver_ids: sendForm.receiverIds,
      receiver_type: sendForm.receiverType,
    })
    if (res.success) {
      message.success('发送成功')
      showSendModal.value = false
      sendForm.title = ''
      sendForm.content = ''
      sendForm.receiverIds = []
      loadData()
      loadUnreadCount()
    }
  } finally {
    sending.value = false
  }
}

// Auto-refresh when new message arrives via WS
watch(() => wsStore.unreadVersion, () => {
  loadUnreadCount()
  loadData()
})

onMounted(() => {
  loadData()
  loadUnreadCount()
})
</script>
