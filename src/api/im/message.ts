import { request } from '@/utils'

// ==================== Single-Chat Messages ====================

export function fetchMessagePage(params: { current: number; size: number; status?: string }) {
  return request.Get<Service.ResponseResult<Service.PageResult>>('/api/v1/c/im/message/page', {
    params,
  })
}

export function fetchMessageDetail(params: { id: string }) {
  return request.Get<Service.ResponseResult>('/api/v1/c/im/message/detail', { params })
}

export function fetchUnreadCount() {
  return request.Get<Service.ResponseResult<{ count: number }>>('/api/v1/c/im/message/unread-count')
}

export function fetchSendMessage(data: {
  content?: string
  receiver_ids: string[]
  receiver_type: string
  msg_type?: string
  extra?: string
}) {
  return request.Post<Service.ResponseResult>('/api/v1/c/im/message/send', data)
}

export function fetchRecallMessage(data: { message_id: string }) {
  return request.Post<Service.ResponseResult>('/api/v1/c/im/message/recall', data)
}

export function fetchForwardMessage(data: {
  message_id: string
  target_ids: string[]
  target_type: string
}) {
  return request.Post<Service.ResponseResult>('/api/v1/c/im/message/forward', data)
}

export function fetchDeleteMessages(data: { ids: string[] }) {
  return request.Post<Service.ResponseResult>('/api/v1/c/im/message/delete', data)
}

export function fetchSearchMessages(params: { keyword: string; cursor?: string; size?: number }) {
  return request.Get<
    Service.ResponseResult<{
      records: ConversationMessage[]
      has_more: boolean
    }>
  >('/api/v1/c/im/message/search', { params })
}

export function fetchMarkRead(data: { id: string }) {
  return request.Post<Service.ResponseResult>('/api/v1/c/im/message/mark-read', data)
}

export function fetchMarkAllRead() {
  return request.Post<Service.ResponseResult>('/api/v1/c/im/message/mark-all-read')
}

export function fetchRemoveMessages(data: { ids: string[] }) {
  return request.Post<Service.ResponseResult>('/api/v1/c/im/message/remove', data)
}

// ==================== Conversation APIs ====================

export function fetchConversations(params?: { cursor?: string; size?: number }) {
  return request.Get<Service.ResponseResult<{ records: ConversationItem[]; has_more: boolean }>>(
    '/api/v1/c/im/conversation/list',
    { params }
  )
}

export function fetchConversationMessages(params: {
  conversation_id: string
  cursor?: string
  size?: number
}) {
  return request.Get<
    Service.ResponseResult<{
      records: ConversationMessage[]
      has_more: boolean
    }>
  >('/api/v1/c/im/conversation/messages', { params })
}

export function fetchMarkConversationRead(data: { conversation_id: string }) {
  return request.Post<Service.ResponseResult>('/api/v1/c/im/conversation/read', data)
}

export function fetchGetOrCreateConversation(data: { user_id: string; user_type: string }) {
  return request.Post<Service.ResponseResult<{ conversation_id: string; display_name: string }>>(
    '/api/v1/c/im/conversation/get-or-create',
    data
  )
}

// ==================== Types ====================

export interface ConversationItem {
  conversation_id: string
  conversation_type: 'single' | 'group'
  // Single-chat fields
  other_user_id?: string
  other_user_type?: string
  other_nickname?: string
  other_avatar?: string
  // Group fields
  group_id?: string
  group_name?: string
  group_avatar?: string
  member_count?: number
  // Common
  last_content: string
  last_time: string
  unread_count: number
}

export interface ConversationMessage {
  id: string
  sender_id: string
  sender_type: string
  content: string
  msg_type?: string
  extra?: string
  status: string
  file_url?: string
  created_at: string
}
