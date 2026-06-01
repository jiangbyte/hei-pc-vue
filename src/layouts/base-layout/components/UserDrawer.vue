<template>
  <ADrawer
    :open="open"
    placement="right"
    width="260"
    :closable="false"
    :body-style="{ padding: 0, height: '100%' }"
    @update:open="$emit('update:open', $event)"
  >
    <div class="flex flex-col h-full">
      <!-- User info -->
      <div class="flex flex-col items-center gap-3 py-10 border-b border-gray-100">
        <AAvatar :size="64" :src="auth.userInfo?.avatar || undefined">
          {{ auth.userInfo?.nickname?.[0] || auth.userInfo?.username?.[0] || 'U' }}
        </AAvatar>
        <template v-if="auth.isLogin">
          <div class="text-base font-medium">{{ auth.userInfo?.nickname || '' }}</div>
          <div class="text-xs text-gray-400">{{ auth.userInfo?.username || '' }}</div>
        </template>
        <template v-else>
          <div class="text-base">未登录</div>
        </template>
      </div>

      <!-- Actions -->
      <template v-if="auth.isLogin">
        <div
          v-for="item in userMenuItems"
          :key="item.key"
          class="flex items-center gap-3 px-6 py-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
          :class="{ 'text-red-500': item.danger }"
          @click="handleClick(item)"
        >
          <component :is="item.icon" v-if="item.icon" />
          <span>{{ item.label }}</span>
        </div>
      </template>
      <template v-else>
        <router-link
          to="/auth/login"
          class="flex items-center gap-3 px-6 py-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 no-underline text-gray-700"
          @click="$emit('update:open', false)"
        >
          <LoginOutlined />
          登录
        </router-link>
        <router-link
          to="/auth/register"
          class="flex items-center gap-3 px-6 py-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 no-underline text-gray-700"
          @click="$emit('update:open', false)"
        >
          <UserAddOutlined />
          注册
        </router-link>
      </template>
    </div>
  </ADrawer>
</template>

<script setup lang="ts">
import { LoginOutlined, UserAddOutlined } from '@ant-design/icons-vue'
import { useAuthStore } from '@/store'
import { useUserMenu } from './useUserMenu'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const auth = useAuthStore()
const { userMenuItems } = useUserMenu()

function handleClick(item: { onClick: () => void }) {
  item.onClick()
  emit('update:open', false)
}
</script>
