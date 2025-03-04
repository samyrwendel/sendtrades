import { config } from 'dotenv';
import { mexcExchange } from '../src/lib/exchanges/mexc';
config();
async function testBalance() {
    try {
        console.log('Iniciando teste de saldo...');
        const apiKey = process.env.MEXC_API_KEY;
        const secretKey = process.env.MEXC_SECRET_KEY;
        if (!apiKey || !secretKey) {
            throw new Error('Credenciais não encontradas no arquivo .env');
        }
        const credentials = {
            apiKey,
            secretKey,
            botId: 'test-balance-script'
        };
        console.log('Credenciais carregadas:', {
            apiKey: credentials.apiKey.substring(0, 4) + '...',
            secretKey: 'presente'
        });
        const balances = await mexcExchange.getBalances(credentials);
        console.log('Saldos obtidos:', balances);
    }
    catch (error) {
        console.error('Erro ao testar saldo:', error);
        process.exit(1);
    }
}
testBalance();
