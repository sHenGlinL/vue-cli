import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    host: true,
    proxy: {
      '/aj_project': {
        target: 'http://157.0.243.82:9090/',
        changeOrigin: true
      }
    },
  }
})
