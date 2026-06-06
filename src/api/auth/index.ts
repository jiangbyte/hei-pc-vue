import { request } from '@/utils'

export function fetchCaptcha() {
  return request.Get<Service.ResponseResult>('/api/v1/public/c/captcha')
}

export function fetchLogin(data: {
  username: string
  password: string
  captcha_code?: string
  captcha_id?: string
}) {
  return request.Post<Service.ResponseResult<{ token: string }>>('/api/v1/public/c/login', data)
}

export function fetchRegister(data: any) {
  return request.Post<Service.ResponseResult>('/api/v1/public/c/register', data)
}

export function fetchSm2PublicKey() {
  return request.Get<Service.ResponseResult<string>>('/api/v1/public/c/sm2/public-key')
}

export function fetchLogout() {
  return request.Post<Service.ResponseResult>('/api/v1/c/logout')
}
