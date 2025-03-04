import axios, { AxiosResponse } from 'axios';

interface BotData {
  name: string;
  enabled: boolean;
  tradingPair: string;
  exchange: {
    name: string;
    config: {
      credentials: {
        apiKey: string;
        secretKey: string;
      };
    };
  };
  webhook: {
    enabled: boolean;
    secretKey: string;
    allowedIPs: string[];
    maxOrdersPerMinute: number;
  };
  settings: {
    maxOrderSize: string;
    minOrderSize: string;
    maxDailyOrders: number;
    tradingEnabled: boolean;
    notifications: {
      email: boolean;
      telegram: boolean;
    };
  };
}

interface Bot extends BotData {
  id: string;
  public_id: string;
}

interface WebhookPayload {
  action?: 'buy' | 'sell';
  ticker: string;
  order_size: string;
  position_size: string;
  schema: string;
  timestamp: number;
  public_id: string;
}

interface WebhookTest {
  name: string;
  payload: WebhookPayload;
  headers: {
    'x-webhook-secret': string;
  };
  expectedStatus: number;
}

const API_URL = 'http://localhost:3000';
const TEST_BOT_DATA: BotData = {
  name: 'Bot de Teste Webhook',
  enabled: true,
  tradingPair: 'BTCUSDT',
  exchange: {
    name: 'MEXC',
    config: {
      credentials: {
        apiKey: 'test-api-key',
        secretKey: 'test-api-secret'
      }
    }
  },
  webhook: {
    enabled: true,
    secretKey: 'test-webhook-secret',
    allowedIPs: ['127.0.0.1', '::1'],
    maxOrdersPerMinute: 60
  },
  settings: {
    maxOrderSize: '100',
    minOrderSize: '10',
    maxDailyOrders: 100,
    tradingEnabled: true,
    notifications: {
      email: false,
      telegram: false
    }
  }
};

async function login(): Promise<string> {
  console.log('🔑 Fazendo login...');
  const response = await axios.post(`${API_URL}/api/auth/login`, {
    email: 'admin@admin.com',
    password: 'admin123'
  });

  if (!response.data.success) {
    throw new Error('Falha no login');
  }

  console.log('✅ Login bem-sucedido');
  return response.data.token;
}

async function createTestBot(token: string): Promise<Bot> {
  console.log('🤖 Criando bot de teste...');
  const response = await axios.post(
    `${API_URL}/api/bots`,
    TEST_BOT_DATA,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  if (!response.data.success) {
    throw new Error('Falha ao criar bot');
  }

  console.log('✅ Bot criado com sucesso:', {
    id: response.data.bot.id,
    public_id: response.data.bot.public_id,
    name: response.data.bot.name
  });

  return response.data.bot;
}

async function testWebhook(bot: Bot): Promise<void> {
  console.log('\n🔄 Iniciando testes de webhook...\n');

  const tests: WebhookTest[] = [
    {
      name: 'Sinal válido de compra',
      payload: {
        action: 'buy',
        ticker: bot.tradingPair,
        order_size: '100%',
        position_size: '1',
        schema: '2',
        timestamp: Date.now(),
        public_id: bot.public_id
      },
      headers: {
        'x-webhook-secret': bot.webhook.secretKey
      },
      expectedStatus: 200
    },
    {
      name: 'Sinal válido de venda',
      payload: {
        action: 'sell',
        ticker: bot.tradingPair,
        order_size: '50%',
        position_size: '0.5',
        schema: '2',
        timestamp: Date.now(),
        public_id: bot.public_id
      },
      headers: {
        'x-webhook-secret': bot.webhook.secretKey
      },
      expectedStatus: 200
    },
    {
      name: 'Secret Key inválida',
      payload: {
        action: 'buy',
        ticker: bot.tradingPair,
        order_size: '100%',
        position_size: '1',
        schema: '2',
        timestamp: Date.now(),
        public_id: bot.public_id
      },
      headers: {
        'x-webhook-secret': 'invalid-secret'
      },
      expectedStatus: 401
    },
    {
      name: 'Payload inválido (sem action)',
      payload: {
        ticker: bot.tradingPair,
        order_size: '100%',
        position_size: '1',
        schema: '2',
        timestamp: Date.now(),
        public_id: bot.public_id
      },
      headers: {
        'x-webhook-secret': bot.webhook.secretKey
      },
      expectedStatus: 400
    },
    {
      name: 'Ação inválida',
      payload: {
        action: 'invalid' as 'buy' | 'sell',
        ticker: bot.tradingPair,
        order_size: '100%',
        position_size: '1',
        schema: '2',
        timestamp: Date.now(),
        public_id: bot.public_id
      },
      headers: {
        'x-webhook-secret': bot.webhook.secretKey
      },
      expectedStatus: 400
    },
    {
      name: 'Timestamp antigo',
      payload: {
        action: 'buy',
        ticker: bot.tradingPair,
        order_size: '100%',
        position_size: '1',
        schema: '2',
        timestamp: Date.now() - (6 * 60 * 1000), // 6 minutos atrás
        public_id: bot.public_id
      },
      headers: {
        'x-webhook-secret': bot.webhook.secretKey
      },
      expectedStatus: 400
    },
    {
      name: 'Par de trading inválido',
      payload: {
        action: 'buy',
        ticker: 'INVALIDPAIR',
        order_size: '100%',
        position_size: '1',
        schema: '2',
        timestamp: Date.now(),
        public_id: bot.public_id
      },
      headers: {
        'x-webhook-secret': bot.webhook.secretKey
      },
      expectedStatus: 400
    }
  ];

  for (const test of tests) {
    try {
      console.log(`\n🧪 Teste: ${test.name}`);
      console.log('📦 Payload:', JSON.stringify(test.payload, null, 2));
      
      const response: AxiosResponse = await axios.post(
        `${API_URL}/webhook/${bot.public_id}`,
        test.payload,
        { headers: test.headers }
      ).catch(error => error.response);

      const status = response.status;
      const success = status === test.expectedStatus;

      console.log(`Status: ${status} (${success ? '✅' : '❌'} ${success ? 'Sucesso' : 'Falha'})`);
      console.log('Resposta:', JSON.stringify(response.data, null, 2));

    } catch (error) {
      console.error('❌ Erro no teste:', error instanceof Error ? error.message : String(error));
    }
  }
}

async function main(): Promise<void> {
  try {
    // Login
    const token = await login();

    // Criar bot de teste
    const bot = await createTestBot(token);

    // Executar testes de webhook
    await testWebhook(bot);

  } catch (error) {
    console.error('❌ Erro:', error instanceof Error ? error.message : String(error));
  }
}

main(); 