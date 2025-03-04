import axios, { AxiosError } from 'axios';

interface ExchangeCredentials {
  apiKey: string;
  secretKey: string;
}

interface ExchangeConfig {
  credentials: ExchangeCredentials;
}

interface ExchangeTradingInfo {
  baseAsset: string;
  quoteAsset: string;
  minOrderSize: string;
  maxOrderSize: string;
}

interface Exchange {
  name: string;
  config: ExchangeConfig;
  tradingInfo: ExchangeTradingInfo;
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
  strategy: string;
  gridLevels: number;
  upperLimit: string;
  lowerLimit: string;
  investment: string;
  stopLoss: string;
  takeProfit: string;
  maxOrderSize: string;
  minOrderSize: string;
  maxDailyOrders: number;
  tradingEnabled: boolean;
  notifications: NotificationSettings;
}

interface BotStatistics {
  totalTrades: number;
  successfulTrades: number;
  failedTrades: number;
  lastTradeAt: Date | null;
  profitLoss: string;
  winRate: string;
}

interface BotData {
  name: string;
  enabled: boolean;
  tradingPair: string;
  exchange: Exchange;
  webhook: WebhookConfig;
  settings: BotSettings;
  statistics: BotStatistics;
}

const API_URL = 'http://localhost:3000';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU3MzIyNTBjLTAwMjYtNGEzZS05ZDFjLWVmOGUzMzcxODUxYiIsImVtYWlsIjoiYWRtaW5AYWRtaW4uY29tIiwibmFtZSI6IkFkbWluaXN0cmFkb3IiLCJwbGFuIjoidW5saW1pdGVkIiwiaWF0IjoxNzM5MjQ1MjMxLCJleHAiOjE3MzkzMzE2MzF9.aWfkO6am8wlXy__FELca7kMv68YuNtK6ThPMwbgXWCc';

async function createBot(): Promise<void> {
  try {
    // Dados do novo bot
    const newBotData: BotData = {
      name: 'XRPUSDT-BOT03',
      enabled: true,
      tradingPair: 'XRPUSDT',
      exchange: {
        name: 'MEXC',
        config: {
          credentials: {
            apiKey: 'mx0vglw96b9xSBK6th',
            secretKey: '7338de0dd3fe425c9340e8bc31d8920a'
          }
        },
        tradingInfo: {
          baseAsset: 'XRP',
          quoteAsset: 'USDT',
          minOrderSize: '10',
          maxOrderSize: '1000'
        }
      },
      webhook: {
        enabled: true,
        url: 'http://192.168.1.33:5173/api/webhook/VETAY9HZ',
        secretKey: 'your-webhook-secret',
        allowedIPs: ['192.168.1.33'],
        maxOrdersPerMinute: 60
      },
      settings: {
        strategy: 'GRID',
        gridLevels: 5,
        upperLimit: '0.70',
        lowerLimit: '0.60',
        investment: '100',
        stopLoss: '0.55',
        takeProfit: '0.75',
        maxOrderSize: '100',
        minOrderSize: '10',
        maxDailyOrders: 100,
        tradingEnabled: true,
        notifications: {
          email: false,
          telegram: false
        }
      },
      statistics: {
        totalTrades: 0,
        successfulTrades: 0,
        failedTrades: 0,
        lastTradeAt: null,
        profitLoss: '0',
        winRate: '0'
      }
    };

    console.log('🔄 Criando novo bot...');
    console.log('Dados do bot:', JSON.stringify(newBotData, null, 2));

    // Criando o bot
    const response = await axios.post(
      `${API_URL}/api/bots`,
      newBotData,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('✅ Bot criado com sucesso:', response.data);

  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      console.error('❌ Erro:', error.response.status, error.response.data);
      if (error.response.data.error) {
        console.error('Detalhes do erro:', error.response.data.error);
      }
    } else {
      console.error('❌ Erro:', error instanceof Error ? error.message : String(error));
    }
  }
}

createBot(); 