<template>
  <ALayout class="min-h-screen bg-white">
    <!-- Header -->
    <ALayoutHeader
      class="layout-header px-4 md:px-6 flex items-center justify-between sticky top-0 z-50"
    >
      <!-- Mobile hamburger -->
      <MenuOutlined class="md:hidden text-lg cursor-pointer mr-3" @click="menuDrawerOpen = true" />

      <!-- Logo + Nav -->
      <div class="flex items-center h-full flex-1">
        <Logo />
        <AMenu
          mode="horizontal"
          :selected-keys="[route.path]"
          class="ml-6 flex-1 hidden md:block"
          style="border-bottom: none !important"
        >
          <NavMenuItems :items="navItems" />
        </AMenu>
      </div>

      <div class="flex items-center gap-2">
        <template v-if="auth.isLogin">
          <MessageBell />
          <UserAvatar />
        </template>
        <template v-else>
          <a-button type="link" @click="router.push('/auth/login')">登录</a-button>
          <a-button type="link" @click="router.push('/auth/register')">注册</a-button>
        </template>
      </div>
    </ALayoutHeader>

    <!-- Mobile menu drawer -->
    <a-drawer
      :open="menuDrawerOpen"
      placement="left"
      :width="260"
      :closable="false"
      :body-style="{ padding: 0 }"
      @update:open="menuDrawerOpen = $event"
    >
      <div class="p-4 border-b border-gray-100">
        <Logo />
      </div>
      <AMenu
        mode="inline"
        :selected-keys="[route.path]"
        class="!border-0"
        @click="menuDrawerOpen = false"
      >
        <NavMenuItems :items="navItems" />
      </AMenu>
    </a-drawer>

    <ALayoutContent>
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </ALayoutContent>

    <FooterBar v-if="app.showFooter" />
  </ALayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MenuOutlined } from '@ant-design/icons-vue'
import { useAuthStore, useAppStore } from '@/store'
import { useNavMenu } from '@/hooks/useNavMenu'
import { Logo, UserAvatar, FooterBar } from './components'
import NavMenuItems from './components/NavMenuItems.vue'
import MessageBell from './components/MessageBell.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const app = useAppStore()
const { navItems } = useNavMenu()
const menuDrawerOpen = ref(false)
</script>
