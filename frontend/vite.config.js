/* global process */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { validateViteBuildEnvironment } from './src/lib/deployment-config.js'

// https://vite.dev/config/
export default defineConfig(() => {
  validateViteBuildEnvironment({
    isVercel: process.env.VERCEL === '1',
    apiUrl: process.env.VITE_API_URL,
  })

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      host: '127.0.0.1',
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:5000',
          changeOrigin: true,
        },
        '/uploads': {
          target: 'http://127.0.0.1:5000',
          changeOrigin: true,
        },
      }
    }
  }
})
