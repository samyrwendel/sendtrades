import axios, { AxiosError } from 'axios';

interface WebhookPayload {
  action: 'buy' | 'sell';
  ticker: string;
  order_size: string;
  position_size: string;
  schema: string;
  timestamp: string;
  public_id: string;
}

// Pegar argumentos da linha de comando
const args = process.argv.slice(2);

if (args.length < 3) {
  console.log('❌ Uso: ts-node send-webhook.ts <ação> <order_size> <public_id>');
  console.log('Exemplo: ts-node send-webhook.ts sell 100% 1BB70STK');
  process.exit(1);
}

const [action, orderSize, publicId] = args;

// Validar ação
if (!['buy', 'sell'].includes(action.toLowerCase())) {
  console.log('❌ Ação inválida. Use "buy" ou "sell"');
  process.exit(1);
}

async function testWebhook(): Promise<void> {
  try {
    console.log('\n🔄 Iniciando teste de webhook...\n');

    const payload: WebhookPayload = {
      action: action.toLowerCase() as 'buy' | 'sell',
      ticker: 'XRPUSDT',
      order_size: orderSize,
      position_size: '1',
      schema: '2',
      timestamp: new Date().toISOString(),
      public_id: publicId
    };

    console.log('📦 Payload:', JSON.stringify(payload, null, 2), '\n');
    
    try {
      const response = await axios.post(
        `http://localhost:3001/api/webhook`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ Status: ${response.status}`);
      console.log('📄 Resposta:', JSON.stringify(response.data, null, 2));

    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        console.error('\n❌ Erro na requisição:');
        console.error('Status:', error.response.status);
        console.error('Dados:', JSON.stringify(error.response.data, null, 2));
        if (error.response.data.details) {
          console.error('Detalhes:', error.response.data.details);
        }
      } else {
        console.error('\n❌ Erro:', error instanceof Error ? error.message : String(error));
      }
    }
  } catch (error) {
    console.error('\n❌ Erro ao preparar teste:', error instanceof Error ? error.message : String(error));
  }
}

testWebhook(); 