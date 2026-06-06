import { request } from '@/utils'

export interface FriendItem {
  user_id: string
  user_type: string
  nickname: string
  avatar: string
  remark: string
  added_at: string
}

export interface FriendRequestItem {
  id: string
  sender_id: string
  sender_type: string
  receiver_id: string
  receiver_type: string
  remark: string
  status: string
  created_at: string
}

export interface SearchUserResult {
  user_id: string
  user_type: string
  nickname: string
  avatar: string
}

export interface BlockItem {
  blocked_id: string
  blocked_type: string
  created_at: string
}

export function fetchSendFriendRequest(data: {
  receiver_id: string
  receiver_type: string
  remark?: string
}) {
  return request.Post<Service.ResponseResult>('/api/v1/c/im/friend/send-request', data)
}

export function fetchAcceptFriendRequest(data: { request_id: string }) {
  return request.Post<Service.ResponseResult>('/api/v1/c/im/friend/accept', data)
}

export function fetchRejectFriendRequest(data: { request_id: string }) {
  return request.Post<Service.ResponseResult>('/api/v1/c/im/friend/reject', data)
}

export function fetchFriendList() {
  return request.Get<Service.ResponseResult<FriendItem[]>>('/api/v1/c/im/friend/list')
}

export function fetchPendingRequests() {
  return request.Get<
    Service.ResponseResult<{
      incoming: FriendRequestItem[]
      outgoing: FriendRequestItem[]
    }>
  >('/api/v1/c/im/friend/pending-requests')
}

export function fetchRemoveFriend(data: { friend_id: string; friend_type: string }) {
  return request.Post<Service.ResponseResult>('/api/v1/c/im/friend/remove', data)
}

export function fetchBlockUser(data: { blocked_id: string; blocked_type: string }) {
  return request.Post<Service.ResponseResult>('/api/v1/c/im/friend/block', data)
}

export function fetchUnblockUser(data: { blocked_id: string; blocked_type: string }) {
  return request.Post<Service.ResponseResult>('/api/v1/c/im/friend/unblock', data)
}

export function fetchBlockList() {
  return request.Get<Service.ResponseResult<BlockItem[]>>('/api/v1/c/im/friend/block-list')
}

export function fetchRemarkFriend(data: {
  friend_id: string
  friend_type: string
  remark: string
}) {
  return request.Post<Service.ResponseResult>('/api/v1/c/im/friend/remark', data)
}

export function fetchSearchUsers(params: { keyword: string; size?: number }) {
  return request.Get<Service.ResponseResult<SearchUserResult[]>>('/api/v1/c/im/friend/search', {
    params,
  })
}
