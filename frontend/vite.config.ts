import react from '@vitejs/plugin-react'
import { URL, fileURLToPath } from 'url'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
// eslint-disable-next-line no-empty-pattern
export default defineConfig(({}) => {
  // const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    resolve: {
      alias: [{ find: '~', replacement: fileURLToPath(new URL('./src', import.meta.url)) }]
    }
  }
})
