import { request } from '@/utils'

/** Public biz config list by category */
export function fetchConfigListByCategory(params: { category: string }) {
  return request.Get<Service.ResponseResult<any[]>>('/api/v1/public/c/config/list-by-category', {
    params,
  })
}
