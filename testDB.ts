import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface User {
  id: string;
  email: string;
  name: string | null;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

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

async function testDatabase(): Promise<void> {
  try {
    // Testar conexão
    console.log('🔄 Testando conexão com o banco...');
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados');

    // Buscar usuários
    console.log('\n📊 Usuários:');
    const users = await prisma.user.findMany();
    console.log(JSON.stringify(users, null, 2));

    // Buscar bots
    console.log('\n🤖 Bots:');
    const bots = await prisma.bot.findMany();
    console.log(JSON.stringify(bots, null, 2));

  } catch (error) {
    console.error('❌ Erro:', error instanceof Error ? error.message : String(error));
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase(); 