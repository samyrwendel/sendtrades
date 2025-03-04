// Tipos de erro conhecidos
export enum ErrorType {
  ACCOUNT_NOT_FOUND = 'ACCOUNT_NOT_FOUND',
  WALLET_ERROR = 'WALLET_ERROR',
  API_ERROR = 'API_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN = 'UNKNOWN'
}

// Interface para erros padronizados
export interface StandardError {
  type: ErrorType;
  code: number;
  message: string;
  originalError?: any;
  data?: any;
  isHandled?: boolean;
}

// Função para padronizar erros
export function standardizeError(error: any): StandardError {
  // Se já é um erro padronizado, retorna ele mesmo
  if (error?.type && Object.values(ErrorType).includes(error.type)) {
    return error;
  }

  // Erro de conta não encontrada
  if (error?.code === -32603 && error?.message?.includes('Unable to find any account')) {
    return {
      type: ErrorType.ACCOUNT_NOT_FOUND,
      code: error.code,
      message: 'Conta não encontrada. Por favor, verifique se você está conectado à carteira correta.',
      originalError: error,
      data: error.data
    };
  }

  // Erro de carteira
  if (error?.code && (error.code === 4001 || error?.message?.includes('wallet'))) {
    return {
      type: ErrorType.WALLET_ERROR,
      code: error.code,
      message: 'Erro na carteira. Por favor, verifique sua conexão e tente novamente.',
      originalError: error,
      data: error.data
    };
  }

  // Erro de API
  if (error?.response || error?.request) {
    return {
      type: ErrorType.API_ERROR,
      code: error.response?.status || 500,
      message: error.response?.data?.message || 'Erro na comunicação com o servidor',
      originalError: error,
      data: error.response?.data
    };
  }

  // Erro de rede
  if (error?.message?.includes('network') || error?.message?.includes('Network')) {
    return {
      type: ErrorType.NETWORK_ERROR,
      code: 0,
      message: 'Erro de conexão. Por favor, verifique sua internet.',
      originalError: error
    };
  }

  // Erro desconhecido
  return {
    type: ErrorType.UNKNOWN,
    code: error?.code || 500,
    message: error?.message || 'Ocorreu um erro inesperado',
    originalError: error,
    data: error?.data
  };
}

// Handler global de erros
export function handleError(error: any): void {
  // Se o erro já foi tratado, não processa novamente
  if (error?.isHandled) {
    return;
  }

  try {
    const standardError = standardizeError(error);
    standardError.isHandled = true;

    // Armazenar console.error original
    const originalConsoleError = console.error;

    if (process.env.NODE_ENV === 'development') {
      // Restaurar console.error original temporariamente
      console.error = originalConsoleError;

      console.group('🔥 Erro Detectado:');
      originalConsoleError('📋 Tipo:', standardError.type);
      originalConsoleError('🔢 Código:', standardError.code);
      originalConsoleError('📝 Mensagem:', standardError.message);
      if (standardError.data) {
        originalConsoleError('📊 Dados:', standardError.data);
      }
      if (standardError.originalError) {
        originalConsoleError('⚠️ Erro Original:', standardError.originalError);
      }
      console.groupEnd();
    } else {
      // Em produção, log simplificado
      console.error = originalConsoleError;
      originalConsoleError(`[${standardError.type}] ${standardError.message}`);
    }
  } catch (handlerError) {
    // Se houver erro no handler, usa console.error original
    const originalConsoleError = console.error;
    console.error = originalConsoleError;
    originalConsoleError('❌ Erro no errorHandler:', handlerError);
  }

  // Aqui você pode adicionar integração com serviços de monitoramento
  // como Sentry, LogRocket, etc.
} 