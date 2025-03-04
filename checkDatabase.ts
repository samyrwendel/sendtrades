import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface User {
  id: string;
  email: string;
  name: string | null;
}

interface Bot {
  id: string;
  name: string;
  enabled: boolean;
  userId: string;
  tradingPair: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
}

async function checkDatabase(): Promise<void> {
  try {
    console.log('🔍 Verificando bots no banco de dados...');
    const bots = await prisma.bot.findMany({
      include: {
        user: true
      }
    });

    console.log('\n📊 Total de bots:', bots.length);
    
    bots.forEach((bot: Bot) => {
      console.log('\n🤖 Bot:', {
        id: bot.id,
        name: bot.name,
        enabled: bot.enabled,
        userId: bot.userId,
        tradingPair: bot.tradingPair,
        createdAt: bot.createdAt,
        updatedAt: bot.updatedAt
      });
      
      if (bot.user) {
        console.log('👤 Usuário:', {
          id: bot.user.id,
          email: bot.user.email,
          name: bot.user.name
        });
      }
    });

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase(); 