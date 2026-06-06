<template>
  <div class="max-w-1200px mx-auto px-6 py-8">
    <div class="flex flex-col md:flex-row">
      <!-- Sidebar -->
      <aside class="w-48 shrink-0 hidden md:block">
        <AMenu
          v-model:selectedKeys="selectedKeys"
          :items="menuItems"
          class="sticky top-24 border-0 bg-transparent"
          @click="handleMenuClick"
        />
      </aside>

      <!-- Mobile Tabs -->
      <div class="block md:hidden mb-4">
        <ATabs v-model:activeKey="activeTab" size="small">
          <ATabPane v-for="tab in sidebarTabs" :key="tab.key" :tab="tab.label" />
        </ATabs>
      </div>

      <!-- Content -->
      <main class="flex-1 min-w-0 border border-gray-200 rounded-lg bg-white p-6 md:p-8">
        <!-- Profile -->
        <div v-if="activeTab === 'profile'">
          <h2 class="text-xl font-semibold text-gray-900 mb-1">个人资料</h2>
          <p class="text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
            展示在你公共资料页上的信息
          </p>



          <a-form layout="vertical">
            <a-form-item label="昵称">
              <a-input
                v-model:value="basicForm.nickname"
                placeholder="你的昵称"
                :maxlength="32"
                show-count
                class="max-w-400px"
              />
            </a-form-item>
            <a-form-item label="签名">
              <a-textarea
                v-model:value="basicForm.motto"
                placeholder="一句话介绍自己"
                :rows="2"
                :maxlength="64"
                show-count
                class="max-w-400px"
              />
            </a-form-item>
            <a-form-item label="性别">
              <DictSelect
                v-model="basicForm.gender"
                type-code="GENDER"
                placeholder="选择性别"
                allow-clear
                class="max-w-200px"
              />
            </a-form-item>
            <a-form-item>
              <a-button type="primary" :loading="basicSaving" @click="handleSaveBasic">
                保存
              </a-button>
            </a-form-item>
          </a-form>
        </div>

        <!-- Avatar -->
        <div v-if="activeTab === 'avatar'">
          <h2 class="text-xl font-semibold text-gray-900 mb-1">头像</h2>
          <p class="text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
            管理你的头像
          </p>

          <div class="flex flex-col items-center gap-6 py-8">
            <div
              class="w-32 h-32 rounded-full overflow-hidden cursor-pointer ring-2 ring-gray-200 hover:ring-primary transition-all duration-200 relative group"
              @click="openCrop"
            >
              <img v-if="displayAvatar" :src="displayAvatar" class="w-full h-full object-cover" />
              <div
                v-else
                class="w-full h-full flex items-center justify-center text-4xl font-medium text-white"
                :style="{ background: avatarBg }"
              >
                {{ avatarLetter }}
              </div>
              <div
                class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
              >
                <CameraOutlined class="text-white text-xl" />
              </div>
            </div>

            <div class="flex gap-3">
              <AButton type="primary" @click="openCrop">上传头像</AButton>
              <AButton v-if="displayAvatar" @click="handleRemoveAvatar">移除头像</AButton>
            </div>
          </div>
        </div>

        <!-- Account -->
        <div v-if="activeTab === 'account'">
          <h2 class="text-xl font-semibold text-gray-900 mb-1">账号信息</h2>
          <p class="text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
            管理你的账号关联信息
          </p>

          <a-form layout="vertical">
            <a-form-item label="用户名">
              <a-input
                v-model:value="accountForm.username"
                placeholder="输入用户名"
                class="max-w-400px"
              />
            </a-form-item>
            <a-form-item label="邮箱">
              <a-input
                v-model:value="accountForm.email"
                placeholder="your@email.com"
                class="max-w-400px"
              />
            </a-form-item>
            <a-form-item label="手机号">
              <a-input v-model:value="accountForm.phone" placeholder="手机号" class="max-w-400px" />
            </a-form-item>
            <a-form-item>
              <a-button type="primary" :loading="accountSaving" @click="handleSaveAccount">
                保存
              </a-button>
            </a-form-item>
          </a-form>
        </div>

        <!-- Security -->
        <div v-if="activeTab === 'security'">
          <h2 class="text-xl font-semibold text-gray-900 mb-1">账户安全</h2>
          <p class="text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">修改你的登录密码</p>

          <a-form layout="vertical">
            <a-form-item label="当前密码">
              <a-input-password
                v-model:value="passwordForm.currentPassword"
                placeholder="输入当前密码"
                class="max-w-400px"
              />
            </a-form-item>
            <a-form-item label="新密码">
              <a-input-password
                v-model:value="passwordForm.newPassword"
                placeholder="输入新密码"
                class="max-w-400px"
              />
            </a-form-item>
            <a-form-item label="确认新密码">
              <a-input-password
                v-model:value="passwordForm.confirmPassword"
                placeholder="再次输入新密码"
                class="max-w-400px"
              />
            </a-form-item>
            <a-form-item>
              <a-button type="primary" :loading="passwordSaving" @click="handleUpdatePassword">
                更新密码
              </a-button>
            </a-form-item>
          </a-form>
        </div>
      </main>
    </div>

    <!-- Avatar Crop Modal -->
    <a-modal
      :open="cropVisible"
      title="裁剪头像"
      ok-text="确认"
      cancel-text="取消"
      :width="600"
      :confirm-loading="cropLoading"
      destroy-on-close
      @ok="confirmCrop"
      @cancel="cropVisible = false"
    >
      <div v-if="cropImage" class="flex gap-6 items-start">
        <div class="w-80 shrink-0">
          <Cropper
            ref="cropperRef"
            :src="cropImage"
            :debounce="false"
            :stencil-props="{ aspectRatio: 1 }"
            class="max-h-80"
            @change="onCropChange"
          />
        </div>
        <div class="flex flex-col items-center gap-2 pt-2 shrink-0 min-w-20">
          <span class="text-xs text-gray-400">预览</span>
          <Preview
            :width="80"
            :height="80"
            :image="cropResult.image"
            :coordinates="cropResult.coordinates"
            class="rounded-full overflow-hidden"
          />
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, h } from 'vue'
import { message } from 'ant-design-vue'
import { CameraOutlined, UserOutlined, SolutionOutlined, SafetyCertificateOutlined } from '@ant-design/icons-vue'
import { useAuthStore, useDictStore } from '@/store'
import {
  fetchClientUserUpdateProfile,
  fetchClientUserUpdateAvatar,
  fetchClientUserUpdatePassword,
} from '@/api/client/user'
import DictSelect from '@/components/DictSelect.vue'
import { Cropper, Preview } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

