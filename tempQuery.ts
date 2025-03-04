import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Bot {
  id: string;
  name: string;
  enabled: boolean;
  userId: string;
  tradingPair: string;
  exchange: Record<string, unknown>;
  webhook: Record<string, unknown>;
  settings: Record<string, unknown>;
  statistics: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

async function main(): Promise<void> {
  try {
    console.log('🔍 Consultando bots...');
    const bots = await prisma.bot.findMany();
    console.log('📊 Resultado:');
    console.log(JSON.stringify(bots, null, 2));
  } catch (error) {
    console.error('❌ Erro ao consultar bots:', error instanceof Error ? error.message : String(error));
  } finally {
    await prisma.$disconnect();
  }
}

main(); 