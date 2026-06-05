<template>
  <div class="max-w-3xl mx-auto mt-4">
    <ACard :bordered="false">
      <template #title>
        <div class="flex items-center justify-between">
          <span>我的群组</span>
          <AButton type="primary" size="small" @click="showCreateModal = true">
            <template #icon><PlusOutlined /></template>创建群
          </AButton>
        </div>
      </template>

      <div v-if="loading" class="text-center py-12 text-gray-400">加载中...</div>
      <div v-else-if="!groups.length" class="text-center py-12 text-gray-400">暂无群组</div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="g in groups" :key="g.id" class="border rounded-lg p-4 hover:shadow-md transition cursor-pointer" @click="openGroup(g)">
          <div class="flex items-center gap-3">
            <AAvatar :size="48" :src="g.avatar || undefined"><TeamOutlined /></AAvatar>
            <div class="flex-1 min-w-0">
              <div class="font-medium truncate">{{ g.name }}</div>
              <div class="text-xs text-gray-400">{{ g.member_count }} 人</div>
            </div>
          </div>
          <div v-if="g.last_content" class="mt-2 text-xs text-gray-500 truncate">{{ g.last_content }}</div>
          <div class="mt-2 flex gap-1">
            <ATag v-if="g.owner_id === currentUserId" color="gold">群主</ATag>
            <ABadge v-if="g.unread_count > 0" :count="g.unread_count" size="small" />
          </div>
        </div>
      </div>

      <!-- Create Group Modal -->
      <AModal v-model:open="showCreateModal" title="创建群" @ok="handleCreate" :confirm-loading="creating" width="500px">
        <AForm layout="vertical">
          <AFormItem label="群名称" required>
            <AInput v-model:value="createForm.name" placeholder="输入群名称" />
          </AFormItem>
          <AFormItem label="邀请成员ID（可选，逗号分隔）">
            <AInput v-model:value="createForm.memberIdsStr" placeholder="输入成员ID，逗号分隔" />
          </AFormItem>
        </AForm>
      </AModal>
    </ACard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { PlusOutlined, TeamOutlined } from '@ant-design/icons-vue'
import { fetchMyGroups, fetchCreateGroup } from '@/api/im/group'
import type { GroupItem } from '@/api/im/group'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const authStore = useAuthStore()
const currentUserId = computed(() => authStore.userInfo?.id || '')
const loading = ref(true)
const groups = ref<GroupItem[]>([])
const showCreateModal = ref(false)
const creating = ref(false)
const createForm = ref({ name: '', memberIdsStr: '' })

async function loadGroups() {
  loading.value = true
  try {
    const res = await fetchMyGroups()
    if (res.success && res.data) groups.value = res.data
  } finally { loading.value = false }
}

function openGroup(g: GroupItem) {
  router.push({ path: '/c/im/group/messages', query: { group_id: g.id } })
}

async function handleCreate() {
  if (!createForm.value.name) { message.warning('请输入群名称'); return }
  creating.value = true
  try {
    const memberIds = createForm.value.memberIdsStr
      ? createForm.value.memberIdsStr.split(',').map(s => s.trim()).filter(Boolean)
      : []
    const res = await fetchCreateGroup({
      name: createForm.value.name,
      member_ids: memberIds,
      member_type: memberIds.length ? 'CONSUMER' : undefined,
    })
    if (res.success) {
      message.success('创建成功')
      showCreateModal.value = false
      createForm.value = { name: '', memberIdsStr: '' }
      loadGroups()
    }
  } finally { creating.value = false }
}

onMounted(loadGroups)
</script>