defineOptions({ name: 'PcProfile' })

const auth = useAuthStore()
const userInfo = computed(() => auth.userInfo)
const displayAvatar = ref('')

const sidebarTabs = [
  { key: 'avatar', label: '头像', icon: 'CameraOutlined' },
  { key: 'profile', label: '个人资料', icon: 'UserOutlined' },
  { key: 'account', label: '账号信息', icon: 'SolutionOutlined' },
  { key: 'security', label: '账户安全', icon: 'SafetyCertificateOutlined' },
]
const activeTab = ref('profile')
const selectedKeys = ref<string[]>(['profile'])
function resolveIconRender(name?: string) {
  const icons: Record<string, any> = {
    UserOutlined, SolutionOutlined, SafetyCertificateOutlined, CameraOutlined,
  }
  const icon = icons[name || '']
  return icon ? () => h(icon) : undefined
}

const menuItems = sidebarTabs.map(t => ({ key: t.key, label: t.label, icon: resolveIconRender(t.icon) }))

function handleMenuClick({ key }: { key: string | number }) {
  activeTab.value = key
}

watch(activeTab, (val) => {
  selectedKeys.value = [val]
})

onMounted(() => {
  if (userInfo.value?.avatar) {
    displayAvatar.value = userInfo.value.avatar
  }
  initForm()
  useDictStore().loadDict()
})

