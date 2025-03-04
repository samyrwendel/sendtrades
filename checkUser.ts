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

async function main(): Promise<void> {
  try {
    console.log('🔍 Consultando usuário admin...');
    const user = await prisma.user.findUnique({
      where: { email: 'admin@admin.com' }
    });
    console.log('📊 Resultado:', JSON.stringify(user, null, 2));
  } catch (error) {
    console.error('❌ Erro ao consultar usuário:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 