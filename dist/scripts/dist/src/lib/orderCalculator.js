import { logger } from './utils/logger';
/**
 * Calcula a quantidade da ordem baseado no saldo disponível e order_size
 * @param balances Lista de saldos da exchange
 * @param orderSize Tamanho da ordem (ex: "100%", "50%", "1000")
 * @param symbol Par de trading (ex: "BTCUSDT")
 * @param currentPrice Preço atual do ativo
 */
export async function calculateOrderQuantity(balances, orderSize, symbol, currentPrice) {
    try {
        logger.info('Calculando quantidade da ordem', {
            orderSize,
            symbol,
            currentPrice,
            timestamp: new Date().toISOString()
        });
        // Extrai a moeda base e quote do símbolo (ex: BTCUSDT -> base=BTC, quote=USDT)
        const baseAsset = symbol.slice(0, -4); // Remove os últimos 4 caracteres (USDT)
        const quoteAsset = symbol.slice(-4); // Pega os últimos 4 caracteres (USDT)
        if (!baseAsset || !quoteAsset) {
            throw new Error('Formato de símbolo inválido');
        }
        // Encontra os saldos das moedas envolvidas
        const baseBalance = balances.find(b => b.asset === baseAsset);
        const quoteBalance = balances.find(b => b.asset === quoteAsset);
        if (!quoteBalance) {
            throw new Error(`Saldo insuficiente de ${quoteAsset}`);
        }
        // Converte valores para números
        const availableQuote = parseFloat(quoteBalance.free);
        const price = parseFloat(currentPrice);
        // Calcula o valor baseado no order_size
        let orderValue;
        if (orderSize.endsWith('%')) {
            // Se for porcentagem, calcula baseado no saldo disponível
            const percentage = parseFloat(orderSize.replace('%', '')) / 100;
            orderValue = availableQuote * percentage;
        }
        else {
            // Se for valor fixo, usa o valor diretamente
            orderValue = parseFloat(orderSize);
        }
        // Verifica se tem saldo suficiente
        if (orderValue > availableQuote) {
            throw new Error(`Saldo insuficiente. Disponível: ${availableQuote} ${quoteAsset}`);
        }
        // Calcula a quantidade em unidades do ativo base
        const quantity = orderValue / price;
        logger.info('Quantidade calculada com sucesso', {
            quantity: quantity.toString(),
            orderValue: orderValue.toString(),
            price: price.toString(),
            availableQuote: availableQuote.toString(),
            baseAsset,
            quoteAsset,
            timestamp: new Date().toISOString()
        });
        return {
            quantity: quantity.toFixed(8), // Ajusta para 8 casas decimais
            baseAmount: quantity.toFixed(8),
            quoteAmount: orderValue.toFixed(8),
            price: price.toFixed(8),
            baseAsset,
            quoteAsset
        };
    }
    catch (error) {
        logger.error('Erro ao calcular quantidade da ordem', {
            error: error instanceof Error ? error.message : 'Erro desconhecido',
            timestamp: new Date().toISOString()
        });
        return {
            quantity: '0',
            baseAmount: '0',
            quoteAmount: '0',
            price: '0',
            baseAsset: '',
            quoteAsset: '',
            error: error instanceof Error ? error.message : 'Erro ao calcular quantidade'
        };
    }
}
