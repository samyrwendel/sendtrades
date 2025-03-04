import axios from 'axios';
import { createHmac } from 'crypto';

// Função local para gerar assinatura
function generateSignature(message, secret) {
  const hmac = createHmac('sha256', secret);
  hmac.update(message);
  return hmac.digest('hex');
}

// Função para formatar timestamp
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return {
    raw: timestamp,
    iso: date.toISOString(),
    length: String(timestamp).length,
    type: String(timestamp).length === 13 ? 'milissegundos' : 'segundos'
  };
}

async function testWebhook(action, size, ticker) {
  try {
    // Criar timestamp 30 segundos no passado (para teste)
    const timestamp = Date.now() - (30 * 1000);
    
    console.log('\n=== Timestamp do Teste ===');
    const timestampInfo = formatTimestamp(timestamp);
    console.log('Timestamp:', timestampInfo.raw);
    console.log('ISO:', timestampInfo.iso);
    console.log('Dígitos:', timestampInfo.length);
    console.log('Tipo:', timestampInfo.type);

    // Define o position_size de acordo com o tipo de ordem
    const positionSize = action === "buy" ? "1" : "0";

    const webhook = {
      action: action,
      ticker: ticker,
      order_size: String(size),
      position_size: positionSize,
      schema: "2",
      timestamp: timestampInfo.iso,
      public_id: "LIAZQCMU"
    };

    console.log('\n=== Configuração da Ordem ===');
    console.log('Tipo:', action.toUpperCase());
    console.log('Ticker:', ticker);
    console.log('Tamanho:', size);
    console.log('Position Size:', positionSize, action === "buy" ? '(entrando)' : '(saindo)');

    console.log('\n=== Gerando Assinatura ===');
    const message = JSON.stringify(webhook);
    const secret = "test_secret_key";
    const signature = generateSignature(message, secret);
    
    webhook.signature = signature;
    
    console.log('\n=== Enviando Webhook ===');
    console.log('Payload:', JSON.stringify(webhook, null, 2));
    
    const response = await axios.post('http://192.168.1.16:3001/api/webhook', webhook, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('\n=== Resposta do Servidor ===');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    // Aguardar um momento para o processamento
    console.log('\n⏳ Aguardando processamento...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Buscar logs do cálculo
    console.log('\n=== Buscando Logs ===');
    const logsResponse = await axios.get('http://192.168.1.16:3001/api/logs');
    
    if (logsResponse.data.success && logsResponse.data.logs) {
      console.log('\n📊 Logs do Processamento:');
      logsResponse.data.logs.forEach(log => {
        console.log('\n=== Log ===');
        console.log('ID:', log.id);
        console.log('Tipo:', log.type);
        console.log('Ação:', log.action);
        console.log('Status:', log.status);
        console.log('Mensagem:', log.message);
        
        if (log.metadata) {
          console.log('\nMetadata:');
          console.log(JSON.stringify(log.metadata, null, 2));
        }
        
        if (log.details) {
          console.log('\nDetalhes:');
          console.log(log.details);
        }
        
        if (log.payload) {
          console.log('\nPayload:');
          console.log(JSON.stringify(log.payload, null, 2));
        }
        
        console.log('='.repeat(50));
      });
    }
  } catch (error) {
    console.error('\n❌ Erro:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
    }
  }
}

// Testar diferentes porcentagens
async function runTests() {
  const testCases = [
    { 
      action: process.argv[2] || 'sell',  // Usar argumento da linha de comando ou 'sell' como padrão
      size: process.argv[3] || '100%',    // Usar argumento da linha de comando ou '100%' como padrão
      ticker: process.argv[4] || 'XRPUSDT' // Usar argumento da linha de comando ou 'XRPUSDT' como padrão
    }
  ];

  console.log('\n🧪 Iniciando teste de ' + testCases[0].action + '...\n');

  for (const test of testCases) {
    console.log(`\n=== Testando ${test.action.toUpperCase()} ${test.ticker} (${test.size}) ===`);
    try {
      await testWebhook(test.action, test.size, test.ticker);
      console.log(`✅ Teste com ${test.ticker} concluído com sucesso\n`);
    } catch (error) {
      console.error(`❌ Erro no teste com ${test.ticker}:`, error.message);
    }
    // Aguardar um pouco entre os testes
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

runTests(); 