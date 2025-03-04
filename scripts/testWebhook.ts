import axios, { AxiosError } from 'axios';
import { createHmac } from 'crypto';
import { supabaseAdmin } from '../src/lib/supabase.js';

interface BotInfo {
  public_id: string;
  tradingPair: string;
  webhookSecret: string;
}

interface WebhookPayload {
  action: string;
  ticker: string;
  order_size: string;
  position_size: string;
  schema: string;
  timestamp: string;
  public_id: string;
  signature?: string;
}

async function getBotInfo(): Promise<BotInfo> {
  try {
    // Buscar o primeiro bot ativo
    const { data: bots, error } = await supabaseAdmin
      .from('Bots')
      .select('*')
      .eq('enabled', true)
      .limit(1);

    if (error) throw error;
    if (!bots || bots.length === 0) throw new Error('Nenhum bot ativo encontrado');

    const bot = bots[0];
    return {
      public_id: bot.public_id,
      tradingPair: bot.tradingPair,
      webhookSecret: bot.webhook?.secretKey
    };
  } catch (error) {
    console.error('❌ Erro ao buscar informações do bot:', error);
    throw error;
  }
}

// Função para gerar assinatura
function generateSignature(message: string, secret: string): string {
  const hmac = createHmac('sha256', secret);
  hmac.update(message);
  return hmac.digest('hex');
}

async function testWebhook() {
  try {
    // Obter informações do bot
    console.log('\n=== Obtendo Informações do Bot ===');
    const botInfo = await getBotInfo();
    console.log('Public ID:', botInfo.public_id);
    console.log('Par de Trading:', botInfo.tradingPair);

    // Criar timestamp 30 segundos no passado (para teste)
    const timestamp = Date.now() - (30 * 1000);
    
    console.log('\n=== Timestamp do Teste ===');
    console.log('Timestamp:', timestamp);
    console.log('ISO:', new Date(timestamp).toISOString());

    // Define o tipo de ordem (buy/sell)
    const orderAction = "buy"; // Altere para "sell" para testar venda

    // Define o position_size de acordo com o tipo de ordem
    // buy -> position_size: "1" (entrando na posição)
    // sell -> position_size: "0" (saindo da posição)
    const positionSize = orderAction === "buy" ? "1" : "0";

    // Criar payload do webhook
    const webhook: WebhookPayload = {
      action: orderAction,
      ticker: botInfo.tradingPair,
      order_size: "100%",
      position_size: positionSize,
      schema: "2",
      timestamp: new Date(timestamp).toISOString(),
      public_id: botInfo.public_id
    };

    console.log('\n=== Configuração da Ordem ===');
    console.log('Tipo:', orderAction.toUpperCase());
    console.log('Position Size:', positionSize, orderAction === "buy" ? '(entrando)' : '(saindo)');

    console.log('\n=== Gerando Assinatura ===');
    const message = JSON.stringify(webhook);
    const signature = generateSignature(message, botInfo.webhookSecret);
    
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
    
    // Buscar logs do processamento
    console.log('\n=== Buscando Logs ===');
    const logsResponse = await axios.get('http://192.168.1.16:3001/api/logs');
    
    if (logsResponse.data.success && logsResponse.data.logs) {
      console.log('\n📊 Logs do Processamento:');
      logsResponse.data.logs.forEach((log: any) => {
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
    if (error instanceof AxiosError) {
      console.error('\n❌ Erro:', error.response?.data || error.message);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Headers:', error.response.headers);
        console.error('Data:', error.response.data);
      }
    } else {
      console.error('\n❌ Erro:', error instanceof Error ? error.message : 'Erro desconhecido');
    }
  }
}

testWebhook(); 