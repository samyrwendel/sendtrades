import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Declaração de tipo para as propriedades HMR na janela
declare global {
  interface Window {
    __HMR_TIMEOUT_MS__?: number;
    __HMR_MAX_RETRIES__?: number;
    __HMR_RETRY_COUNT__?: number;
  }
}

// Configuração de parâmetros para o tratamento de erros do HMR
window.__HMR_TIMEOUT_MS__ = 15000; // 15 segundos de timeout
window.__HMR_MAX_RETRIES__ = 5; // Máximo de 5 tentativas
window.__HMR_RETRY_COUNT__ = 0; // Contador inicial

// Função para reconectar o HMR
const reconnectHMR = () => {
  if (import.meta.hot) {
    console.log('🔄 Tentando reconectar o HMR...');
    
    // Força uma atualização da página se exceder o número máximo de tentativas
    if (window.__HMR_RETRY_COUNT__ && window.__HMR_RETRY_COUNT__ >= (window.__HMR_MAX_RETRIES__ || 5)) {
      console.log('🔄 Número máximo de tentativas excedido, recarregando a página...');
      window.location.reload();
      return;
    }
    
    // Incrementa o contador de tentativas
    window.__HMR_RETRY_COUNT__ = (window.__HMR_RETRY_COUNT__ || 0) + 1;
    
    try {
      // Tenta invalidar o módulo atual para forçar uma reconexão
      import.meta.hot.invalidate();
      console.log('✅ HMR reconectado com sucesso');
    } catch (error) {
      console.warn('⚠️ Falha ao reconectar o HMR:', error);
      
      // Agenda uma nova tentativa após um intervalo
      setTimeout(() => {
        reconnectHMR();
      }, 2000);
    }
  }
};

// Tratamento global de erros para capturar problemas de comunicação
window.addEventListener('error', (event) => {
  // Verificar se é um erro relacionado ao HMR ou WebSocket
  if (
    event.message.includes('message channel closed') ||
    event.message.includes('WebSocket') ||
    event.message.includes('asynchronous response') ||
    event.message.includes('HMR')
  ) {
    console.warn('⚠️ Erro de comunicação HMR detectado:', event.message);
    // Prevenir que o erro seja exibido no console como um erro não tratado
    event.preventDefault();
    
    // Tenta reconectar o HMR
    reconnectHMR();
  }
});

// Tratamento para promessas não tratadas
window.addEventListener('unhandledrejection', (event) => {
  if (
    event.reason?.message?.includes('message channel closed') ||
    event.reason?.message?.includes('WebSocket') ||
    event.reason?.message?.includes('asynchronous response') ||
    event.reason?.message?.includes('HMR')
  ) {
    console.warn('⚠️ Promessa não tratada relacionada à comunicação HMR:', event.reason.message);
    // Prevenir que o erro seja exibido no console
    event.preventDefault();
    
    // Tenta reconectar o HMR
    reconnectHMR();
  }
});

// Configuração do HMR para lidar com desconexões
if (import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', () => {
    console.log('🔄 Atualizando módulos...');
  });
  
  import.meta.hot.on('vite:error', (error) => {
    console.warn('⚠️ Erro do Vite detectado:', error);
    reconnectHMR();
  });
  
  // Limpa o contador de tentativas quando o HMR se conecta com sucesso
  import.meta.hot.on('vite:afterUpdate', () => {
    console.log('✅ Módulos atualizados com sucesso');
    window.__HMR_RETRY_COUNT__ = 0;
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
