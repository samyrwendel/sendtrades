import axios, { AxiosError } from 'axios';

interface WebhookPayload {
  action: 'buy' | 'sell';
  ticker: string;
  order_size: string;
  position_size: string;
  schema: string;
  timestamp: number;
  public_id: string;
}

const API_URL = 'http://localhost:3001';

async function testWebhook(): Promise<void> {
  try {
    console.log('\n🔄 Iniciando teste de webhook...\n');

    const payload: WebhookPayload = {
      action: 'sell',
      ticker: 'XRPUSDT',
      order_size: '100%',
      position_size: '1',
      schema: '2',
      timestamp: Date.now(),
      public_id: '1BB70STK'
    };

    console.log('📦 Payload:', JSON.stringify(payload, null, 2));
    
    const response = await axios.post(
      `${API_URL}/webhook/${payload.public_id}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`\n✅ Status: ${response.status}`);
    console.log('📄 Resposta:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('\n❌ Erro na requisição:');
      console.error('Status:', error.response?.status);
      console.error('Dados:', JSON.stringify(error.response?.data, null, 2));
      console.error('Mensagem:', error.message);
    } else {
      console.error('\n❌ Erro:', error instanceof Error ? error.message : String(error));
    }
  }
}

testWebhook(); 