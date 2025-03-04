import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'pt';

export interface Translations {
  common: {
    save: string;
    cancel: string;
    back: string;
    create: string;
    edit: string;
    delete: string;
    actions: string;
    loading: string;
    saving: string;
    name: string;
    description: string;
    parameters: string;
    toResolve: string;
    error: string;
    success: string;
    warning: string;
    waitAndTryAgain: string;
  };
  auth: {
    signIn: string;
    signOut: string;
    email: string;
    password: string;
    forgotPassword: string;
    resetPassword: string;
    sendResetLink: string;
    sendingLink: string;
    backToLogin: string;
  };
  bots: {
    createBot: string;
    editBot: string;
    editBotDescription: string;
    selectExchange: string;
    apiKey: string;
    secretKey: string;
    apiKeyPlaceholder: string;
    apiSecretPlaceholder: string;
    validating: string;
    validateAndContinue: string;
    tradingPair: string;
    selectTradingPair: string;
    strategy: string;
    selectStrategy: string;
    useTestnet: string;
    name: string;
    active: string;
    paused: string;
    statistics: string;
    totalTrades: string;
    winRate: string;
    profitLoss: string;
    noCredentials: string;
    noBalancesAvailable: string;
    balancePercentage: string;
    botName: string;
    botNamePlaceholder: string;
    alertName: string;
    alertNamePlaceholder: string;
    webhookEndpointTitle: string;
    webhookUrl: string;
    webhookSecretKeyHelp: string;
    webhookAllowedIPsHelp: string;
    webhookMaxOrdersHelp: string;
    createdAt: string;
    updatedAt: string;
    noActiveBots: string;
    noPausedBots: string;
  };
  dashboard: {
    overview: string;
    activeBots: string;
    totalBots: string;
    totalBalanceByAsset: string;
    refreshBalances: string;
    searchPlaceholder: string;
    noBotsFound: string;
    myBots: string;
    strategies: string;
    logs: string;
    noBalancesAvailable: string;
  };
  strategies: {
    title: string;
    createStrategy: string;
    editStrategy: string;
    entry: string;
    stopLoss: string;
    takeProfit: string;
    leverage: string;
  };
  logs: {
    title: string;
    date: string;
    bot: string;
    message: string;
    level: string;
    noLogsFound: string;
    clearLogs: string;
  };
  trading: {
    available: string;
    locked: string;
    quoteAsset: string;
    inOrder: string;
  };
  success: {
    botCreated: string;
    botUpdated: string;
    botDeleted: string;
    botActivated: string;
    botPaused: string;
  };
  errors: {
    fillAllCredentials: string;
    unsupportedExchange: string;
    invalidCredentials: string;
    generalError: string;
    failedToLoadBots: string;
    credentialsNotConfigured: string;
    errorLoadingBalances: string;
    failedToDeleteBot: string;
    sessionExpired: string;
  };
}

