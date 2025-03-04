const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const API_URL = 'http://localhost:3000';
const prisma = new PrismaClient();

async function testToggleBot() {
  try {
    // 1. Fazer login para obter o token
    console.log('🔑 Fazendo login...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin@admin.com',
      password: 'admin123'
    });

    if (!loginResponse.data.success) {
      throw new Error('Falha no login');
    }

    const token = loginResponse.data.token;
    console.log('✅ Login bem-sucedido');

    // 2. Buscar o primeiro bot do usuário
    console.log('\n🔍 Buscando bots...');
    const bots = await prisma.bot.findMany({
      where: {
        userId: loginResponse.data.user.id
      }
    });

    if (bots.length === 0) {
      throw new Error('Nenhum bot encontrado');
    }

    const bot = bots[0];
    console.log('✅ Bot encontrado:', {
      id: bot.id,
      name: bot.name,
      enabled: bot.enabled
    });

    // 3. Fazer a requisição de toggle
    console.log('\n🔄 Alternando status do bot...');
    console.log('Status atual:', bot.enabled);
    
    const toggleResponse = await axios.post(
      `${API_URL}/api/bots/${bot.id}/toggle`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!toggleResponse.data.success) {
      throw new Error('Falha ao alternar status do bot');
    }

    console.log('✅ Resposta do servidor:', toggleResponse.data);

    // 4. Verificar se o bot foi atualizado no banco
    const updatedBot = await prisma.bot.findUnique({
      where: { id: bot.id }
    });

    console.log('\n📊 Status do bot no banco de dados:');
    console.log('- Antes:', bot.enabled);
    console.log('- Depois:', updatedBot.enabled);

    if (bot.enabled === updatedBot.enabled) {
      console.error('❌ O status do bot não foi alterado no banco de dados');
    } else {
      console.log('✅ Status do bot atualizado com sucesso no banco de dados');
    }

  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testToggleBot(); 