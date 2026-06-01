import { message } from 'ant-design-vue'
import { createAlova } from 'alova'
import { createServerTokenAuthentication } from 'alova/client'
import adapterFetch from 'alova/fetch'
import { xhrRequestAdapter } from '@alova/adapter-xhr'
import VueHook from 'alova/vue'
import type { VueHookType } from 'alova/vue'
import { DEFAULT_ALOVA_OPTIONS, DEFAULT_BACKEND_OPTIONS } from './config'
import { handleBusinessError, handleResponseError } from './handle'

const { onAuthRequired } = createServerTokenAuthentication<VueHookType>({
  assignToken: method => {
    const token = localStorage.getItem('pc_token')
    if (token) {
      method.config.headers.Authorization = token
    }
  },
})

function createAlovaInstance(
  baseURL: string,
  adapter: any,
  backendConfig?: Partial<Service.BackendConfig>
) {
  const bc = { ...DEFAULT_BACKEND_OPTIONS, ...backendConfig }

  return createAlova({
    statesHook: VueHook,
    requestAdapter: adapter,
    baseURL,
    timeout: DEFAULT_ALOVA_OPTIONS.timeout,
    cacheFor: null,

    beforeRequest: onAuthRequired(() => {}),

    responded: {
      onSuccess: async (response, method) => {
        const { status } = response

        if (status === 200) {
          if (method.meta?.isBlob) {
            return typeof response.blob === 'function' ? response.blob() : (response as any).data
          }

          const apiData =
            typeof response.json === 'function' ? await response.json() : (response as any).data

          if (apiData[bc.codeKey] === 401) {
            localStorage.removeItem('pc_token')
            return { ...apiData, success: false }
          }

          if (apiData[bc.codeKey] === bc.successCode) {
            return {
              ...apiData,
              success: true,
              data: apiData[bc.dataKey],
            }
          }

          return handleBusinessError(apiData, bc)
        }

        return handleResponseError(response)
      },
      onError: (error: any, method: any) => {
        const msg = error.message || '网络错误'
        console.error(`[${method.type}] ${method.url}:`, msg)
        message.error(msg)
      },
    },
  })
}

export function createDefaultAlovaInstance(
  baseURL: string,
  backendConfig?: Partial<Service.BackendConfig>
) {
  return createAlovaInstance(baseURL, adapterFetch(), backendConfig)
}

export function createUploadAlovaInstance(
  baseURL: string,
  backendConfig?: Partial<Service.BackendConfig>
) {
  return createAlovaInstance(baseURL, xhrRequestAdapter(), backendConfig)
}
