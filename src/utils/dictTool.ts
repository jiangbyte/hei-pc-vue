import { useDictStore } from '@/store'

export function dictLabel(typeCode: string, value: string): string {
  return useDictStore().dictLabel(typeCode, value)
}

export function dictColor(typeCode: string, value: string): string {
  return useDictStore().dictColor(typeCode, value)
}

export function getDictItems(typeCode: string): any[] {
  return useDictStore().getDictItems(typeCode)
}
