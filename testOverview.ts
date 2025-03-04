import axios, { AxiosError } from 'axios';

interface ExchangeConfig {
  name: string;
  config: Record<string, unknown>;
}

interface WebhookConfig {
  enabled: boolean;
  url: string;
  secretKey: string;
  allowedIPs: string[];
  maxOrdersPerMinute: number;
}

interface BotSettings {
  maxOrderSize: string;
  minOrderSize: string;
  maxDailyOrders: number;
  tradingEnabled: boolean;
  notifications: {
    email: boolean;
    telegram: boolean;
  };
}

interface BotStatistics {
  totalTrades: number;
  successfulTrades: number;
  failedTrades: number;
  lastTradeAt: string | null;
  profitLoss: string;
  winRate: string;
}

interface Bot {
  id: string;
  name: string;
  enabled: boolean;
  tradingPair: string;
  exchange: ExchangeConfig;
  webhook: WebhookConfig;
  settings: BotSettings;
  statistics: BotStatistics;
}

interface ApiResponse {
  bots: Bot[];
}

const API_URL = 'http://localhost:3000';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU3MzIyNTBjLTAwMjYtNGEzZS05ZDFjLWVmOGUzMzcxODUxYiIsImVtYWlsIjoiYWRtaW5AYWRtaW4uY29tIiwibmFtZSI6IkFkbWluaXN0cmFkb3IiLCJwbGFuIjoidW5saW1pdGVkIiwiaWF0IjoxNzM5MjQ1MjMxLCJleHAiOjE3MzkzMzE2MzF9.aWfkO6am8wlXy__FELca7kMv68YuNtK6ThPMwbgXWCc';

async function testOverview(): Promise<void> {
  try {
    console.log('🔄 Buscando visão geral...');

    const response = await axios.get<ApiResponse>(API_URL + '/api/bots', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Bots encontrados:', JSON.stringify(response.data, null, 2));

    // Para cada bot, vamos buscar os saldos
    if (response.data.bots && response.data.bots.length > 0) {
      console.log('\n📊 Detalhes dos bots:');
      for (const bot of response.data.bots) {
        console.log(`\nBot: ${bot.name}`);
        console.log('Status:', bot.enabled ? 'Ativo' : 'Inativo');
        console.log('Par de trading:', bot.tradingPair);
        console.log('Exchange:', JSON.stringify(bot.exchange, null, 2));
        console.log('Webhook:', JSON.stringify(bot.webhook, null, 2));
        console.log('Configurações:', JSON.stringify(bot.settings, null, 2));
        
        const stats = bot.statistics;
        console.log('Estatísticas:');
        console.log('- Total de trades:', stats.totalTrades);
        console.log('- Trades bem-sucedidos:', stats.successfulTrades);
        console.log('- Trades falhos:', stats.failedTrades);
        console.log('- Taxa de sucesso:', stats.winRate + '%');
        console.log('- Lucro/Prejuízo:', stats.profitLoss);
        if (stats.lastTradeAt) {
          console.log('- Último trade:', new Date(stats.lastTradeAt).toLocaleString());
        }
      }
    } else {
      console.log('❌ Nenhum bot encontrado');
    }

  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      console.error('❌ Erro:', error.response.status, error.response.data);
    } else {
      console.error('❌ Erro:', error instanceof Error ? error.message : String(error));
    }
  }
}

testOverview(); 