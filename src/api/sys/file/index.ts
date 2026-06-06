import { request, uploadRequest } from '@/utils/http'

export function uploadFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return uploadRequest.Post<Service.ResponseResult<{ url: string; path: string }>>(
    '/api/v1/c/file/upload',
    formData
  )
}
