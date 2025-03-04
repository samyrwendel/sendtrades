import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: {
      // Configuração específica para o HMR
      protocol: 'ws', // Usar WebSocket
      host: 'localhost', // Usar localhost para evitar problemas de rede
      clientPort: 5173, // Porta do cliente
      timeout: 10000, // Aumentar o timeout para 10 segundos
    },
    cors: {
      origin: [
        'http://localhost:5173',
        'http://localhost:3001',
        'http://192.168.1.16:5173',
        'http://192.168.1.16:3001',
        /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/,
        /^https:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/
      ],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'X-MEXC-APIKEY'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    },
    proxy: {
      '/api/v3': {
        target: 'https://api.mexc.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/v3/, '/api/v3'),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('\n=== Proxy Request ===');
            console.log('Method:', req.method);
            console.log('URL:', req.url);
            console.log('Original Headers:', JSON.stringify(req.headers, null, 2));

            // Remover headers que podem causar problemas
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('referer');

            // Garantir que os headers corretos sejam enviados
            if (req.headers['x-mexc-apikey']) {
              const apiKey = String(req.headers['x-mexc-apikey']);
              console.log('Setting API Key:', apiKey.substring(0, 4) + '...');
              proxyReq.setHeader('X-MEXC-APIKEY', apiKey);
            }

            // Headers necessários para a API da MEXC
            proxyReq.setHeader('Content-Type', 'application/json');

            console.log('Final Headers:', JSON.stringify(proxyReq.getHeaders(), null, 2));
          });

          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('\n=== Proxy Response ===');
            console.log('Status:', proxyRes.statusCode);
            console.log('Headers:', JSON.stringify(proxyRes.headers, null, 2));

            let body = '';
            proxyRes.on('data', chunk => {
              body += chunk;
            });
            proxyRes.on('end', () => {
              try {
                const data = JSON.parse(body);
                console.log('Response Body:', JSON.stringify(data, null, 2));
              } catch (e) {
                console.log('Response Body (raw):', body);
              }
            });
          });

          proxy.on('error', (err, req, res) => {
            console.error('Proxy Error:', err);
            if (!res.headersSent) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Proxy Error', details: err.message }));
            }
          });
        }
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'ui': [
            './src/components/ui/alert-dialog.tsx',
            './src/components/ui/badge.tsx',
            './src/components/ui/input.tsx',
            './src/components/ui/label.tsx'
          ]
        }
      }
    }
  }
});
