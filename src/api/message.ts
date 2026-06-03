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

// Conversation-based APIs
export function fetchConversations() {
  return request.Get<Service.ResponseResult<ConversationItem[]>>('/api/v1/c/message/conversations')
}

export function fetchConversationMessages(params: {
  conversation_id: string
  cursor?: string
  size?: number
}) {
  return request.Get<Service.ResponseResult<{
    records: ConversationMessage[]
    has_more: boolean
  }>>('/api/v1/c/message/conversation/messages', { params })
}

export interface ConversationItem {
  conversation_id: string
  other_user_id: string
  other_user_type: string
  other_nickname: string
  other_avatar: string
  last_content: string
  last_time: string
  unread_count: number
}

export interface ConversationMessage {
  id: string
  sender_id: string | null
  sender_type: string
  content: string
  status: string
  created_at: string
}

export function fetchMarkConversationRead(data: { conversation_id: string }) {
  return request.Post<Service.ResponseResult>('/api/v1/c/message/conversation/read', data)
}
