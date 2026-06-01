<template>
  <ADropdown :trigger="['click']">
    <div class="flex items-center gap-2 cursor-pointer">
      <AAvatar :size="32" :src="auth.userInfo?.avatar || undefined">
        {{ auth.userInfo?.nickname?.[0] || auth.userInfo?.username?.[0] || 'U' }}
      </AAvatar>
      <span class="text-gray-700">
        {{ auth.userInfo?.nickname || auth.userInfo?.username || '' }}
      </span>
    </div>
    <template #overlay>
      <AMenu>
        <AMenuItem v-for="item in userMenuItems" :key="item.key" @click="item.onClick">
          <component :is="item.icon" v-if="item.icon" />
          {{ item.label }}
        </AMenuItem>
      </AMenu>
    </template>
  </ADropdown>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/store'
import { useUserMenu } from './useUserMenu'

const auth = useAuthStore()
const { userMenuItems } = useUserMenu()
</script>
