interface Translation {
  common: {
    save: string;
    cancel: string;
    back: string;
    create: string;
    edit: string;
    delete: string;
    actions: string;
    loading: string;
    name: string;
    description: string;
    parameters: string;
    toResolve: string;
    accessMexcAccount: string;
    goToApiManagement: string;
    editApiKey: string;
    addCurrentIp: string;
    waitAndTryAgain: string;
  };
  auth: {
    signIn: string;
    email: string;
    password: string;
    emailPlaceholder: string;
    invalidCredentials: string;
    forgotPassword: string;
    resetPassword: string;
    resetPasswordInstructions: string;
    sendResetLink: string;
    sendingLink: string;
    checkYourEmail: string;
    recoveryEmailSent: string;
    backToLogin: string;
    passwordRecoveryError: string;
  };
  dashboard: {
    title: string;
    overview: string;
    myBots: string;
    newBots: string;
    strategies: string;
    logs: string;
    logout: string;
    activeBots: string;
    activeStrategies: string;
    refreshBalances: string;
    totalBalanceByAsset: string;
    noBalancesAvailable: string;
    searchPlaceholder: string;
    noBotsFound: string;
    totalBots: string;
  };
  errors: {
    failedToLoadPairs: string;
    tradingPairsError: string;
    fillAllCredentials: string;
    unsupportedExchange: string;
    invalidCredentials: string;
    generalError: string;
    failedToLoadBots: string;
    failedToCreateBot: string;
    failedToDeleteBot: string;
    sessionExpired: string;
    accountNotFound: string;
    walletError: string;
    networkError: string;
    unexpectedError: string;
    serverError: string;
    noBalancesAvailable: string;
    credentialsValidationError: string;
    ipNotAuthorized: string;
    invalidApiKey: string;
    invalidSignature: string;
    noTradingPermissions: string;
    invalidResponseFormat: string;
    connectionError: string;
    exchangeNotFound: string;
    credentialsNotConfigured: string;
    errorLoadingBalances: string;
    loginError: {
      invalidCredentials: string;
      serverNotFound: string;
      internalError: string;
      networkError: string;
      unexpected: string;
    };
  };
  success: {
    botCreated: string;
    botDeleted: string;
    botUpdated: string;
    botActivated: string;
    botPaused: string;
  };
  trading: {
    pair: string;
    base: string;
    quote: string;
    quoteAsset: string;
    basePrecision: string;
    quotePrecision: string;
    min: string;
    max: string;
    step: string;
    selectPair: string;
    searchPair: string;
    noPairsFound: string;
    pairInfo: string;
    available: string;
    locked: string;
    balances: string;
    inOrder: string;
    percentage: string;
    total: string;
    lastUpdate: string;
  };
  bots: {
    createBot: string;
    editBot: string;
    editBotDescription: string;
    selectExchange: string;
    apiKey: string;
    apiSecret: string;
    apiKeyPlaceholder: string;
    apiSecretPlaceholder: string;
    validating: string;
    validateAndContinue: string;
    apiKeysValidated: string;
    apiDisclaimer1: string;
    apiDisclaimer2: string;
    active: string;
    paused: string;
    error: string;
    noActiveBots: string;
    noPausedBots: string;
    startBot: string;
    pauseBot: string;
    deleteBot: string;
    editBotAction: string;
    fillAllFields: string;
    botName: string;
    botId: string;
    accessKey: string;
    accountBalances: string;
    tradingPair: string;
    webhookConfig: string;
    enableWebhook: string;
    webhookSecret: string;
    webhookSecretPlaceholder: string;
    webhookSecretOptional: string;
    allowedIPs: string;
    allowedIPsPlaceholder: string;
    allowedIPsHelp: string;
    maxOrdersPerMinute: string;
    webhookEndpoint: string;
    webhookEndpointHelp: string;
    exchange: string;
    buySignal: string;
    sellSignal: string;
    importantNotes: string;
    publicIdNote: string;
    tickerNote: string;
    orderSizeNote: string;
    positionSizeNote: string;
    actionNote: string;
    timestampNote: string;
    botNamePlaceholder: string;
    alertName: string;
    alertNamePlaceholder: string;
    webhookEndpointTitle: string;
    webhookSecretKeyHelp: string;
    webhookAllowedIPsHelp: string;
    webhookMaxOrdersHelp: string;
    webhookUrl: string;
    webhookEnabled: string;
    statistics: string;
    totalTrades: string;
    winRate: string;
    profitLoss: string;
    createdAt: string;
    updatedAt: string;
    noCredentials: string;
    balanceTitle: string;
    balanceTotal: string;
    balanceAvailable: string;
    balanceLocked: string;
    balanceInOrder: string;
    balancePercentage: string;
  };
  strategies: {
    title: string;
    newStrategy: string;
    editStrategy: string;
    createStrategy: string;
    confirmDelete: string;
    noStrategies: string;
    entry: string;
    entryType: string;
    market: string;
    limit: string;
    stopLoss: string;
    takeProfit: string;
    leverage: string;
    namePlaceholder: string;
    descriptionPlaceholder: string;
  };
  logs: {
    title: string;
    timestamp: string;
    bot: string;
    action: string;
    details: string;
    status: string;
    noLogs: string;
    loading: string;
    clearLogs: string;
    statuses: {
      success: string;
      error: string;
      warning: string;
      info: string;
    };
  };
  exchanges: {
    recommended: string;
    available: string;
    ready: string;
    comingSoon: string;
    availableExchanges: string;
    recommendedExchange: string;
    standardExchange: string;
    secureAndReliable: string;
    inProgress: string;
    fullyImplemented: string;
    highLiquidity: string;
    comingSoonTitle: string;
  };
}

