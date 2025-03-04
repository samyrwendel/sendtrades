import axios, { AxiosError } from 'axios';
import { createHmac } from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabaseAdmin } from '../src/lib/supabase.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Carregar .env da raiz do projeto
dotenv.config({ path: path.resolve(__dirname, '../.env') });
const MEXC_API_URL = 'https://api.mexc.com/api/v3';
async function getBotCredentials() {
    try {
        // Buscar o primeiro bot ativo
        const { data: bots, error } = await supabaseAdmin
            .from('Bots')
            .select('*')
            .eq('enabled', true)
            .limit(1);
        if (error)
            throw error;
        if (!bots || bots.length === 0)
            throw new Error('Nenhum bot ativo encontrado');
        const bot = bots[0];
        const credentials = bot.exchange?.config?.credentials;
        if (!credentials?.apiKey || !credentials?.secretKey) {
            throw new Error('Credenciais não configuradas no bot');
        }
        return {
            apiKey: credentials.apiKey,
            secretKey: credentials.secretKey,
            botId: bot.id,
            botName: bot.name,
            tradingPair: bot.tradingPair
        };
    }
    catch (error) {
        console.error('❌ Erro ao buscar credenciais do bot:', error);
        throw error;
    }
}
function generateSignature(message, secret) {
    const hmac = createHmac('sha256', secret);
    hmac.update(message);
    return hmac.digest('hex');
}
async function getServerTime() {
    try {
        const response = await axios.get(`${MEXC_API_URL}/time`);
        return response.data.serverTime;
    }
    catch (error) {
        console.error('Erro ao obter timestamp:', error);
        return Date.now();
    }
}
async function testOrder() {
    try {
        console.log('\n=== Obtendo Credenciais do Bot ===');
        const credentials = await getBotCredentials();
        console.log('Bot ID:', credentials.botId);
        console.log('Bot Nome:', credentials.botName);
        console.log('Par de Trading:', credentials.tradingPair);
        console.log('API Key:', `${credentials.apiKey.substring(0, 4)}...${credentials.apiKey.substring(credentials.apiKey.length - 4)}`);
        console.log('\n=== Testando Ordem na MEXC ===');
        // Obter timestamp
        const timestamp = await getServerTime();
        console.log('Timestamp:', timestamp);
        console.log('ISO:', new Date(timestamp).toISOString());
        // Parâmetros da ordem
        const orderParams = {
            symbol: credentials.tradingPair,
            side: 'BUY',
            type: 'MARKET',
            quoteOrderQty: '10.00', // Comprar 10 USDT
            timestamp: timestamp,
            recvWindow: '10000'
        };
        // Ordenar parâmetros
        const orderedParams = Object.keys(orderParams)
            .sort()
            .reduce((obj, key) => {
            obj[key] = orderParams[key];
            return obj;
        }, {});
        // Criar query string
        const queryString = Object.entries(orderedParams)
            .map(([key, value]) => `${key}=${value}`)
            .join('&');
        console.log('\n=== Query String ===');
        console.log(queryString);
        // Gerar assinatura
        const signature = generateSignature(queryString, credentials.secretKey);
        console.log('\n=== Assinatura ===');
        console.log(signature);
        // URL final
        const finalUrl = `${MEXC_API_URL}/order?${queryString}&signature=${signature}`;
        console.log('\n=== URL Final ===');
        console.log(finalUrl.replace(credentials.apiKey, '***'));
        // Enviar ordem
        console.log('\n=== Enviando Ordem ===');
        const response = await axios({
            method: 'POST',
            url: finalUrl,
            headers: {
                'X-MEXC-APIKEY': credentials.apiKey,
                'Content-Type': 'application/json'
            }
        });
        console.log('\n=== Resposta da MEXC ===');
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));
    }
    catch (error) {
        if (error instanceof AxiosError) {
            console.error('\n❌ Erro:', error.response?.data || error.message);
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Headers:', error.response.headers);
                console.error('Data:', error.response.data);
            }
        }
        else {
            console.error('\n❌ Erro:', error instanceof Error ? error.message : 'Erro desconhecido');
        }
    }
}
testOrder();
