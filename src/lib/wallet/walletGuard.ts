// Interface para o Wallet Guard
interface WalletGuardStatus {
  isEnabled: boolean;
  isRunning: boolean;
}

// Estado inicial do Wallet Guard
let walletGuardStatus: WalletGuardStatus = {
  isEnabled: false,
  isRunning: false
};

// Verifica se o Wallet Guard está presente
export function checkWalletGuard(): WalletGuardStatus {
  try {
    // Verifica se a extensão está instalada
    const isEnabled = typeof window !== 'undefined' && 
      'walletGuard' in window;
    
    // Atualiza o status
    walletGuardStatus = {
      isEnabled,
      isRunning: isEnabled && (window as any).walletGuard?.isRunning
    };

    // Log apenas em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log('Wallet Guard Status:', walletGuardStatus);
    }

    return walletGuardStatus;
  } catch (error) {
    console.warn('Erro ao verificar Wallet Guard:', error);
    return walletGuardStatus;
  }
}

// Inicializa o Wallet Guard se necessário
export function initWalletGuard() {
  const status = checkWalletGuard();
  
  if (status.isEnabled && !status.isRunning) {
    try {
      // Tenta inicializar o Wallet Guard
      (window as any).walletGuard?.init({
        silent: true, // Não mostra logs em produção
        allowedDomains: [
          window.location.hostname,
          'mexc.com',
          'binance.com',
          'kucoin.com',
          'bybit.com',
          'coinbase.com',
          'kraken.com'
        ]
      });
    } catch (error) {
      console.warn('Erro ao inicializar Wallet Guard:', error);
    }
  }
} 