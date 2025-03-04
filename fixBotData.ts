import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
  strategy: string;
  gridLevels?: number;
  upperLimit?: string;
  lowerLimit?: string;
  investment?: string;
  stopLoss?: string;
  takeProfit?: string;
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
  lastTradeAt: Date | null;
  profitLoss: string;
  winRate: string;
}

async function fixBotData(): Promise<void> {
  try {
    console.log('🔄 Buscando bots...');
    const bots = await prisma.bot.findMany();
    
    console.log(`📊 Total de bots encontrados: ${bots.length}`);
    
    for (const bot of bots) {
      console.log(`\n🤖 Processando bot: ${bot.name} (${bot.id})`);
      
      try {
        // Converter campos JSON que estão como string
        const exchange: ExchangeConfig = typeof bot.exchange === 'string' 
          ? JSON.parse(bot.exchange) 
          : bot.exchange as ExchangeConfig;

        const webhook: WebhookConfig = typeof bot.webhook === 'string' 
          ? JSON.parse(bot.webhook) 
          : bot.webhook as WebhookConfig;

        const settings: BotSettings = typeof bot.settings === 'string' 
          ? JSON.parse(bot.settings) 
          : bot.settings as BotSettings;

        const statistics: BotStatistics = typeof bot.statistics === 'string' 
          ? JSON.parse(bot.statistics) 
          : bot.statistics as BotStatistics;
        
        // Atualizar bot com os dados convertidos
        const updatedBot = await prisma.bot.update({
          where: { id: bot.id },
          data: {
            exchange,
            webhook,
            settings,
            statistics
          }
        });
        
        console.log('✅ Bot atualizado com sucesso');
        
      } catch (error) {
        console.error(`❌ Erro ao processar bot ${bot.id}:`, error instanceof Error ? error.message : String(error));
      }
    }
    
    console.log('\n✅ Processo finalizado');
    
  } catch (error) {
    console.error('❌ Erro geral:', error instanceof Error ? error.message : String(error));
  } finally {
    await prisma.$disconnect();
  }
}

fixBotData(); 