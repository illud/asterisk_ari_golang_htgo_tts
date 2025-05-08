import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,      // This exposes the dev server to the network
    port: 5173       // Optional: ensures the correct port
  }
})
