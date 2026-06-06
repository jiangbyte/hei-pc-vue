import { request } from '@/utils'

export interface ImFileResult {
  url: string
  file_key: string
  bucket: string
  engine: string
  original_name: string
  file_size: number
  file_type: string
}

export function uploadImFile(file: File, msgType: string, conversationId?: string) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('msg_type', msgType)
  if (conversationId) formData.append('conversation_id', conversationId)
  return request.Post<Service.ResponseResult<ImFileResult>>('/api/v1/c/im/file/upload', formData)
}
