import { config } from 'dotenv';
import { mexcExchange } from '../src/lib/exchanges/mexc';

// Carrega as variáveis de ambiente do arquivo .env
config();

async function testMexc() {
  try {
    console.log('Iniciando teste da MEXC...');
    
    // Testando endpoint público
    const serverTime = await mexcExchange.getServerTime();
    console.log('Timestamp do servidor:', { serverTime });
    
    // Validando credenciais
    const credentials = {
      apiKey: process.env.MEXC_API_KEY!,
      secretKey: process.env.MEXC_SECRET_KEY!,
      botId: 'test-bot',
      exchange: 'mexc'
    };
    
    const balances = await mexcExchange.getBalances(credentials);
    console.log('Balances:', balances);
    
    console.log('Teste concluído com sucesso!');
  } catch (error) {
    console.error('Erro no teste da MEXC:', error);
    process.exit(1);
  }
}

testMexc(); 