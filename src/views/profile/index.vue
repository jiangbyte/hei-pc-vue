<template>
  <div class="profile-page">
    <div class="page-header">
      <h1 class="page-title">个人中心</h1>
      <p class="page-desc">管理您的个人信息和账号设置</p>
    </div>

    <div class="page-content">
      <a-spin :spinning="loading">
        <a-card title="基本信息" :bordered="false" class="profile-card">
          <a-form :model="form" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
            <a-form-item label="头像">
              <a-avatar :size="72" :src="form.avatar">
                {{ form.nickname?.charAt(0) || form.username?.charAt(0) || 'U' }}
              </a-avatar>
            </a-form-item>
            <a-form-item label="用户名">
              <span>{{ form.username }}</span>
            </a-form-item>
            <a-form-item label="昵称">
              <a-input v-model:value="form.nickname" placeholder="请输入昵称" />
            </a-form-item>
            <a-form-item label="手机号">
              <a-input v-model:value="form.phone" placeholder="请输入手机号" />
            </a-form-item>
            <a-form-item label="邮箱">
              <a-input v-model:value="form.email" placeholder="请输入邮箱" />
            </a-form-item>
            <a-form-item :wrapper-col="{ offset: 4 }">
              <a-button type="primary" :loading="saving" @click="handleSave">保存修改</a-button>
            </a-form-item>
          </a-form>
        </a-card>

        <a-card title="修改密码" :bordered="false" class="profile-card">
          <a-form :model="pwdForm" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
            <a-form-item label="当前密码">
              <a-input-password v-model:value="pwdForm.oldPassword" placeholder="请输入当前密码" />
            </a-form-item>
            <a-form-item label="新密码">
              <a-input-password v-model:value="pwdForm.newPassword" placeholder="请输入新密码" />
            </a-form-item>
            <a-form-item label="确认密码">
              <a-input-password
                v-model:value="pwdForm.confirmPassword"
                placeholder="请再次输入新密码"
              />
            </a-form-item>
            <a-form-item :wrapper-col="{ offset: 4 }">
              <a-button type="primary" :loading="pwdSaving" @click="handleChangePwd">
                修改密码
              </a-button>
            </a-form-item>
          </a-form>
        </a-card>
      </a-spin>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { useAuthStore } from '@/store'
import { fetchClientUserUpdateProfile, fetchClientUserUpdatePassword } from '@/api/client-user'

defineOptions({ name: 'PcProfile' })

const auth = useAuthStore()
const loading = ref(false)
const saving = ref(false)
const pwdSaving = ref(false)

const form = reactive({
  username: '',
  nickname: '',
  phone: '',
  email: '',
  avatar: '',
})

const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

onMounted(() => {
  if (auth.userInfo) {
    form.username = auth.userInfo.username || ''
    form.nickname = auth.userInfo.nickname || ''
    form.phone = auth.userInfo.phone || ''
    form.email = auth.userInfo.email || ''
    form.avatar = auth.userInfo.avatar || ''
  }
})

async function handleSave() {
  saving.value = true
  try {
    const { success } = await fetchClientUserUpdateProfile({
      nickname: form.nickname,
      phone: form.phone,
      email: form.email,
    })
    if (success) {
      message.success('保存成功')
      if (auth.userInfo) {
        auth.userInfo.nickname = form.nickname
        auth.userInfo.phone = form.phone
        auth.userInfo.email = form.email
      }
    }
  } finally {
    saving.value = false
  }
}

async function handleChangePwd() {
  if (!pwdForm.oldPassword) {
    message.warning('请输入当前密码')
    return
  }
  if (!pwdForm.newPassword) {
    message.warning('请输入新密码')
    return
  }
  if (pwdForm.newPassword !== pwdForm.confirmPassword) {
    message.warning('两次输入的密码不一致')
    return
  }
  pwdSaving.value = true
  try {
    const { success } = await fetchClientUserUpdatePassword({
      old_password: pwdForm.oldPassword,
      new_password: pwdForm.newPassword,
    })
    if (success) {
      message.success('密码修改成功')
      pwdForm.oldPassword = ''
      pwdForm.newPassword = ''
      pwdForm.confirmPassword = ''
    }
  } finally {
    pwdSaving.value = false
  }
}
</script>

<style scoped>
.profile-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 24px;
}
.page-header {
  margin-bottom: 32px;
}
.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}
.page-desc {
  color: #666;
  font-size: 15px;
}
.profile-card {
  border-radius: 12px;
  margin-bottom: 24px;
}
</style>
