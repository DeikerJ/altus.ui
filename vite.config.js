import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
   base:'/altus.ui/',
  server: {
   
    proxy: {
      // Tu proxy para desarrollo local
      '/api': {
        // Apunta al subdirectorio /api/v1 en tu FastAPI
        target: 'http://localhost:8000/api/v1',
        changeOrigin: true,
        secure: false,
        // Deja caer solo "/api" para que al final quede "/api/v1/retos"
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy) => {
          proxy.on('error', (err) =>
            console.log('Proxy error:', err)
          )
          proxy.on('proxyReq', (req) =>
            console.log('Proxying to backend path:', req.path)
          )
        }
      }
    }
  }
})
