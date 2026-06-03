<template>
  <div class="message-bell inline-flex items-center">
    <ABadge :count="unreadCount" :overflow-count="99" size="small">
      <BellOutlined class="text-lg cursor-pointer" @click="router.push('/message')" />
    </ABadge>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { BellOutlined } from '@ant-design/icons-vue'
import { fetchUnreadCount } from '@/api/message'
import { useAuthStore, useWsStore } from '@/store'

const router = useRouter()
const authStore = useAuthStore()
const wsStore = useWsStore()
const unreadCount = ref(0)
let pollTimer: ReturnType<typeof setInterval> | null = null

async function loadUnreadCount() {
  if (!authStore.isLogin) {
    unreadCount.value = 0
    return
  }
  try {
    const { data } = await fetchUnreadCount()
    if (data?.count !== undefined) {
      unreadCount.value = data.count
    }
  } catch {
    // ignore
  }
}

// Real-time: refresh when WS pushes a new message
watch(() => wsStore.unreadVersion, () => {
  loadUnreadCount()
})

onMounted(() => {
  loadUnreadCount()
  // Fallback polling every 60s in case WS disconnects
  pollTimer = setInterval(loadUnreadCount, 60000)
})

onUnmounted(() => {
  if (pollTimer !== null) {
    clearInterval(pollTimer)
    pollTimer = null
  }
})
</script>
