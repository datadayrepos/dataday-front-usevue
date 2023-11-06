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
        '@datadayrepos/usevueshared': resolve(__dirname, 'shared/index.ts'),
        '@datadayrepos/usevuecore': resolve(__dirname, 'core/index.ts'),
      },
      dedupe: [
        'vue',
        '@vue/runtime-core',
      ],
    },
    optimizeDeps: {
      exclude: [
        'vue',
        '@datadayrepos/usevueshared',
        '@datadayrepos/usevuecore',
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
