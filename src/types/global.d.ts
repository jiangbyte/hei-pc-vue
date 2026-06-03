/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $dict: {
      label: (typeCode: string, value: string) => string
      color: (typeCode: string, value: string) => string
      items: (typeCode: string) => any[]
    }
  }
}

export {}
