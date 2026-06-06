import { request } from '@/utils'

/** Public banners */
export function fetchBannerList(params?: { position?: string }) {
  return request.Get<Service.ResponseResult>('/api/v1/public/c/banner/list', { params })
}
