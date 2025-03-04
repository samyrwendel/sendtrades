import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface BotWebhook {
  enabled: boolean;
  url: string;
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
  notifications: {
    email: boolean;
    telegram: boolean;
  };
}

interface Bot {
  id: string;
  name: string;
  enabled: boolean;
  tradingPair: string;
  webhook: BotWebhook;
  settings: BotSettings;
}

async function manageBots(): Promise<void> {
  try {
    // 1. Listar bots ativos
    console.log('🔍 Buscando bots ativos...');
    const activeBots = await prisma.bot.findMany({
      where: { enabled: true }
    });
    console.log('\n✅ Bots ativos:', activeBots.length);
    activeBots.forEach(bot => {
      console.log(`- ${bot.name} (${bot.tradingPair})`);
    });

    // 2. Ativar todos os bots XRPUSDT
    console.log('\n🔄 Ativando bots XRPUSDT...');
    const updated = await prisma.bot.updateMany({
      where: { tradingPair: 'XRPUSDT' },
      data: { enabled: true }
    });
    console.log(`✅ ${updated.count} bots atualizados`);

    // 3. Buscar bots com webhook ativo
    console.log('\n🔍 Buscando bots com webhook...');
    const botsWithWebhook = await prisma.bot.findMany();
    console.log('✅ Bots com webhook:');
    botsWithWebhook.forEach((bot: Bot) => {
      const webhook = bot.webhook;
      if (webhook && webhook.enabled) {
        console.log(`- ${bot.name}: ${webhook.url}`);
      }
    });

    // 4. Atualizar configurações de um bot específico
    console.log('\n🔄 Buscando bot XRPUSDT-BOT03...');
    const botToUpdate = await prisma.bot.findFirst({
      where: { name: 'XRPUSDT-BOT03' }
    });

    if (botToUpdate) {
      console.log('🔄 Atualizando configurações...');
      const updatedBot = await prisma.bot.update({
        where: { id: botToUpdate.id },
        data: {
          settings: {
            strategy: 'GRID',
            gridLevels: 10,
            upperLimit: '0.75',
            lowerLimit: '0.55',
            investment: '200',
            stopLoss: '0.50',
            takeProfit: '0.80',
            maxOrderSize: '200',
            minOrderSize: '20',
            maxDailyOrders: 200,
            tradingEnabled: true,
            notifications: {
              email: true,
              telegram: true
            }
          }
        }
      });
      console.log('✅ Bot atualizado:', JSON.stringify(updatedBot, null, 2));
    } else {
      console.log('❌ Bot não encontrado');
    }

    // 5. Mostrar estatísticas gerais
    console.log('\n📊 Estatísticas gerais:');
    const stats = await prisma.bot.groupBy({
      by: ['tradingPair'],
      _count: {
        _all: true
      }
    });
    console.log('Bots por par de trading:');
    stats.forEach(stat => {
      console.log(`- ${stat.tradingPair}: ${stat._count._all} bots`);
    });

  } catch (error) {
    console.error('❌ Erro:', error instanceof Error ? error.message : String(error));
  } finally {
    await prisma.$disconnect();
  }
}

manageBots(); 