import { request } from '@/utils'
import type { ConversationMessage } from '@/api/message'

// ==================== Types ====================

export interface GroupItem {
  id: string
  name: string
  avatar: string
  owner_id: string
  owner_type: string
  group_type: string
  notice: string
  member_count: number
  last_content: string
  last_time: string
  unread_count: number
}

export interface MemberItem {
  user_id: string
  user_type: string
  role: string
  nickname: string
  joined_at: string
  is_muted: boolean
}

export interface GroupMessageVO {
  id: string
  sender_id: string
  sender_type: string
  content: string
  extra: string
  msg_type: string
  reply_to: string
  created_at: string
}

// ==================== Group ====================

export function fetchMyGroups() {
  return request.Get<Service.ResponseResult<GroupItem[]>>('/api/v1/c/im/group/my-groups')
}

export function fetchGroupDetail(params: { group_id: string }) {
  return request.Get<Service.ResponseResult<GroupItem>>('/api/v1/c/im/group/detail', { params })
}

export function fetchCreateGroup(data: {
  name: string
  avatar?: string
  member_ids?: string[]
  member_type?: string
}) {
  return request.Post<Service.ResponseResult<GroupItem>>('/api/v1/c/im/group/create', data)
}

export function fetchGroupMembers(params: { group_id: string }) {
  return request.Get<Service.ResponseResult<MemberItem[]>>('/api/v1/c/im/group/members', { params })
}

export function fetchGroupMessages(params: {
  group_id: string
  cursor?: string
  size?: number
}) {
  return request.Get<Service.ResponseResult<{
    records: GroupMessageVO[]
    has_more: boolean
  }>>('/api/v1/c/im/group/messages', { params })
}

export function fetchSendGroupMessage(data: {
  group_id: string
  content: string
  msg_type?: string
  extra?: string
  reply_to?: string
}) {
  return request.Post<Service.ResponseResult<GroupMessageVO>>('/api/v1/c/im/group/send', data)
}

export function fetchRecallMessage(data: {
  group_id: string
  message_id: string
}) {
  return request.Post<Service.ResponseResult>('/api/v1/c/im/group/recall', data)
}

export function fetchMarkGroupRead(data: {
  group_id: string
  message_id: string
}) {
  return request.Post<Service.ResponseResult>('/api/v1/c/im/group/mark-read', data)
}

export function fetchSearchMessages(params: {
  group_id: string
  keyword: string
  cursor?: string
  size?: number
}) {
  return request.Get<Service.ResponseResult<{
    records: GroupMessageVO[]
    has_more: boolean
  }>>('/api/v1/c/im/group/search', { params })
}

export function fetchJoinGroup(data: { group_id: string }) {
  return request.Post<Service.ResponseResult>('/api/v1/c/im/group/join', data)
}

export function fetchLeaveGroup(data: { group_id: string }) {
  return request.Post<Service.ResponseResult>('/api/v1/c/im/group/leave', data)
}
