import { request } from '@/utils'

/** Homepage data */
export function fetchHome() {
  return request.Get<Service.ResponseResult<any>>('/api/v1/public/c/home')
}
