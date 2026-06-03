import { watch, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore, useWsStore } from '@/store'

export function useWs() {
  const authStore = useAuthStore()
  const wsStore = useWsStore()
  const { token } = storeToRefs(authStore)

  const stopWatch = watch(token, (newToken) => {
    if (newToken) {
      wsStore.connect(newToken)
    } else {
      wsStore.disconnect()
    }
  }, { immediate: true })

  onUnmounted(() => {
    stopWatch()
    wsStore.disconnect()
  })
}
