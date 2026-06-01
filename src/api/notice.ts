import { request } from '@/utils'

/** Public notices page */
export function fetchNoticePage(params: { page?: number; size?: number; [key: string]: any }) {
  return request.Get<Service.ResponseResult<Service.PageResult>>('/api/v1/public/c/notice/page', {
    params,
  })
}

/** Public notice detail */
export function fetchNoticeDetail(params: { id: string }) {
  return request.Get<Service.ResponseResult>('/api/v1/public/c/notice/detail', { params })
}

/** Public latest notices (for homepage) */
export function fetchNoticeLatest(params?: { size?: number }) {
  return request.Get<Service.ResponseResult>('/api/v1/public/c/notice/latest', { params })
}