// Traduções em inglês
export const en: Translations = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    back: 'Back',
    create: 'Create',
    edit: 'Edit',
    delete: 'Delete',
    actions: 'Actions',
    loading: 'Loading...',
    saving: 'Saving...',
    name: 'Name',
    description: 'Description',
    parameters: 'Parameters',
    toResolve: 'Resolve',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    waitAndTryAgain: 'Please wait a moment and try again',
  },
  auth: {
    signIn: 'Sign In',
    signOut: 'Sign Out',
    email: 'Email',
    password: 'Password',
    forgotPassword: 'Forgot your password?',
    resetPassword: 'Reset Password',
    sendResetLink: 'Send Reset Link',
    sendingLink: 'Sending link...',
    backToLogin: 'Back to Login',
  },
  bots: {
    createBot: 'Create Bot',
    editBot: 'Edit Bot',
    editBotDescription: 'Configure your trading bot parameters',
    selectExchange: 'Select Exchange',
    apiKey: 'API Key',
    secretKey: 'Secret Key',
    apiKeyPlaceholder: 'Paste your API key here',
    apiSecretPlaceholder: 'Paste your secret key here',
    validating: 'Validating credentials...',
    validateAndContinue: 'Validate & Continue',
    tradingPair: 'Trading Pair',
    selectTradingPair: 'Select a trading pair',
    strategy: 'Strategy',
    selectStrategy: 'Select a strategy',
    useTestnet: 'Use Testnet',
    name: 'Bot Name',
    active: 'Active',
    paused: 'Paused',
    statistics: 'Statistics',
    totalTrades: 'Total Trades',
    winRate: 'Win Rate',
    profitLoss: 'Profit/Loss',
    noCredentials: 'No credentials',
    noBalancesAvailable: 'No balances available',
    balancePercentage: 'Balance Percentage',
    botName: 'Bot Name',
    botNamePlaceholder: 'Enter bot name',
    alertName: 'Alert Name',
    alertNamePlaceholder: 'Enter alert name',
    webhookEndpointTitle: 'Webhook Endpoint',
    webhookUrl: 'Webhook URL',
    webhookSecretKeyHelp: 'Secret key to authenticate webhook requests',
    webhookAllowedIPsHelp: 'List of IPs allowed to send signals (comma separated)',
    webhookMaxOrdersHelp: 'Maximum number of orders allowed per minute',
    createdAt: 'Created At',
    updatedAt: 'Updated At',
    noActiveBots: 'No active bots',
    noPausedBots: 'No paused bots',
  },
  dashboard: {
    overview: 'Overview',
    activeBots: 'Active Bots',
    totalBots: 'Total Bots',
    totalBalanceByAsset: 'Total Balance by Asset',
    refreshBalances: 'Refresh Balances',
    searchPlaceholder: 'Search bots...',
    noBotsFound: 'No bots found',
    myBots: 'My Bots',
    strategies: 'Strategies',
    logs: 'Logs',
    noBalancesAvailable: 'No balances available',
  },
  strategies: {
    title: 'Strategies',
    createStrategy: 'Create Strategy',
    editStrategy: 'Edit Strategy',
    entry: 'Entry',
    stopLoss: 'Stop Loss',
    takeProfit: 'Take Profit',
    leverage: 'Leverage',
  },
  logs: {
    title: 'Logs',
    date: 'Date',
    bot: 'Bot',
    message: 'Message',
    level: 'Level',
    noLogsFound: 'No logs found',
    clearLogs: 'Clear Logs',
  },
  trading: {
    available: 'Available',
    locked: 'Locked',
    quoteAsset: 'Quote Asset',
    inOrder: 'In Order',
  },
  success: {
    botCreated: 'Bot created successfully',
    botUpdated: 'Bot updated successfully',
    botDeleted: 'Bot deleted successfully',
    botActivated: 'Bot activated successfully',
    botPaused: 'Bot paused successfully',
  },
  errors: {
    fillAllCredentials: 'Please fill in all credentials',
    unsupportedExchange: 'Unsupported exchange',
    invalidCredentials: 'Invalid credentials',
    generalError: 'An error occurred',
    failedToLoadBots: 'Failed to load bots',
    credentialsNotConfigured: 'Credentials not configured',
    errorLoadingBalances: 'Error loading balances',
    failedToDeleteBot: 'Failed to delete bot',
    sessionExpired: 'Session expired. Please sign in again.',
  },
};

