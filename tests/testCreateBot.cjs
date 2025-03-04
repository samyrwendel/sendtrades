const axios = require('axios');

const API_URL = 'http://192.168.1.33:3000';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjFhNmJhYzRmLWRjYjctNGYxNi1iMDZhLWY3NjY0NTNmZTQzNSIsImVtYWlsIjoiYWRtaW5AYWRtaW4uY29tIiwibmFtZSI6IkFkbWluaXN0cmFkb3IiLCJwbGFuIjoidW5saW1pdGVkIiwiaWF0IjoxNzM5MzEyNDc3LCJleHAiOjE3Mzk5MTcyNzd9.qGC1xVflOnQxQ8mqRzSR0EcaxLFcSNGWr9JJnJAOKu8';

async function testCreateBot() {
  try {
    console.log('🔄 Criando bot de teste...');
    
    const botData = {
      name: 'Bot de Teste',
      tradingPair: 'BTCUSDT',
      exchange: {
        name: 'MEXC',
        config: {
          credentials: {
            apiKey: 'test-api-key',
            secretKey: 'test-api-secret'
          }
        },
        tradingInfo: {
          baseAsset: 'BTC',
          quoteAsset: 'USDT',
          minOrderSize: '0.0001',
          maxOrderSize: '10'
        }
      },
      webhook: {
        enabled: true,
        url: `${API_URL}/webhook/test`,
        secretKey: 'test-secret-key',
        allowedIPs: ['192.168.1.33'],
        maxOrdersPerMinute: 60
      },
      settings: {
        maxOrderSize: '100',
        minOrderSize: '10',
        maxDailyOrders: 100,
        tradingEnabled: true,
        notifications: {
          email: false,
          telegram: false
        }
      }
    };

    const response = await axios.post(`${API_URL}/api/bots`, botData, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });

    if (response.data.success) {
      console.log('✅ Bot criado com sucesso!');
      console.log('🤖 Detalhes do bot:', JSON.stringify(response.data.bot, null, 2));
    } else {
      console.error('❌ Erro ao criar bot:', response.data.message);
    }
  } catch (error) {
    console.error('❌ Erro ao criar bot:', error.response?.data?.message || error.message);
  }
}

testCreateBot(); 