import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(() => {
  return {
    plugins: [
      vue(),
      Components({
        dts: fileURLToPath(new URL('./src/types/components.d.ts', import.meta.url)),
        resolvers: [
          AntDesignVueResolver({ importStyle: false }),
        ],
      }),
      UnoCSS(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3100,
    },
  }
})
