import { defineConfig } from 'taze'

export default defineConfig({
  recursive: true,
  exclude: [
    'rxjs',
    'msw',
  ],
  packageMode: {
    vue: 'minor',
  },
})
