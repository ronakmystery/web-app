import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // 👈 or use '0.0.0.0'
    port: 5173, // or any port you want
  },
})
