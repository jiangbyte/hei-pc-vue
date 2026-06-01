<template>
  <AuthLayout>
    <h2 class="form-title">欢迎回来</h2>
    <p class="form-subtitle">请登录您的账号</p>

    <a-form :model="form" layout="vertical" size="large" @finish="handleLogin">
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

      <a-form-item
        v-if="captcha"
        name="captcha"
        :rules="[{ required: true, message: '请输入验证码' }]"
      >
        <a-input v-model:value="form.captcha" placeholder="验证码">
          <template #prefix><SafetyOutlined /></template>
          <template #suffix>
            <img :src="captcha" class="captcha-img" @click="loadCaptcha" />
          </template>
        </a-input>
      </a-form-item>

      <a-form-item>
        <a-button type="primary" html-type="submit" block :loading="loading">登 录</a-button>
      </a-form-item>
    </a-form>

    <a-typography-text type="secondary" class="form-footer">
      还没有账号？
      <a-button type="link" @click="router.push('/auth/register')">立即注册</a-button>
    </a-typography-text>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons-vue'
import { useAuthStore } from '@/store'
import { fetchCaptcha } from '@/api/auth'
import AuthLayout from './components/AuthLayout.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const loading = ref(false)
const captcha = ref('')
const captchaId = ref('')

const form = reactive({
  username: '',
  password: '',
  captcha: '',
})

async function loadCaptcha() {
  const { data } = await fetchCaptcha()
  if (data) {
    captcha.value = data.captcha_base64 || data.captcha_image
    captchaId.value = data.captcha_id
  }
}

async function handleLogin() {
  loading.value = true
  try {
    const ok = await auth.login(form.username, form.password, form.captcha, captchaId.value)
    if (ok) {
      const redirect = (route.query.redirect as string) || '/'
      router.push(redirect)
    }
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadCaptcha(), auth.fetchSm2PublicKey()])
})
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
.captcha-img {
  height: 28px;
  cursor: pointer;
  border-radius: 4px;
}
.form-footer {
  display: block;
  text-align: center;
}
</style>
