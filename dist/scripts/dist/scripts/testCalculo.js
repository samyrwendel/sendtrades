import { config } from 'dotenv';
import { mexcExchange } from '../src/lib/exchanges/mexc';
import { calculateOrderQuantity } from '../src/lib/orderCalculator';
config();
async function testCalculo() {
    try {
        console.log('\n🔄 Iniciando teste de cálculo...');
        // 1. Primeiro obter os saldos
        const apiKey = process.env.MEXC_API_KEY;
        const secretKey = process.env.MEXC_SECRET_KEY;
        if (!apiKey || !secretKey) {
            throw new Error('Credenciais não encontradas no arquivo .env');
        }
        const credentials = {
            apiKey,
            secretKey,
            botId: 'test-calculo-script' // ID para identificar o script nos logs
        };
        console.log('\n📊 Obtendo saldos...');
        const balances = await mexcExchange.getBalances(credentials);
        console.log('Saldos disponíveis:', balances);
        // 2. Obter preço atual do BTC
        console.log('\n💰 Obtendo preço do BTC...');
        const currentPrice = await mexcExchange.getCurrentPrice('BTCUSDT');
        console.log('Preço atual do BTC:', currentPrice);
        // 3. Testar diferentes cenários de cálculo
        const testCases = [
            { orderSize: '100%', symbol: 'BTCUSDT' },
            { orderSize: '50%', symbol: 'BTCUSDT' },
            { orderSize: '10', symbol: 'BTCUSDT' }, // Valor fixo em USDT
        ];
        for (const testCase of testCases) {
            console.log(`\n🧮 Testando cálculo para ${testCase.orderSize} em ${testCase.symbol}...`);
            const result = await calculateOrderQuantity(balances, testCase.orderSize, testCase.symbol, currentPrice);
            console.log('Resultado do cálculo:', {
                orderSize: testCase.orderSize,
                symbol: testCase.symbol,
                quantidade: result.quantity,
                valorBase: result.baseAmount,
                valorQuote: result.quoteAmount,
                preço: result.price,
                erro: result.error
            });
        }
    }
    catch (error) {
        console.error('\n❌ Erro ao testar cálculo:', error);
        process.exit(1);
    }
}
testCalculo();
