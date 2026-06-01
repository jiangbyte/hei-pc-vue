declare namespace Service {
  interface BackendConfig {
    codeKey: string
    dataKey: string
    msgKey: string
    successCode: number
    successKey?: string
  }

  interface ResponseResult<T = any> {
    success: boolean
    errorType: 'Response Error' | 'Business Error' | null
    code: number | string
    message: string
    data: T
    [key: string]: any
  }

  interface PageResult<T = any> {
    records: T[]
    total: number
    page: number
    size: number
    pages: number
  }
}
