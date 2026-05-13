/// <reference types="vitest" />

import https from 'node:https'
import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/dagtour/',
  plugins: [
    react(),
    legacy()
  ],
  server: {
    proxy: {
      '/zvonok-proxy': {
        target: 'https://zvonok.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/zvonok-proxy/, ''),
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }
})
