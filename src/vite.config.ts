import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true, // Falhar se a porta já estiver em uso
    hmr: {
      // Configuração específica para o HMR
      protocol: 'ws', // Usar WebSocket
      host: 'localhost', // Usar localhost para evitar problemas de rede
      clientPort: 5173, // Porta do cliente
      timeout: 30000, // Aumentar o timeout para 30 segundos
      overlay: true, // Mostrar overlay de erro
      path: 'hmr', // Caminho personalizado para o HMR
    },
    cors: {
      origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    },
    watch: {
      usePolling: true, // Usar polling para detectar mudanças em sistemas onde o watch nativo não funciona bem
      interval: 1000, // Intervalo de polling em ms
    },
    middlewareMode: false, // Desativar o modo middleware para evitar problemas de comunicação
  },
  optimizeDeps: {
    force: false, // Não forçar a otimização de dependências a cada inicialização
    esbuildOptions: {
      // Opções para o esbuild
      target: 'es2020', // Alvo de compatibilidade
      keepNames: true, // Manter nomes de funções e classes
    },
  },
  build: {
    sourcemap: true, // Gerar sourcemaps para facilitar a depuração
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar as dependências em chunks para melhorar o caching
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['tailwindcss'],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Aumentar o limite de aviso de tamanho de chunk
  },
  css: {
    devSourcemap: true, // Gerar sourcemaps para CSS
  },
}); 