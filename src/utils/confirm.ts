import { Modal, message } from 'ant-design-vue'

interface DeleteApiParams {
  ids: string[]
}

interface DeleteApiResult {
  success: boolean
}

export function confirmDelete(options: {
  name: string
  selectedKeys: string[]
  deleteApi: (params: DeleteApiParams) => Promise<DeleteApiResult>
  onSuccess: () => void
}) {
  Modal.confirm({
    title: '确定删除？',
    content: `将删除已选择的 ${options.selectedKeys.length} 个${options.name}，请确认。`,
    okType: 'danger',
    onOk: async () => {
      const { success } = await options.deleteApi({ ids: options.selectedKeys })
      if (success) {
        message.success(`成功删除 ${options.selectedKeys.length} 个${options.name}`)
        options.onSuccess()
      }
    },
  })
}
