import { h } from 'vue'
import * as Icons from '@ant-design/icons-vue'

export function resolveIcon(name: string) {
  const pascal = name
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/\s/g, '')
  const key = pascal.endsWith('Outlined') ? pascal : pascal + 'Outlined'
  return (Icons as any)[key] || null
}

export function resolveIconRender(name?: string) {
  if (!name) return undefined
  const icon = resolveIcon(name)
  return icon ? () => h(icon) : undefined
}
