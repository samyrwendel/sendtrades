import axios from 'axios';
import { generateSignature } from './utils/cryptoBrowser';
const MEXC_API_URL = '/api/v3';
// Função para obter o timestamp do servidor MEXC
async function getServerTime() {
    try {
        const response = await axios.get('/api/v3/time');
        let serverTime = response.data.serverTime;
        console.log('\n=== Detalhes do Timestamp ===');
        console.log('Timestamp do servidor (raw):', serverTime);
        // Verifica se o timestamp está em milissegundos (13 dígitos)
        if (String(serverTime).length !== 13) {
            console.warn('⚠️ Timestamp do servidor não está em milissegundos!');
            console.warn('Convertendo para milissegundos...');
            // Se estiver em segundos (10 dígitos), converte para milissegundos
            if (String(serverTime).length === 10) {
                serverTime = serverTime * 1000;
                console.log('Timestamp convertido:', serverTime);
            }
        }
        console.log('Timestamp em ISO:', new Date(serverTime).toISOString());
        console.log('Timestamp local:', Date.now());
        console.log('Diferença:', Date.now() - serverTime, 'ms');
        return serverTime;
    }
    catch (error) {
        console.error('Erro ao obter timestamp do servidor:', error);
        const timestamp = Date.now();
        console.log('Usando timestamp local:', timestamp);
        console.log('Timestamp em ISO:', new Date(timestamp).toISOString());
        return timestamp;
    }
}
export async function validateMexcApiKeys(apiKey, secretKey) {
    try {
        // Validação inicial das credenciais
        if (!apiKey || !secretKey) {
            return {
                isValid: false,
                error: 'API Key e Secret Key são obrigatórios'
            };
        }
        console.log('\n\n=== INÍCIO DA VALIDAÇÃO ===');
        console.log('Data/Hora:', new Date().toISOString());
        // Obter o timestamp do servidor
        const timestamp = await getServerTime();
        const recvWindow = 5000; // 5 segundos
        console.log('\n=== Timestamp do Servidor ===');
        console.log('Server Time:', timestamp);
        // Monta a query string na ordem correta (ordem alfabética)
        const queryString = `recvWindow=${recvWindow}&timestamp=${timestamp}`;
        console.log('\n=== Query String ===');
        console.log('Query string:', queryString);
        // Gera a assinatura usando a função unificada
        const signature = await generateSignature(queryString, secretKey);
        console.log('\n=== Assinatura ===');
        console.log('Assinatura:', signature);
        // Monta a URL final
        const finalUrl = `/api/v3/account?${queryString}&signature=${signature}`;
        // Configurações do Axios
        const axiosConfig = {
            method: 'GET',
            url: finalUrl,
            headers: {
                'X-MEXC-APIKEY': apiKey
            },
            validateStatus: (status) => {
                // Considera qualquer status como válido para tratar os erros manualmente
                return true;
            }
        };
        console.log('\n=== Requisição Final ===');
        console.log('URL:', finalUrl);
        console.log('Headers:', JSON.stringify({
            ...axiosConfig.headers,
            'X-MEXC-APIKEY': '***'
        }, null, 2));
        const response = await axios(axiosConfig);
        console.log('\n=== Resposta Recebida ===');
        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);
        console.log('Headers:', JSON.stringify(response.headers, null, 2));
        console.log('Data:', JSON.stringify(response.data, null, 2));
        // Validar a resposta
        if (response.status === 200 && response.data && Array.isArray(response.data.balances)) {
            const balances = response.data.balances
                .filter((balance) => parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0)
                .map((balance) => ({
                asset: balance.asset,
                free: balance.free,
                locked: balance.locked
            }));
            return {
                isValid: true,
                balances
            };
        }
        return {
            isValid: false,
            error: `Erro na validação: ${response.status} - ${JSON.stringify(response.data)}`
        };
    }
    catch (error) {
        console.error('Erro ao validar credenciais:', error);
        return {
            isValid: false,
            error: error instanceof Error ? error.message : 'Erro desconhecido ao validar credenciais'
        };
    }
}
export async function getAvailablePairs() {
    try {
        console.log('\n=== Buscando Pares de Trading ===');
        // A API de exchangeInfo é pública, não precisa de autenticação
        const response = await axios.get(`${MEXC_API_URL}/exchangeInfo`);
        if (response.status !== 200) {
            console.error('Erro ao buscar pares:', response.status, response.statusText);
            return {
                success: false,
                error: 'Falha ao obter informações da exchange'
            };
        }
        console.log('\n=== Resposta da Exchange Info ===');
        console.log('Total de pares:', response.data.symbols.length);
        console.log('Exemplo de par:', JSON.stringify(response.data.symbols[0], null, 2));
        // Filtra apenas os pares que estão ativos e têm permissão SPOT
        const activePairs = response.data.symbols.filter(symbol => {
            console.log(`\nAnalisando par: ${symbol.symbol}`);
            console.log(`Status:`, symbol.status);
            console.log(`Permissions:`, symbol.permissions.join(', '));
            // Verifica se o status é ativo (pode ser número 1 ou string '1' ou 'TRADING')
            const isActive = symbol.status === 'TRADING' ||
                symbol.status === '1' ||
                symbol.status === 1 ||
                symbol.status === 'ENABLED';
            const isSpot = symbol.permissions.includes('SPOT');
            return isActive && isSpot;
        });
        console.log('\n=== Pares Encontrados ===');
        console.log('Total de pares:', response.data.symbols.length);
        console.log('Pares ativos:', activePairs.length);
        return {
            success: true,
            pairs: activePairs
        };
    }
    catch (error) {
        console.error('Erro ao buscar pares:', error);
        return {
            success: false,
            error: 'Falha ao obter informações da exchange'
        };
    }
}
