import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    global: 'globalThis',
    'process.env': '{}',
    'process.browser': 'true',
    'process.version': '"v16.0.0"',
  },
  resolve: {
    alias: {
      buffer: 'buffer',
      process: 'process/browser',
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
    },
  },
  optimizeDeps: {
    include: [
      '@meshsdk/core', 
      '@meshsdk/react',
      'buffer', 
    ]
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
})
