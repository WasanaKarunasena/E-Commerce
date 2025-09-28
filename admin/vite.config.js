import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/users': process.env.VITE_BACKEND_URL,
      '/api': process.env.VITE_BACKEND_URL,
    },
  },
})
