import { resolve } from 'node:path'
import { createRequire } from 'node:module'
import type { UserConfig } from 'vite'
import { defineConfig } from 'vite'

const require = createRequire(import.meta.url)

export default defineConfig(async () => {
  return <UserConfig>{
    server: {
      hmr: {
        overlay: false,
      },
      fs: {
        allow: [
          resolve(__dirname, '..'),
        ],
      },
    },
    plugins: [
    ],
    resolve: {
      alias: {
        '@vueuse/shared': resolve(__dirname, 'shared/index.ts'),
        '@vueuse/core': resolve(__dirname, 'core/index.ts'),
      },
      dedupe: [
        'vue',
        '@vue/runtime-core',
      ],
    },
    optimizeDeps: {
      exclude: [
        '@vueuse/shared',
        '@vueuse/core',
        'body-scroll-lock',
      ],
      include: [
        'js-yaml',
        'nprogress',
        'qrcode',
        'tslib',
        'universal-cookie',
      ],
    },
    css: {
      postcss: {
        plugins: [
          require('postcss-nested'),
        ],
      },
    },
  }
})
