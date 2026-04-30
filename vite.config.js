import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  base: '/789456/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('element-plus')) return 'element-plus'
          if (id.includes('echarts') || id.includes('zrender')) return 'echarts'
          if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router'))
            return 'vue-vendor'
        }
      }
    },
    chunkSizeWarningLimit: 1100
  },
  server: {
    port: 3000,
    open: true
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  }
})