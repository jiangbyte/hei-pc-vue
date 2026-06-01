import { defineStore } from 'pinia'
import {
  fetchLogin,
  fetchSm2PublicKey,
  fetchLogout,
} from '@/api/auth'
import { fetchClientUserCurrent } from '@/api/client-user'
import { sm2 } from 'sm-crypto'
import { useDictStore } from './dict'

interface AuthState {
  token: string
  userInfo: any
  sm2PublicKey: string
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: '',
    userInfo: null,
    sm2PublicKey: '',
  }),
  getters: {
    isLogin: state => !!state.token,
  },
  actions: {
    encryptPassword(password: string) {
      if (!this.sm2PublicKey) return password
      return sm2.doEncrypt(password, this.sm2PublicKey, 1)
    },
    async fetchSm2PublicKey() {
      const { data } = await fetchSm2PublicKey()
      if (data) this.sm2PublicKey = data
    },
    async login(username: string, password: string, captchaCode?: string, captchaId?: string) {
      const encryptedPwd = this.encryptPassword(password)
      const { success, data } = await fetchLogin({
        username,
        password: encryptedPwd,
        captcha_code: captchaCode,
        captcha_id: captchaId,
      })
      if (!success) return false
      this.token = data.token
      localStorage.setItem('pc_token', data.token)
      await this.fetchUserInfo()
      await useDictStore().loadDict()
      return true
    },
    async fetchUserInfo() {
      const { data } = await fetchClientUserCurrent()
      if (data) this.userInfo = data
    },
    async logout() {
      await fetchLogout().catch(() => {})
      this.token = ''
      this.userInfo = null
      localStorage.removeItem('pc_token')
    },
  },
  persist: true,
})
