import fs from 'fs'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      host: true,
      port: 5173,
      allowedHosts: ['servieco.ddns.net'],
      https: {
        key: fs.readFileSync('C:/certs/servieco.key'),
        cert: fs.readFileSync('C:/certs/fullchain.pem'),
      },
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET || 'http://localhost:3000',
          changeOrigin: true,
          secure: false
        }
      }
    }
  };
});