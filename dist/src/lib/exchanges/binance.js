import { generateSignature } from '../utils/crypto';
const BINANCE_LOGO = "https://public.bnbstatic.com/image/cms/blog/20200707/631c823b-886e-4e46-9122-0c94f65a45fc.png";
const BINANCE_API_URL = 'https://api.binance.com';
export const binanceExchange = {
    name: 'Binance',
    logo: BINANCE_LOGO,
    async validateCredentials(credentials) {
        if (credentials.exchange !== 'BINANCE') {
            return {
                isValid: false,
                error: 'Credenciais inválidas para Binance'
            };
        }
        try {
            const timestamp = Date.now().toString();
            const queryString = `timestamp=${timestamp}`;
            const signature = await generateSignature(queryString, credentials.secretKey);
            const response = await fetch(`${BINANCE_API_URL}/api/v3/account?${queryString}&signature=${signature}`, {
                headers: {
                    'X-MBX-APIKEY': credentials.apiKey,
                },
            });
            if (!response.ok) {
                const error = await response.json();
                return {
                    isValid: false,
                    error: error.msg || 'Falha ao validar credenciais'
                };
            }
            const data = await response.json();
            const balances = data.balances
                .filter((b) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
                .map((b) => ({
                asset: b.asset,
                free: b.free,
                locked: b.locked
            }));
            return {
                isValid: true,
                balances
            };
        }
        catch (error) {
            return {
                isValid: false,
                error: error instanceof Error ? error.message : 'Falha ao validar credenciais'
            };
        }
    },
    async getBalances(credentials) {
        if (credentials.exchange !== 'BINANCE') {
            throw new Error('Credenciais inválidas para Binance');
        }
        const timestamp = Date.now().toString();
        const queryString = `timestamp=${timestamp}`;
        const signature = await generateSignature(queryString, credentials.secretKey);
        const response = await fetch(`${BINANCE_API_URL}/api/v3/account?${queryString}&signature=${signature}`, {
            headers: {
                'X-MBX-APIKEY': credentials.apiKey,
            },
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.msg || 'Falha ao obter saldos');
        }
        const data = await response.json();
        return data.balances
            .filter((b) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
            .map((b) => ({
            asset: b.asset,
            free: b.free,
            locked: b.locked
        }));
    },
    async getCurrentPrice(symbol) {
        const response = await fetch(`${BINANCE_API_URL}/api/v3/ticker/price?symbol=${symbol}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.msg || 'Falha ao obter preço atual');
        }
        const data = await response.json();
        return data.price;
    },
    async getServerTime() {
        const response = await fetch(`${BINANCE_API_URL}/api/v3/time`);
        if (!response.ok) {
            throw new Error('Falha ao obter tempo do servidor');
        }
        const data = await response.json();
        return data.serverTime;
    },
    async executeTrade(credentials, params) {
        if (credentials.exchange !== 'BINANCE') {
            return {
                success: false,
                error: 'Credenciais inválidas para Binance'
            };
        }
        try {
            const timestamp = Date.now().toString();
            const queryString = `symbol=${params.symbol}&side=${params.type.toUpperCase()}&type=MARKET&quantity=${params.amount}&timestamp=${timestamp}`;
            const signature = await generateSignature(queryString, credentials.secretKey);
            const response = await fetch(`${BINANCE_API_URL}/api/v3/order?${queryString}&signature=${signature}`, {
                method: 'POST',
                headers: {
                    'X-MBX-APIKEY': credentials.apiKey,
                },
            });
            if (!response.ok) {
                const error = await response.json();
                return {
                    success: false,
                    error: error.msg || 'Falha na execução da ordem'
                };
            }
            const data = await response.json();
            return {
                success: true,
                orderId: data.orderId.toString()
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erro desconhecido ao executar ordem'
            };
        }
    }
};
