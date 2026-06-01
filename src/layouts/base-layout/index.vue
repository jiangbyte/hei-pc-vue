<template>
  <div class="min-h-screen flex flex-col">
    <PcHeader
      :scrolled="scrolled"
      :nav-items="navItems"
      :is-active="isActive"
      @toggle-mobile-menu="mobileDrawerOpen = true"
    />

    <!-- Mobile drawer -->
    <a-drawer
      v-model:open="mobileDrawerOpen"
      placement="right"
      :closable="true"
      :width="280"
      :body-style="{ padding: '24px' }"
    >
      <div class="flex flex-col gap-2">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="block px-4 py-3 rounded-md text-base text-gray-700 no-underline hover:bg-gray-50 transition-colors"
          :class="{ '!text-primary !font-medium': isActive(item.path) }"
          @click="mobileDrawerOpen = false"
        >
          {{ item.label }}
        </router-link>
        <a-divider />
        <template v-if="auth.isLogin">
          <router-link
            to="/profile"
            class="block px-4 py-3 rounded-md text-base text-gray-700 no-underline hover:bg-gray-50"
            @click="mobileDrawerOpen = false"
          >
            个人中心
          </router-link>
          <a
            class="block px-4 py-3 rounded-md text-base text-gray-700 no-underline hover:bg-gray-50 cursor-pointer"
            @click="handleMobileLogout"
          >
            退出登录
          </a>
        </template>
        <template v-else>
          <router-link
            to="/auth/login"
            class="block px-4 py-3 rounded-md text-base text-gray-700 no-underline hover:bg-gray-50"
            @click="mobileDrawerOpen = false"
          >
            登录
          </router-link>
          <router-link
            to="/auth/register"
            class="block px-4 py-3 rounded-md text-base text-gray-700 no-underline hover:bg-gray-50"
            @click="mobileDrawerOpen = false"
          >
            注册
          </router-link>
        </template>
      </div>
    </a-drawer>

    <!-- Content -->
    <main class="flex-1">
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </main>

    <FooterBar />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store'
import { useNavMenu } from '@/hooks/useNavMenu'
import { FooterBar } from './components'
import PcHeader from './header/index.vue'

const router = useRouter()
const auth = useAuthStore()
const { navItems, isActive } = useNavMenu()
const mobileDrawerOpen = ref(false)

const scrolled = ref(false)
function onScroll() {
  scrolled.value = window.scrollY > 0
}
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))

function handleLogout() {
  auth.logout()
  router.push('/')
}

function handleMobileLogout() {
  mobileDrawerOpen.value = false
  handleLogout()
}
</script>
