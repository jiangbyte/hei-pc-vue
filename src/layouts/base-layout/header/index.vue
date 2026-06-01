<template>
  <header
    class="bg-white border-b border-gray-100 sticky top-0 z-100 transition-shadow duration-300"
    :class="{ 'shadow-sm': scrolled }"
  >
    <div class="px-6 h-16 flex items-center gap-8">
      <Logo />

      <nav class="flex gap-1 flex-1 max-md:hidden">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="px-4 py-2 rounded-md no-underline text-gray-700 text-sm transition-all duration-200 hover:bg-gray-50 hover:text-primary"
          :class="{ '!text-primary !font-medium': isActive(item.path) }"
        >
          {{ item.label }}
        </router-link>
      </nav>

      <div class="flex items-center gap-1 max-md:hidden">
        <template v-if="auth.isLogin">
          <UserAvatar />
        </template>
        <template v-else>
          <a-button type="link" @click="router.push('/auth/login')">登录</a-button>
          <a-button type="link" @click="router.push('/auth/register')">注册</a-button>
        </template>
      </div>

      <div
        class="hidden max-md:block text-xl cursor-pointer p-2 ml-auto"
        @click="emit('toggleMobileMenu')"
      >
        <MenuOutlined />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { NavItem } from '@/config/nav'
import { useRouter } from 'vue-router'
import { MenuOutlined } from '@ant-design/icons-vue'
import { useAuthStore } from '@/store'
import { Logo, UserAvatar } from '../components'

defineProps<{
  scrolled: boolean
  navItems: NavItem[]
  isActive: (path: string) => boolean
}>()
const emit = defineEmits<{ toggleMobileMenu: [] }>()

const router = useRouter()
const auth = useAuthStore()
</script>
