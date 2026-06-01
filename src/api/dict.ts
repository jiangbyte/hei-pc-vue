import { request } from '@/utils'

/** 获取公开的 BIZ 字典树 */
export function fetchBizDictTree() {
  return request.Get<Service.ResponseResult>('/api/v1/public/biz-dict/tree')
}
