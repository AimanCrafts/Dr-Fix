import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/app/',
  build: {
    outDir: '../Backend/public/app',
    emptyOutDir: true,
  },
  server: {
    proxy: { '/api': 'http://127.0.0.1:8000' },
  },
})