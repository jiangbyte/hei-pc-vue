import { request } from '@/utils'

export function fetchMessagePage(params: { current: number; size: number; status?: string }) {
  return request.Get<Service.ResponseResult<Service.PageResult>>('/api/v1/c/message/page', {
    params,
  })
}

export function fetchMessageDetail(params: { id: string }) {
  return request.Get<Service.ResponseResult>('/api/v1/c/message/detail', { params })
}

export function fetchUnreadCount() {
  return request.Get<Service.ResponseResult<{ count: number }>>('/api/v1/c/message/unread-count')
}

export function fetchSendMessage(data: {
  title: string
  content?: string
  receiver_ids: string[]
  receiver_type: string
}) {
  return request.Post<Service.ResponseResult>('/api/v1/c/message/send', data)
}

export function fetchMarkRead(data: { id: string }) {
  return request.Post<Service.ResponseResult>('/api/v1/c/message/mark-read', data)
}

export function fetchMarkAllRead() {
  return request.Post<Service.ResponseResult>('/api/v1/c/message/mark-all-read')
}

export function fetchRemoveMessages(data: { ids: string[] }) {
  return request.Post<Service.ResponseResult>('/api/v1/c/message/remove', data)
}
