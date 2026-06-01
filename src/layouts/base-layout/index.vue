<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="site-header">
      <div class="header-inner">
        <div class="logo">
          <router-link to="/" class="logo-link">Hei PC</router-link>
        </div>
        <nav class="main-nav">
          <router-link to="/" class="nav-item" active-class="nav-active">首页</router-link>
          <router-link to="/about" class="nav-item" active-class="nav-active">关于我们</router-link>
        </nav>
        <div class="header-actions">
          <template v-if="auth.isLogin">
            <a-dropdown>
              <a class="user-name" @click.prevent>
                {{ auth.userInfo?.nickname || auth.userInfo?.username || '用户' }}
                <DownOutlined />
              </a>
              <template #overlay>
                <a-menu>
                  <a-menu-item @click="handleLogout">退出登录</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>
          <template v-else>
            <a-button type="link" @click="router.push('/auth/login')">登录</a-button>
            <a-button type="primary" @click="router.push('/auth/register')">注册</a-button>
          </template>
        </div>
      </div>
    </header>

    <!-- Content -->
    <main class="flex-1 site-content">
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </main>

    <!-- Footer -->
    <footer class="site-footer">
      <div class="footer-inner">
        <span>&copy; {{ new Date().getFullYear() }} Hei PC. All rights reserved.</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { DownOutlined } from '@ant-design/icons-vue'
import { useAuthStore } from '@/store'

const router = useRouter()
const auth = useAuthStore()

function handleLogout() {
  auth.logout()
  router.push('/')
}
</script>

<style scoped>
.site-header {
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 0;
  z-index: 100;
}
.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  gap: 32px;
}
.logo-link {
  font-size: 22px;
  font-weight: 700;
  color: var(--primary-color, #1677ff);
  text-decoration: none;
}
.main-nav {
  display: flex;
  gap: 8px;
  flex: 1;
}
.nav-item {
  padding: 8px 16px;
  border-radius: 6px;
  text-decoration: none;
  color: #333;
  font-size: 15px;
  transition: all 0.2s;
}
.nav-item:hover {
  background: #f5f5f5;
  color: var(--primary-color, #1677ff);
}
.nav-active {
  color: var(--primary-color, #1677ff);
  font-weight: 500;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.user-name {
  color: #333;
}
.site-content {
  background: #f5f5f5;
  min-height: calc(100vh - 128px);
}
.site-footer {
  background: #fff;
  border-top: 1px solid #f0f0f0;
  padding: 16px 0;
}
.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  text-align: center;
  color: #999;
  font-size: 13px;
}
</style>