// Traduções em português
export const pt: Translations = {
  common: {
    save: 'Salvar',
    cancel: 'Cancelar',
    back: 'Voltar',
    create: 'Criar',
    edit: 'Editar',
    delete: 'Excluir',
    actions: 'Ações',
    loading: 'Carregando...',
    saving: 'Salvando...',
    name: 'Nome',
    description: 'Descrição',
    parameters: 'Parâmetros',
    toResolve: 'Resolver',
    error: 'Erro',
    success: 'Sucesso',
    warning: 'Aviso',
    waitAndTryAgain: 'Aguarde um momento e tente novamente',
  },
  auth: {
    signIn: 'Entrar',
    signOut: 'Sair',
    email: 'Email',
    password: 'Senha',
    forgotPassword: 'Esqueceu sua senha?',
    resetPassword: 'Redefinir senha',
    sendResetLink: 'Enviar link de redefinição',
    sendingLink: 'Enviando link...',
    backToLogin: 'Voltar para o login',
  },
  bots: {
    createBot: 'Criar Bot',
    editBot: 'Editar Bot',
    editBotDescription: 'Configure os parâmetros do seu bot de trading',
    selectExchange: 'Selecione a Exchange',
    apiKey: 'Chave da API',
    secretKey: 'Chave Secreta',
    apiKeyPlaceholder: 'Cole sua chave da API aqui',
    apiSecretPlaceholder: 'Cole sua chave secreta aqui',
    validating: 'Validando credenciais...',
    validateAndContinue: 'Validar e Continuar',
    tradingPair: 'Par de Trading',
    selectTradingPair: 'Selecione um par de trading',
    strategy: 'Estratégia',
    selectStrategy: 'Selecione uma estratégia',
    useTestnet: 'Usar Testnet',
    name: 'Nome do Bot',
    active: 'Ativo',
    paused: 'Pausado',
    statistics: 'Estatísticas',
    totalTrades: 'Negociações',
    winRate: 'Vitórias',
    profitLoss: 'Lucro',
    noCredentials: 'Sem credenciais',
    noBalancesAvailable: 'Nenhum saldo disponível',
    balancePercentage: 'Porcentagem do Saldo',
    botName: 'Nome do Bot',
    botNamePlaceholder: 'Digite o nome do bot',
    alertName: 'Nome do Alerta',
    alertNamePlaceholder: 'Digite o nome do alerta',
    webhookEndpointTitle: 'Endpoint do Webhook',
    webhookUrl: 'URL do Webhook',
    webhookSecretKeyHelp: 'Chave secreta para autenticar requisições do webhook',
    webhookAllowedIPsHelp: 'Lista de IPs permitidos para enviar sinais (separados por vírgula)',
    webhookMaxOrdersHelp: 'Número máximo de ordens permitidas por minuto',
    createdAt: 'Criado em',
    updatedAt: 'Atualizado em',
    noActiveBots: 'Nenhum bot ativo',
    noPausedBots: 'Nenhum bot pausado',
  },
  dashboard: {
    overview: 'Visão Geral',
    activeBots: 'Bots Ativos',
    totalBots: 'Total de Bots',
    totalBalanceByAsset: 'Saldo Total por Ativo',
    refreshBalances: 'Atualizar Saldos',
    searchPlaceholder: 'Buscar bots...',
    noBotsFound: 'Nenhum bot encontrado',
    myBots: 'Meus Bots',
    strategies: 'Estratégias',
    logs: 'Logs',
    noBalancesAvailable: 'Nenhum saldo disponível',
  },
  strategies: {
    title: 'Estratégias',
    createStrategy: 'Criar Estratégia',
    editStrategy: 'Editar Estratégia',
    entry: 'Entrada',
    stopLoss: 'Stop Loss',
    takeProfit: 'Take Profit',
    leverage: 'Alavancagem',
  },
  logs: {
    title: 'Logs',
    date: 'Data',
    bot: 'Bot',
    message: 'Mensagem',
    level: 'Nível',
    noLogsFound: 'Nenhum log encontrado',
    clearLogs: 'Limpar Logs',
  },
  trading: {
    available: 'Disponível',
    locked: 'Bloqueado',
    quoteAsset: 'Ativo Base',
    inOrder: 'Em Ordem',
  },
  success: {
    botCreated: 'Bot criado com sucesso',
    botUpdated: 'Bot atualizado com sucesso',
    botDeleted: 'Bot excluído com sucesso',
    botActivated: 'Bot ativado com sucesso',
    botPaused: 'Bot pausado com sucesso',
  },
  errors: {
    fillAllCredentials: 'Por favor, preencha todas as credenciais',
    unsupportedExchange: 'Exchange não suportada',
    invalidCredentials: 'Credenciais inválidas',
    generalError: 'Ocorreu um erro',
    failedToLoadBots: 'Falha ao carregar bots',
    credentialsNotConfigured: 'Credenciais não configuradas',
    errorLoadingBalances: 'Erro ao carregar saldos',
    failedToDeleteBot: 'Falha ao excluir bot',
    sessionExpired: 'Sessão expirada. Por favor, faça login novamente.',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const translations: Record<Language, Translations> = {
  en,
  pt,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    // Recupera o idioma salvo no localStorage ou usa 'pt' como padrão
    const savedLanguage = localStorage.getItem('language');
    return (savedLanguage === 'en' || savedLanguage === 'pt') 
      ? savedLanguage as Language 
      : 'pt';
  });

  // Atualiza o idioma e salva no localStorage
  const handleSetLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const value: LanguageContextType = {
    language,
    setLanguage: handleSetLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}