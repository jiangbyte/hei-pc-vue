import { request } from '@/utils'

export interface BroadcastItem {
  id: string
  title: string
  content?: string
  scope: string
  sender_id: string
  read?: boolean
  read_at?: string
  created_at: string
}

export function fetchSendBroadcast(data: { title: string; content?: string; scope?: string }) {
  return request.Post<Service.ResponseResult>('/api/v1/c/im/broadcast/send', data)
}

export function fetchBroadcastList(params?: { cursor?: string; size?: number }) {
  return request.Get<
    Service.ResponseResult<{
      records: BroadcastItem[]
      has_more: boolean
    }>
  >('/api/v1/c/im/broadcast/list', { params })
}

export function fetchUnreadBroadcasts() {
  return request.Get<Service.ResponseResult<BroadcastItem[]>>('/api/v1/c/im/broadcast/unread-list')
}

export function fetchMarkBroadcastRead(data: { broadcast_id: string }) {
  return request.Post<Service.ResponseResult>('/api/v1/c/im/broadcast/read', data)
}

export function fetchBroadcastDetail(params: { id: string }) {
  return request.Get<Service.ResponseResult<BroadcastItem>>('/api/v1/c/im/broadcast/detail', {
    params,
  })
}
