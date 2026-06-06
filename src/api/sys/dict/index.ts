import { request } from '@/utils'

/** 获取字典树（公开，两端共用） */
export function fetchDictTree(params?: any) {
  return request.Get<Service.ResponseResult>('/api/v1/sys/dict/tree', params)
}