// Traduções em Inglês
const en: Translation = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    back: 'Back',
    create: 'Create',
    edit: 'Edit',
    delete: 'Delete',
    actions: 'Actions',
    loading: 'Loading...',
    name: 'Name',
    description: 'Description',
    parameters: 'Parameters',
    toResolve: 'To resolve',
    accessMexcAccount: 'Access your MEXC account',
    goToApiManagement: 'Go to API Management',
    editApiKey: 'Edit your API key',
    addCurrentIp: 'Add your current IP to the allowed IPs list',
    waitAndTryAgain: 'Wait a few minutes and try again'
  },
  auth: {
    signIn: 'Sign in',
    email: 'Email address',
    password: 'Password',
    emailPlaceholder: 'you@example.com',
    invalidCredentials: 'Invalid email or password',
    forgotPassword: 'Forgot your password?',
    resetPassword: 'Reset your password',
    resetPasswordInstructions: 'Enter your email address and we will send you a link to reset your password.',
    sendResetLink: 'Send reset link',
    sendingLink: 'Sending link...',
    checkYourEmail: 'Check your email',
    recoveryEmailSent: 'We have sent a password recovery link to your email.',
    backToLogin: 'Back to login',
    passwordRecoveryError: 'Failed to send recovery email. Please try again.'
  },
  dashboard: {
    title: 'Trading Dashboard',
    overview: 'Overview',
    myBots: 'My Bots',
    newBots: 'New Bot System',
    strategies: 'Strategies',
    logs: 'Logs',
    logout: 'Logout',
    activeBots: 'Active Bots',
    activeStrategies: 'Active Strategies',
    refreshBalances: 'Refresh Balances',
    totalBalanceByAsset: 'Total Balance by Asset',
    noBalancesAvailable: 'No balances available',
    searchPlaceholder: 'Search by name, ID, pair or exchange...',
    noBotsFound: 'No bots found matching the search criteria.',
    totalBots: 'Total Bots'
  },
  errors: {
    failedToLoadPairs: 'Failed to load pairs',
    tradingPairsError: 'Error loading trading pairs',
    fillAllCredentials: 'Please fill in all credentials',
    unsupportedExchange: 'Unsupported exchange',
    invalidCredentials: 'Invalid credentials',
    generalError: 'An error occurred. Please try again.',
    failedToLoadBots: 'Failed to load bots from server',
    failedToCreateBot: 'Failed to create bot',
    failedToDeleteBot: 'Failed to delete bot',
    sessionExpired: 'Session expired, please login again',
    accountNotFound: 'Account not found. Please check if you are connected to the correct wallet.',
    walletError: 'Wallet error. Please check your connection and try again.',
    networkError: 'Connection error. Please check your internet.',
    unexpectedError: 'An unexpected error occurred',
    serverError: 'Server communication error',
    noBalancesAvailable: 'No balances available in the account',
    credentialsValidationError: 'Error validating credentials',
    ipNotAuthorized: 'Your IP is not authorized on MEXC. Please add your IP to the allowed IPs list in your API key settings.',
    invalidApiKey: 'Invalid or expired API key.',
    invalidSignature: 'Invalid signature. Check your secret key.',
    noTradingPermissions: 'This API key does not have trading permissions. Please enable trading permissions in the API settings.',
    invalidResponseFormat: 'Invalid response format: balances not found',
    connectionError: 'Connection error. Please check your connection and try again.',
    exchangeNotFound: 'Exchange not found',
    credentialsNotConfigured: 'Credentials not configured',
    errorLoadingBalances: 'Error loading balances',
    loginError: {
      invalidCredentials: 'Invalid email or password. Please check your credentials.',
      serverNotFound: 'Could not connect to server. Please try again in a few moments.',
      internalError: 'Internal server error. Please try again later.',
      networkError: 'Connection error. Check your internet and try again.',
      unexpected: 'An unexpected error occurred. Please try again.'
    }
  },
  success: {
    botCreated: 'Bot created successfully',
    botDeleted: 'Bot deleted successfully',
    botUpdated: 'Bot updated successfully',
    botActivated: 'Bot activated successfully',
    botPaused: 'Bot paused successfully'
  },
  trading: {
    pair: 'Trading Pair',
    base: 'Base Asset',
    quote: 'Quote Asset',
    quoteAsset: 'Quote Asset',
    basePrecision: 'Base Precision',
    quotePrecision: 'Quote Precision',
    min: 'Min',
    max: 'Max',
    step: 'Step',
    selectPair: 'Select a pair...',
    searchPair: 'Search pair...',
    noPairsFound: 'No pairs found',
    pairInfo: 'Pair Information',
    available: 'Available',
    locked: 'Locked',
    balances: 'Account Balances',
    inOrder: 'In Order',
    percentage: 'Percentage',
    total: 'Total',
    lastUpdate: 'Last Update'
  },
  bots: {
    createBot: 'Create Bot',
    editBot: 'Edit Bot',
    editBotDescription: 'Update your trading bot settings.',
    selectExchange: 'Select Exchange',
    apiKey: 'API Key',
    apiSecret: 'Secret Key',
    apiKeyPlaceholder: 'Enter your API key',
    apiSecretPlaceholder: 'Enter your secret key',
    validating: 'Validating...',
    validateAndContinue: 'Validate and Continue',
    apiKeysValidated: 'API keys successfully validated!',
    apiDisclaimer1: 'Your API keys are stored locally and never shared.',
    apiDisclaimer2: 'We recommend creating API keys with read and trading permissions only.',
    active: 'Active',
    paused: 'Paused',
    error: 'Error',
    noActiveBots: 'No active bots at the moment.',
    noPausedBots: 'No paused bots at the moment.',
    startBot: 'Start Bot',
    pauseBot: 'Pause Bot',
    deleteBot: 'Delete Bot',
    editBotAction: 'Edit Bot',
    fillAllFields: 'Please fill in all fields',
    botName: 'Bot Name',
    botId: 'Bot ID',
    accessKey: 'Access Key',
    accountBalances: 'Account Balances',
    tradingPair: 'Trading Pair',
    webhookConfig: 'Trigger this Bot',
    enableWebhook: 'Enable Webhook',
    webhookSecret: 'Webhook Secret Key',
    webhookSecretPlaceholder: 'Enter a secret key to validate requests',
    webhookSecretOptional: 'Leave blank if no validation is needed',
    allowedIPs: 'Allowed IPs',
    allowedIPsPlaceholder: 'Enter allowed IPs separated by comma',
    allowedIPsHelp: 'Leave blank to allow all IPs',
    maxOrdersPerMinute: 'Maximum Orders per Minute',
    webhookEndpoint: 'For TradingView you need at least the Essential plan to create Alerts and use Webhooks.',
    webhookEndpointHelp: 'Send a POST request with the Buy or Sell JSON to the Webhook URL shown above.',
    exchange: 'Exchange',
    buySignal: 'Buy Signal',
    sellSignal: 'Sell Signal',
    importantNotes: 'Important Notes',
    publicIdNote: 'public_id: Identifies your bot. Keep it secret.',
    tickerNote: 'ticker: Used to protect you from sending signals to the wrong bot.',
    orderSizeNote: 'order_size: Specify how much to buy/sell in base asset.',
    positionSizeNote: 'position_size: Specify the position size AFTER trade execution.',
    actionNote: 'action: Can be "buy" or "sell".',
    timestampNote: 'timestamp: Used to prevent duplicate signals (ISO format).',
    botNamePlaceholder: 'Ex: BTCUSDT Scalping Bot',
    alertName: 'Alert Name',
    alertNamePlaceholder: 'Custom name for your alert',
    webhookEndpointTitle: 'Webhook Endpoint / API',
    webhookSecretKeyHelp: 'Leave blank if you don\'t need to validate requests',
    webhookAllowedIPsHelp: 'Leave blank to allow requests from any IP',
    webhookMaxOrdersHelp: 'Limit of orders that can be sent per minute (1-600)',
    webhookUrl: 'Webhook URL',
    webhookEnabled: 'Webhook Enabled',
    statistics: 'Statistics',
    totalTrades: 'Total Trades',
    winRate: 'Win Rate',
    profitLoss: 'Profit/Loss',
    createdAt: 'Created at',
    updatedAt: 'Updated at',
    noCredentials: 'No credentials configured',
    balanceTitle: 'Balance Distribution',
    balanceTotal: 'Total Balance',
    balanceAvailable: 'Available Balance',
    balanceLocked: 'Locked Balance',
    balanceInOrder: 'In Order',
    balancePercentage: '% of Total',
  },
  strategies: {
    title: 'Trading Strategies',
    newStrategy: 'New Strategy',
    editStrategy: 'Edit Strategy',
    createStrategy: 'Create New Strategy',
    confirmDelete: 'Are you sure you want to delete this strategy?',
    noStrategies: 'No strategies created yet. Click the "New Strategy" button to create one.',
    entry: 'Entry',
    entryType: 'Entry Type',
    market: 'Market',
    limit: 'Limit',
    stopLoss: 'Stop Loss',
    takeProfit: 'Take Profit',
    leverage: 'Leverage',
    namePlaceholder: 'Strategy name',
    descriptionPlaceholder: 'Strategy description',
  },
  logs: {
    title: 'Activity Logs',
    timestamp: 'Timestamp',
    bot: 'Bot',
    action: 'Action',
    details: 'Details',
    status: 'Status',
    noLogs: 'No activity logs available.',
    loading: 'Loading records...',
    clearLogs: 'Clear Records',
    statuses: {
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Info'
    }
  },
  exchanges: {
    recommended: 'Recommended',
    available: 'Available',
    ready: 'Ready',
    comingSoon: 'Coming Soon',
    availableExchanges: 'Available Exchanges',
    recommendedExchange: 'This is our recommended exchange for the best trading experience',
    standardExchange: 'A reliable exchange with good trading features',
    secureAndReliable: 'Secure and reliable trading platform',
    inProgress: 'In Progress',
    fullyImplemented: 'Fully Implemented',
    highLiquidity: 'High liquidity and trading volume',
    comingSoonTitle: 'Coming Soon'
  }
};

