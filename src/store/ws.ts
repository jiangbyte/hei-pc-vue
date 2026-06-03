import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchUnreadCount } from '@/api/message'

export const useWsStore = defineStore('ws', () => {
  let ws: WebSocket | null = null
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let reconnectAttempts = 0
  const maxReconnectAttempts = 10

  const connected = ref(false)
  const lastError = ref<string | null>(null)
  /** Incremented on each new_message WS event, for components to reactively refresh */
  const unreadVersion = ref(0)
  /** Latest new_message payload, for immediate display */
  const lastNewMessage = ref<any>(null)
  /** Shared unread message count (both header and message page use this) */
  const unreadCount = ref(0)

  async function loadUnreadCount() {
    try {
      const { data } = await fetchUnreadCount()
      if (data?.count !== undefined) {
        unreadCount.value = data.count
      }
    } catch {
      // ignore
    }
  }

  function getWsUrl(): string {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
    const baseUrl = (import.meta.env.VITE_API_BASE_URL as string) || ''
    let host = location.host
    if (baseUrl) {
      try {
        const u = new URL(baseUrl)
        host = u.host
      } catch {}
    }
    return `${protocol}//${host}/api/v1/c/ws`
  }

  function connect(token: string) {
    disconnect()
    reconnectAttempts = 0
    doConnect(token)
  }

  function doConnect(token: string) {
    if (!token) return
    try {
      const url = `${getWsUrl()}?token=${encodeURIComponent(token)}`
      ws = new WebSocket(url)

      ws.onopen = () => {
        connected.value = true
        lastError.value = null
        reconnectAttempts = 0
        startHeartbeat()
      }

      ws.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data)
          handleMessage(data)
        } catch {}
      }

      ws.onclose = () => {
        connected.value = false
        stopHeartbeat()
        attemptReconnect(token)
      }

      ws.onerror = () => {
        lastError.value = 'WebSocket 连接异常'
      }
    } catch (e: any) {
      lastError.value = e.message || 'WebSocket 连接失败'
      attemptReconnect(token)
    }
  }

  function handleMessage(data: any) {
    if (!data.type) return
    switch (data.type) {
      case 'new_message':
        unreadVersion.value++
        unreadCount.value++
        lastNewMessage.value = data.payload || null
        break
    }
  }

  function startHeartbeat() {
    stopHeartbeat()
    heartbeatTimer = setInterval(() => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'heartbeat', payload: { timestamp: Date.now() } }))
      }
    }, 30000)
  }

  function stopHeartbeat() {
    if (heartbeatTimer !== null) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
  }

  function attemptReconnect(token: string) {
    if (reconnectAttempts >= maxReconnectAttempts) return
    reconnectAttempts++
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000)
    reconnectTimer = setTimeout(() => doConnect(token), delay)
  }

  function disconnect() {
    stopHeartbeat()
    if (reconnectTimer !== null) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    if (ws) {
      ws.onclose = null
      ws.onerror = null
      ws.onmessage = null
      ws.close()
      ws = null
    }
    connected.value = false
  }

  return { connected, lastError, unreadVersion, lastNewMessage, unreadCount, loadUnreadCount, connect, disconnect }
})
