import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface User {
  id: string;
  email: string;
  name: string | null;
  password: string;
  plan: string;
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
  createdAt: string;
  updatedAt: string;
}

interface StorageData {
  bots: Bot[];
}

async function createDefaultUser(): Promise<User> {
  console.log('👤 Criando usuário padrão...');
  const defaultUser = await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: {
      email: 'admin@admin.com',
      name: 'Admin',
      password: await bcrypt.hash('admin', 10),
      plan: 'unlimited'
    }
  });
  console.log('✅ Usuário padrão criado:', defaultUser.id);
  return defaultUser;
}

async function importBots(): Promise<void> {
  try {
    const defaultUser = await createDefaultUser();
    
    console.log('📖 Lendo arquivo server-storage.json...');
    const data: StorageData = JSON.parse(fs.readFileSync('server-storage.json', 'utf8'));
    
    console.log(`📦 Encontrado ${data.bots.length} bot(s) para importar.`);
    
    for (const bot of data.bots) {
      console.log(`\n🤖 Importando bot: ${bot.name}`);
      
      // Criar ou atualizar o bot
      const upsertedBot = await prisma.bot.upsert({
        where: { id: bot.id },
        update: {
          name: bot.name,
          enabled: bot.enabled,
          userId: defaultUser.id,  // Usar o ID do usuário padrão
          tradingPair: bot.tradingPair,
          exchange: bot.exchange,
          webhook: bot.webhook,
          settings: bot.settings,
          statistics: bot.statistics,
          createdAt: new Date(bot.createdAt),
          updatedAt: new Date(bot.updatedAt)
        },
        create: {
          id: bot.id,
          name: bot.name,
          enabled: bot.enabled,
          userId: defaultUser.id,  // Usar o ID do usuário padrão
          tradingPair: bot.tradingPair,
          exchange: bot.exchange,
          webhook: bot.webhook,
          settings: bot.settings,
          statistics: bot.statistics,
          createdAt: new Date(bot.createdAt),
          updatedAt: new Date(bot.updatedAt)
        }
      });
      
      console.log('✅ Bot importado com sucesso:', upsertedBot.id);
    }
    
    console.log('\n🎉 Importação concluída!');
  } catch (error) {
    console.error('❌ Erro durante a importação:', error instanceof Error ? error.message : String(error));
  } finally {
    await prisma.$disconnect();
  }
}

importBots(); 