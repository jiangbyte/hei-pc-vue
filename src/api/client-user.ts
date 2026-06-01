import { request } from '@/utils'

export function fetchClientUserCurrent() {
  return request.Get<Service.ResponseResult>('/api/v1/client-user/current')
}

export function fetchClientUserUpdateProfile(data: any) {
  return request.Post<Service.ResponseResult>('/api/v1/client-user/update-profile', data)
}

export function fetchClientUserUpdateAvatar(data: any) {
  return request.Post<Service.ResponseResult>('/api/v1/client-user/update-avatar', data)
}

export function fetchClientUserUpdatePassword(data: any) {
  return request.Post<Service.ResponseResult>('/api/v1/client-user/update-password', data)
}
