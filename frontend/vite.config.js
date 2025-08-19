import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/employees': 'http://localhost:8000',
      '/leaves': 'http://localhost:8000'
    }
  }
})