// Traduções em Português
const ptBR: Translation = {
  common: {
    save: 'Salvar',
    cancel: 'Cancelar',
    back: 'Voltar',
    create: 'Criar',
    edit: 'Editar',
    delete: 'Excluir',
    actions: 'Ações',
    loading: 'Carregando...',
    name: 'Nome',
    description: 'Descrição',
    parameters: 'Parâmetros',
    toResolve: 'Para resolver',
    accessMexcAccount: 'Acesse sua conta na MEXC',
    goToApiManagement: 'Vá em API Management',
    editApiKey: 'Edite sua chave API',
    addCurrentIp: 'Adicione seu IP atual na lista de IPs permitidos',
    waitAndTryAgain: 'Aguarde alguns minutos e tente novamente'
  },
  auth: {
    signIn: 'Entrar',
    email: 'Email',
    password: 'Senha',
    emailPlaceholder: 'seu@email.com',
    invalidCredentials: 'Email ou senha inválidos',
    forgotPassword: 'Esqueceu sua senha?',
    resetPassword: 'Recuperar senha',
    resetPasswordInstructions: 'Digite seu email e enviaremos um link para recuperar sua senha.',
    sendResetLink: 'Enviar link',
    sendingLink: 'Enviando...',
    checkYourEmail: 'Verifique seu email',
    recoveryEmailSent: 'Enviamos um link para recuperação de senha. Por favor, verifique seu email.',
    backToLogin: 'Voltar para o login',
    passwordRecoveryError: 'Falha ao enviar email de recuperação. Tente novamente.',
  },
  dashboard: {
    title: 'Painel de Trading',
    overview: 'Visão Geral',
    myBots: 'Meus Bots',
    newBots: 'Novo Sistema de Bots',
    strategies: 'Estratégias',
    logs: 'Registros',
    logout: 'Sair',
    activeBots: 'Bots Ativos',
    activeStrategies: 'Estratégias Ativas',
    refreshBalances: 'Atualizar Saldos',
    totalBalanceByAsset: 'Saldo Total por Moeda',
    noBalancesAvailable: 'Sem saldos disponíveis',
    searchPlaceholder: 'Buscar por nome, ID, par ou exchange...',
    noBotsFound: 'Nenhum bot encontrado com os critérios de busca.',
    totalBots: 'Total de Bots'
  },
  errors: {
    failedToLoadPairs: 'Falha ao carregar pares',
    tradingPairsError: 'Erro ao carregar pares',
    fillAllCredentials: 'Por favor, preencha todas as credenciais',
    unsupportedExchange: 'Exchange não suportada',
    invalidCredentials: 'Credenciais inválidas',
    generalError: 'Ocorreu um erro. Por favor, tente novamente.',
    failedToLoadBots: 'Falha ao carregar bots do servidor',
    failedToCreateBot: 'Falha ao criar bot',
    failedToDeleteBot: 'Falha ao excluir bot',
    sessionExpired: 'Sessão expirada, faça login novamente',
    accountNotFound: 'Conta não encontrada. Por favor, verifique se você está conectado à carteira correta.',
    walletError: 'Erro na carteira. Por favor, verifique sua conexão e tente novamente.',
    networkError: 'Erro de conexão. Por favor, verifique sua internet.',
    unexpectedError: 'Ocorreu um erro inesperado',
    serverError: 'Erro na comunicação com o servidor',
    noBalancesAvailable: 'Nenhum saldo disponível na conta',
    credentialsValidationError: 'Erro ao validar credenciais',
    ipNotAuthorized: 'Seu IP não está autorizado na MEXC. Por favor, adicione seu IP à lista de IPs permitidos nas configurações da sua chave API.',
    invalidApiKey: 'Chave API inválida ou expirada.',
    invalidSignature: 'Assinatura inválida. Verifique sua chave secreta.',
    noTradingPermissions: 'Esta chave API não tem permissões de trading. Por favor, habilite as permissões de trading nas configurações da API.',
    invalidResponseFormat: 'Formato de resposta inválido: saldos não encontrados',
    connectionError: 'Erro de conexão. Por favor, verifique sua conexão e tente novamente.',
    exchangeNotFound: 'Exchange não encontrada',
    credentialsNotConfigured: 'Credenciais não configuradas',
    errorLoadingBalances: 'Erro ao carregar saldos',
    loginError: {
      invalidCredentials: 'Email ou senha incorretos. Por favor, verifique suas credenciais.',
      serverNotFound: 'Não foi possível conectar ao servidor. Tente novamente em alguns instantes.',
      internalError: 'Erro interno do servidor. Por favor, tente novamente mais tarde.',
      networkError: 'Erro de conexão. Verifique sua internet e tente novamente.',
      unexpected: 'Ocorreu um erro inesperado. Por favor, tente novamente.'
    }
  },
  success: {
    botCreated: 'Bot criado com sucesso',
    botDeleted: 'Bot excluído com sucesso',
    botUpdated: 'Bot atualizado com sucesso',
    botActivated: 'Bot ativado com sucesso',
    botPaused: 'Bot pausado com sucesso'
  },
  trading: {
    pair: 'Trading Pair',
    base: 'Base Asset',
    quote: 'Quote Asset',
    quoteAsset: 'Quote Asset',
    basePrecision: 'Precisão Base',
    quotePrecision: 'Precisão Quote',
    min: 'Min',
    max: 'Max',
    step: 'Step',
    selectPair: 'Selecione um par...',
    searchPair: 'Buscar par...',
    noPairsFound: 'Nenhum par encontrado.',
    pairInfo: 'Informações do Par',
    available: 'Disponível',
    locked: 'Bloqueado',
    balances: 'Saldos',
    inOrder: 'em ordem',
    percentage: 'Porcentagem',
    total: 'Total',
    lastUpdate: 'Última Atualização'
  },
  bots: {
    createBot: 'Criar Bot',
    editBot: 'Editar Bot',
    editBotDescription: 'Atualize as configurações do seu bot de trading.',
    selectExchange: 'Selecionar Exchange',
    apiKey: 'Chave API',
    apiSecret: 'Chave Secreta',
    apiKeyPlaceholder: 'Digite sua chave API',
    apiSecretPlaceholder: 'Digite sua chave secreta',
    validating: 'Validando...',
    validateAndContinue: 'Validar e Continuar',
    apiKeysValidated: 'Chaves API validadas com sucesso!',
    apiDisclaimer1: 'Suas chaves API são armazenadas localmente e nunca são compartilhadas.',
    apiDisclaimer2: 'Recomendamos criar chaves API apenas com permissões de leitura e trading.',
    active: 'Ativo',
    paused: 'Pausado',
    error: 'Erro',
    noActiveBots: 'Nenhum bot ativo no momento.',
    noPausedBots: 'Nenhum bot pausado no momento.',
    startBot: 'Iniciar Bot',
    pauseBot: 'Pausar Bot',
    deleteBot: 'Excluir Bot',
    editBotAction: 'Editar Bot',
    fillAllFields: 'Por favor, preencha todos os campos',
    botName: 'Nome do Bot',
    botId: 'ID do Bot',
    accessKey: 'Chave de Acesso',
    accountBalances: 'Saldos da Conta',
    tradingPair: 'Par de Trading',
    webhookConfig: 'Acionar este Bot',
    enableWebhook: 'Habilitar Webhook',
    webhookSecret: 'Chave Secreta do Webhook',
    webhookSecretPlaceholder: 'Digite uma chave secreta para validar as requisições',
    webhookSecretOptional: 'Deixe em branco se não precisar de validação',
    allowedIPs: 'IPs Permitidos',
    allowedIPsPlaceholder: 'Digite os IPs permitidos separados por vírgula',
    allowedIPsHelp: 'Deixe em branco para permitir todos os IPs',
    maxOrdersPerMinute: 'Máximo de Ordens por Minuto',
    webhookEndpoint: 'Para o TradingView você precisa pelo menos do plano Essential para criar Alertas e usar Webhooks.',
    webhookEndpointHelp: 'Envie uma requisição POST com o JSON de Compra ou Venda para a URL do Webhook acima.',
    exchange: 'Exchange',
    buySignal: 'Sinal de Compra',
    sellSignal: 'Sinal de Venda',
    importantNotes: 'Notas Importantes',
    publicIdNote: 'public_id: Identifica seu bot. Mantenha em segredo.',
    tickerNote: 'ticker: Protege contra envio de sinais para o bot errado.',
    orderSizeNote: 'order_size: Especifica quanto comprar/vender no ativo base.',
    positionSizeNote: 'position_size: Especifica o tamanho da posição APÓS a execução.',
    actionNote: 'action: Pode ser "buy" (compra) ou "sell" (venda).',
    timestampNote: 'timestamp: Usado para evitar sinais duplicados (formato ISO).',
    botNamePlaceholder: 'Ex: Bot de Scalping BTCUSDT',
    alertName: 'Nome do Alerta',
    alertNamePlaceholder: 'Nome personalizado para seu alerta',
    webhookEndpointTitle: 'Webhook Endpoint / API',
    webhookSecretKeyHelp: 'Deixe em branco se não precisar validar as requisições',
    webhookAllowedIPsHelp: 'Deixe em branco para permitir requisições de qualquer IP',
    webhookMaxOrdersHelp: 'Limite de ordens que podem ser enviadas por minuto (1-600)',
    webhookUrl: 'URL do Webhook',
    webhookEnabled: 'Webhook Habilitado',
    statistics: 'Estatísticas',
    totalTrades: 'Negociações',
    winRate: 'Vitórias',
    profitLoss: 'Lucro',
    createdAt: 'Criado em',
    updatedAt: 'Atualizado em',
    noCredentials: 'No credentials configured',
    balanceTitle: 'Distribuição de Saldo',
    balanceTotal: 'Saldo Total',
    balanceAvailable: 'Saldo Disponível',
    balanceLocked: 'Saldo Bloqueado',
    balanceInOrder: 'Em Ordem',
    balancePercentage: '% do Total',
  },
  strategies: {
    title: 'Estratégias de Trading',
    newStrategy: 'Nova Estratégia',
    editStrategy: 'Editar Estratégia',
    createStrategy: 'Criar Nova Estratégia',
    confirmDelete: 'Tem certeza que deseja excluir esta estratégia?',
    noStrategies: 'Nenhuma estratégia criada ainda. Clique no botão "Nova Estratégia" para criar uma.',
    entry: 'Entrada',
    entryType: 'Tipo de Entrada',
    market: 'Mercado',
    limit: 'Limite',
    stopLoss: 'Stop Loss',
    takeProfit: 'Take Profit',
    leverage: 'Alavancagem',
    namePlaceholder: 'Nome da estratégia',
    descriptionPlaceholder: 'Descrição da estratégia',
  },
  logs: {
    title: 'Registros de Atividade',
    timestamp: 'Data/Hora',
    bot: 'Bot',
    action: 'Ação',
    details: 'Detalhes',
    status: 'Status',
    noLogs: 'Nenhum registro de atividade disponível.',
    loading: 'Carregando registros...',
    clearLogs: 'Limpar Registros',
    statuses: {
      success: 'Sucesso',
      error: 'Erro',
      warning: 'Aviso',
      info: 'Info'
    }
  },
  exchanges: {
    recommended: 'Recomendada',
    available: 'Disponível',
    ready: 'Pronta',
    comingSoon: 'Em Breve',
    availableExchanges: 'Exchanges Disponíveis',
    recommendedExchange: 'Esta é nossa exchange recomendada para a melhor experiência de trading',
    standardExchange: 'Uma exchange confiável com bons recursos de trading',
    secureAndReliable: 'Plataforma de trading segura e confiável',
    inProgress: 'Em Implementação',
    fullyImplemented: 'Totalmente Implementada',
    highLiquidity: 'Alta liquidez e volume de negociação',
    comingSoonTitle: 'Em Breve'
  }
};

export const translations = {
  en,
  'pt-BR': ptBR,
};

export type Language = Translation;