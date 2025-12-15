import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente do .env
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },

    server: {
      port: 5173,
      host: true, // Permite acesso externo
      open: false, // Não abrir navegador automaticamente
      
      proxy: {
        '/api': {
          target: env.VITE_GOOGLE_SCRIPT_URL || 'https://script.google.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => {
            // Remove /api do início e mantém o resto
            const newPath = path.replace(/^\/api/, '');
            
            // Se não tem parâmetros, adiciona a chave
            if (!newPath.includes('?') && env.VITE_API_KEY) {
              return newPath + '?key=' + encodeURIComponent(env.VITE_API_KEY);
            }
            
            // Se já tem parâmetros, adiciona a chave ao final
            if (env.VITE_API_KEY && !newPath.includes('key=')) {
              const separator = newPath.includes('?') ? '&' : '?';
              return newPath + separator + 'key=' + encodeURIComponent(env.VITE_API_KEY);
            }
            
            return newPath;
          },
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              console.log(`[PROXY REQ] ${req.method} ${req.url} -> ${proxyReq.path}`);
            });
            
            proxy.on('proxyRes', (proxyRes, req) => {
              console.log(`[PROXY RES] ${proxyRes.statusCode} ${req.url}`);
            });
            
            proxy.on('error', (err, req, res) => {
              console.error(`[PROXY ERROR] ${err.message} ${req.url}`);
              
              // Resposta de fallback para evitar erros no frontend
              if (res.writeHead) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  error: 'Proxy error',
                  message: err.message,
                  url: req.url
                }));
              }
            });
          }
        },
        
        // Proxy para Cloudinary (opcional - se quiser esconder o endpoint)
        '/cloudinary': {
          target: 'https://api.cloudinary.com/v1_1',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/cloudinary/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              console.log(`[CLOUDINARY PROXY] ${req.method} ${req.url}`);
            });
          }
        }
      }
    },

    // Configurações de build
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['lucide-react'],
          }
        }
      }
    },

    // Configurações de preview (produção local)
    preview: {
      port: 5173,
      host: true,
      proxy: {
        '/api': {
          target: env.VITE_GOOGLE_SCRIPT_URL || 'https://script.google.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => {
            const newPath = path.replace(/^\/api/, '');
            if (env.VITE_API_KEY && !newPath.includes('key=')) {
              const separator = newPath.includes('?') ? '&' : '?';
              return newPath + separator + 'key=' + encodeURIComponent(env.VITE_API_KEY);
            }
            return newPath;
          }
        }
      }
    },

    // Define variáveis de ambiente para o código do cliente
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV || mode),
    }
  };
});