const basicForm = ref({ nickname: '', motto: '', gender: undefined as string | undefined })
const basicSaving = ref(false)

const accountForm = ref({ username: '', email: '', phone: '' })
const accountSaving = ref(false)

const passwordForm = ref({ currentPassword: '', newPassword: '', confirmPassword: '' })
const passwordSaving = ref(false)

function initForm() {
  const u = userInfo.value || {}
  basicForm.value = {
    nickname: u.nickname || '',
    motto: u.motto || '',
    gender: u.gender || undefined,
  }
  accountForm.value = { username: u.username || '', email: u.email || '', phone: u.phone || '' }
}

async function handleSaveBasic() {
  basicSaving.value = true
  try {
    const { success } = await fetchClientUserUpdateProfile(basicForm.value)
    if (success) {
      message.success('已保存')
      await auth.fetchUserInfo()
    }
  } finally {
    basicSaving.value = false
  }
}

async function handleSaveAccount() {
  accountSaving.value = true
  try {
    const { success } = await fetchClientUserUpdateProfile(accountForm.value)
    if (success) {
      message.success('已保存')
      await auth.fetchUserInfo()
    }
  } finally {
    accountSaving.value = false
  }
}

async function handleUpdatePassword() {
  const { currentPassword, newPassword, confirmPassword } = passwordForm.value
  if (!currentPassword || !newPassword || !confirmPassword) {
    message.warning('请填写完整的密码信息')
    return
  }
  if (newPassword !== confirmPassword) {
    message.warning('两次输入的新密码不一致')
    return
  }
  passwordSaving.value = true
  try {
    const { success } = await fetchClientUserUpdatePassword({
      old_password: auth.encryptPassword(currentPassword),
      new_password: auth.encryptPassword(newPassword),
    })
    if (success) {
      message.success('密码已更新')
      passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
    }
  } finally {
    passwordSaving.value = false
  }
}

// ── Avatar ──
const avatarColors = ['#1677ff', '#52c41a', '#faad14', '#722ed1', '#eb2f96', '#fa8c16', '#13c2c2']

const avatarLetter = computed(() => {
  const name = userInfo.value?.nickname || userInfo.value?.username || ''
  return name.charAt(0).toUpperCase() || '?'
})

const avatarBg = computed(() => {
  const name = userInfo.value?.nickname || userInfo.value?.username || ''
  const idx = name.charCodeAt(0) || 0
  return avatarColors[idx % avatarColors.length]
})

// Cropper
const cropVisible = ref(false)
const cropImage = ref<string | null>(null)
const cropLoading = ref(false)
const cropperRef = ref<InstanceType<typeof Cropper> | null>(null)

const cropResult = ref<{ image: any; coordinates: any }>({
  image: null,
  coordinates: null,
})

function openCrop() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e: any) => {
    const file = e.target?.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      cropImage.value = ev.target?.result as string
      cropVisible.value = true
    }
    reader.readAsDataURL(file)
  }
  input.click()
}

function onCropChange({ coordinates, image }: { coordinates: any; image: any }) {
  cropResult.value = { coordinates, image }
}

async function confirmCrop() {
  cropLoading.value = true
  try {
    const result = cropperRef.value?.getResult()
    const canvas = result?.canvas
    if (!canvas) {
      message.error('裁剪失败，请重试')
      return
    }
    const base64 = canvas.toDataURL('image/png')
    const { success } = await fetchClientUserUpdateAvatar({ avatar: base64 })
    if (success) {
      message.success('头像更新成功')
      displayAvatar.value = base64
      cropVisible.value = false
      await auth.fetchUserInfo()
    }
  } catch (e: any) {
    message.error(e?.message || '头像上传失败')
  } finally {
    cropLoading.value = false
  }
}

async function handleRemoveAvatar() {
  try {
    const { success } = await fetchClientUserUpdateAvatar({ avatar: '' })
    if (success) {
      displayAvatar.value = ''
      await auth.fetchUserInfo()
      message.success('头像已移除')
    }
  } catch (e: any) {
    message.error(e?.message || '头像移除失败')
  }
}
</script>
