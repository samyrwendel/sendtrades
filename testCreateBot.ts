import axios, { AxiosError, AxiosResponse } from 'axios';

interface LoginResponse {
  success: boolean;
  token: string;
}

interface ExchangeCredentials {
  apiKey: string;
  secretKey: string;
}

interface ExchangeConfig {
  credentials: ExchangeCredentials;
}

interface Exchange {
  name: string;
  config: ExchangeConfig;
}

interface WebhookConfig {
  enabled: boolean;
  url: string;
  secretKey: string;
  allowedIPs: string[];
  maxOrdersPerMinute: number;
}

interface NotificationSettings {
  email: boolean;
  telegram: boolean;
}

interface BotSettings {
  maxOrderSize: string;
  minOrderSize: string;
  maxDailyOrders: number;
  tradingEnabled: boolean;
  notifications: NotificationSettings;
}

interface BotData {
  name: string;
  enabled: boolean;
  tradingPair: string;
  exchange: Exchange;
  webhook: WebhookConfig;
  settings: BotSettings;
}

interface CreateBotResponse {
  success: boolean;
  bot: {
    id: string;
    name: string;
  };
}

const API_URL = 'http://localhost:3000';

async function testCreateBot(): Promise<void> {
  try {
    // Primeiro, fazer login para obter o token
    console.log('🔑 Fazendo login...');
    const loginResponse: AxiosResponse<LoginResponse> = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin@admin.com',
      password: 'admin123'
    });

    if (!loginResponse.data.success) {
      throw new Error('Falha no login');
    }

    const token = loginResponse.data.token;
    console.log('✅ Login bem-sucedido, token obtido');

    // Dados do novo bot
    const botData: BotData = {
      name: 'Bot de Teste',
      enabled: false,
      tradingPair: 'BTCUSDT',
      exchange: {
        name: 'MEXC',
        config: {
          credentials: {
            apiKey: 'sua-api-key',
            secretKey: 'sua-secret-key'
          }
        }
      },
      webhook: {
        enabled: true,
        url: 'http://localhost:5173/webhook',
        secretKey: 'webhook-secret',
        allowedIPs: ['127.0.0.1'],
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

    console.log('🤖 Criando bot...');
    console.log('📝 Dados do bot:', JSON.stringify(botData, null, 2));

    // Criar o bot
    const createResponse: AxiosResponse<CreateBotResponse> = await axios.post(
      `${API_URL}/api/bots`,
      botData,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (createResponse.data.success) {
      console.log('✅ Bot criado com sucesso:', {
        id: createResponse.data.bot.id,
        name: createResponse.data.bot.name
      });
    } else {
      console.error('❌ Erro ao criar bot:', createResponse.data);
    }

  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      console.error('❌ Erro:', error.response.status, error.response.data);
    } else {
      console.error('❌ Erro:', error instanceof Error ? error.message : String(error));
    }
  }
}

testCreateBot(); 