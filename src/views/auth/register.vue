<template>
  <AuthLayout>
    <h2 class="form-title">创建账号</h2>
    <p class="form-subtitle">注册一个新账号</p>

    <a-form :model="form" layout="vertical" size="large" @finish="handleRegister">
      <a-form-item name="username" :rules="[{ required: true, message: '请输入用户名' }]">
        <a-input v-model:value="form.username" placeholder="用户名">
          <template #prefix><UserOutlined /></template>
        </a-input>
      </a-form-item>

      <a-form-item name="password" :rules="[{ required: true, message: '请输入密码' }]">
        <a-input-password v-model:value="form.password" placeholder="密码">
          <template #prefix><LockOutlined /></template>
        </a-input-password>
      </a-form-item>

      <a-form-item name="confirmPassword" :rules="[{ required: true, message: '请确认密码' }]">
        <a-input-password v-model:value="form.confirmPassword" placeholder="确认密码">
          <template #prefix><LockOutlined /></template>
        </a-input-password>
      </a-form-item>

      <a-form-item>
        <a-button type="primary" html-type="submit" block :loading="loading">注 册</a-button>
      </a-form-item>
    </a-form>

    <a-typography-text type="secondary" class="form-footer">
      已有账号？
      <a-button type="link" @click="router.push('/auth/login')">立即登录</a-button>
    </a-typography-text>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { fetchRegister } from '@/api/auth'
import AuthLayout from './components/AuthLayout.vue'

const router = useRouter()
const loading = ref(false)

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
})

async function handleRegister() {
  if (form.password !== form.confirmPassword) {
    message.error('两次输入的密码不一致')
    return
  }
  loading.value = true
  try {
    const { success } = await fetchRegister({
      username: form.username,
      password: form.password,
    })
    if (success) {
      message.success('注册成功，请登录')
      router.push('/auth/login')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.form-title {
  font-size: 28px;
  font-weight: 700;
  color: #000000d9;
  margin: 0 0 8px;
  letter-spacing: -0.5px;
}
.form-subtitle {
  font-size: 14px;
  color: #00000073;
  margin: 0 0 32px;
}
.form-footer {
  display: block;
  text-align: center;
}
</style>
