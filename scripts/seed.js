import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
const prisma = new PrismaClient();
// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function main() {
    try {
        console.log('🌱 Iniciando seed...');
        // Limpar dados existentes
        console.log('🧹 Limpando dados existentes...');
        await prisma.botLog.deleteMany();
        await prisma.order.deleteMany();
        await prisma.bot.deleteMany();
        await prisma.apiKey.deleteMany();
        await prisma.user.deleteMany();
        // Criar usuário admin
        const password = await bcryptjs.hash('admin123', 10);
        const admin = await prisma.user.create({
            data: {
                email: 'admin@admin.com',
                password,
                name: 'Administrador',
                plan: 'unlimited',
                active: true
            }
        });
        console.log('✅ Usuário admin criado:', {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            plan: admin.plan
        });
        // Criar API Key para o admin
        const apiKey = await prisma.apiKey.create({
            data: {
                userId: admin.id,
                name: 'API Key Principal',
                key: `sk_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`,
                active: true
            }
        });
        console.log('✅ API Key criada:', {
            id: apiKey.id,
            name: apiKey.name,
            key: apiKey.key
        });
        console.log('✨ Seed concluído com sucesso!');
    }
    catch (error) {
        console.error('❌ Erro durante o seed:', error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
