import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },

    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.GOOGLE_SCRIPT_URL || 'https://script.google.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => {
            const url = new URL(path, 'http://localhost');
            const params = new URLSearchParams(url.search);

            if (!params.has('key') && env.API_KEY) {
              params.append('key', env.API_KEY);
            }

            return url.pathname.replace(/^\/api/, '') + (params.toString() ? '?' + params.toString() : '');
          },
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              console.log('[DEV PROXY]', req.method, proxyReq.path);
            });

            proxy.on('proxyRes', (proxyRes, req) => {
              console.log('[DEV PROXY] Response:', proxyRes.statusCode, req.url);
            });

            proxy.on('error', (err, req) => {
              console.error('[DEV PROXY] Error:', err.message, req.url);
            });
          }
        }
      }
    }
  };
});
