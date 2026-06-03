<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header
      class="h-16 px-4 md:px-8 flex items-center justify-between sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200"
    >
      <!-- Mobile hamburger -->
      <a-button
        class="md:hidden flex items-center justify-center"
        type="text"
        @click="menuDrawerOpen = true"
      >
        <template #icon><MenuOutlined /></template>
      </a-button>

      <!-- Logo + Nav -->
      <div class="flex items-center h-full flex-1">
        <Logo />
        <AMenu
          mode="horizontal"
          :selected-keys="[route.path]"
          :items="menuItems"
          class="flex-1 hidden md:flex border-0 bg-transparent"
          @click="handleMenuClick"
        />
      </div>

      <div class="flex items-center gap-2">
        <template v-if="auth.isLogin">
          <MessageBell />
          <UserAvatar @open-drawer="userDrawerOpen = true" />
        </template>
        <template v-else>
          <a-button type="text" @click="router.push('/auth/login')">登录</a-button>
          <a-button type="primary" @click="router.push('/auth/register')">注册</a-button>
        </template>
      </div>
    </header>

    <MobileDrawer v-model:open="menuDrawerOpen" />
    <UserDrawer v-model:open="userDrawerOpen" />

    <main class="min-h-[calc(100vh-4rem)]">
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </main>

    <FooterBar v-if="app.showFooter" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MenuOutlined } from '@ant-design/icons-vue'
import { useAuthStore, useAppStore } from '@/store'
import { Logo, UserAvatar, UserDrawer, FooterBar, MobileDrawer } from './components'
import MessageBell from './components/MessageBell.vue'
import { useMenu } from './sider/useMenu'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const app = useAppStore()
const { menuItems, handleMenuClick } = useMenu()
const menuDrawerOpen = ref(false)
const userDrawerOpen = ref(false)
</script>
