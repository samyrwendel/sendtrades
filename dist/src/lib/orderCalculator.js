import { logger } from './utils/logger';
// Constantes globais
const MIN_ORDER_VALUE = 1; // Valor mínimo de 1 USDT
// Lista de Quote Assets conhecidos em ordem de prioridade
const KNOWN_QUOTE_ASSETS = [
    'USDT', // Mais comum, verificar primeiro
    'USDC',
    'TUSD',
    'BUSD',
    'EUR',
    'BTC',
    'ETH'
];
function extractAssetsFromTicker(ticker) {
    if (!ticker || typeof ticker !== 'string') {
        throw new Error('Formato de símbolo inválido: ticker não pode ser vazio');
    }
    // Converter ticker para maiúsculo para comparação
    const upperTicker = ticker.toUpperCase();
    // Tentar encontrar um Quote Asset conhecido no final do ticker
    for (const quote of KNOWN_QUOTE_ASSETS) {
        if (upperTicker.endsWith(quote)) {
            const base = upperTicker.slice(0, -quote.length);
            if (base.length > 0) {
                logger.info(`Ativos extraídos do ticker ${ticker}:
          - Base: ${base}
          - Quote: ${quote}
        `);
                return { baseAsset: base, quoteAsset: quote };
            }
        }
    }
    // Se não encontrou nenhum Quote Asset conhecido, lança erro
    throw new Error(`Formato de símbolo inválido: não foi possível identificar Quote Asset em ${upperTicker}. Quote Assets suportados: ${KNOWN_QUOTE_ASSETS.join(', ')}`);
}
/**
 * Calcula a quantidade da ordem baseado no saldo disponível e order_size
 * @param balances Lista de saldos disponíveis
 * @param orderSize Tamanho da ordem (ex: "100%", "50%", "1000")
 * @param ticker Par de trading (ex: "BTCUSDT")
 * @param price Preço atual do ativo
 * @param action Tipo de ordem ('buy' ou 'sell')
 */
export async function calculateOrderQuantity(balances, orderSize, ticker, price, action) {
    logger.info(`Calculando ordem: ${action} ${ticker} (${orderSize})`);
    // Validar orderSize
    if (typeof orderSize !== 'string') {
        orderSize = String(orderSize);
    }
    // Garantir que orderSize seja uma string válida e limpa
    orderSize = orderSize.trim();
    if (!orderSize) {
        throw new Error('orderSize não pode ser vazio');
    }
    const { baseAsset, quoteAsset } = extractAssetsFromTicker(ticker);
    const currentPrice = parseFloat(price);
    const warnings = [];
    // Função auxiliar para obter saldo
    const getBalance = (asset) => {
        const balance = balances.find(b => b.asset === asset);
        return balance ? parseFloat(balance.free) : 0;
    };
    const baseBalance = getBalance(baseAsset);
    const quoteBalance = getBalance(quoteAsset);
    logger.info(`
    Valores iniciais:
    - Ação: ${action}
    - Saldo Base (${baseAsset}): ${baseBalance}
    - Saldo Quote (${quoteAsset}): ${quoteBalance}
    - Preço: ${currentPrice}
  `);
    let quantity;
    // Verificar se é porcentagem
    const isPercentage = orderSize.endsWith('%');
    if (action === 'sell') {
        const available = baseBalance;
        if (isPercentage) {
            const percentage = parseFloat(orderSize) / 100;
            if (isNaN(percentage) || percentage <= 0 || percentage > 1) {
                throw new Error(`Porcentagem inválida: ${orderSize}`);
            }
            quantity = available * percentage;
        }
        else {
            quantity = parseFloat(orderSize);
            if (isNaN(quantity) || quantity <= 0) {
                throw new Error(`O valor da ordem em ${baseAsset} deve ser maior que zero`);
            }
            // Verificar se a quantidade solicitada não excede o saldo disponível
            if (quantity > available) {
                quantity = available; // Ajusta para o máximo disponível
                warnings.push({
                    type: 'AMOUNT_ADJUSTED',
                    message: `Quantidade ajustada para o saldo disponível: ${available.toFixed(8)} ${baseAsset}`,
                    details: {
                        calculatedAmount: available,
                        requestedAmount: parseFloat(orderSize),
                        unit: baseAsset
                    }
                });
            }
        }
    }
    else { // buy
        const available = quoteBalance;
        if (isPercentage) {
            const percentage = parseFloat(orderSize) / 100;
            if (isNaN(percentage) || percentage <= 0 || percentage > 1) {
                throw new Error(`Porcentagem inválida: ${orderSize}`);
            }
            // Para compra, calculamos o valor em USDT primeiro
            const quoteAmount = available * percentage;
            // Reduzir 1% para garantir que há saldo suficiente para taxas
            const adjustedQuoteAmount = Math.floor(quoteAmount * 0.99 * 10000) / 10000;
            // Verificar valor mínimo
            if (adjustedQuoteAmount < MIN_ORDER_VALUE) {
                throw new Error(`Valor da ordem (${adjustedQuoteAmount.toFixed(4)} ${quoteAsset}) é menor que o mínimo permitido`);
            }
            // Depois calculamos a quantidade em base asset (XRP)
            quantity = adjustedQuoteAmount / currentPrice;
        }
        else {
            // Se for valor fixo em USDT
            const quoteAmount = parseFloat(orderSize);
            if (isNaN(quoteAmount) || quoteAmount <= 0) {
                throw new Error(`O valor da ordem em ${quoteAsset} deve ser maior que zero`);
            }
            // Reduzir 1% para garantir que há saldo suficiente para taxas
            const adjustedQuoteAmount = Math.floor(quoteAmount * 0.99 * 10000) / 10000;
            // Verificar valor mínimo
            if (adjustedQuoteAmount < MIN_ORDER_VALUE) {
                throw new Error(`Valor da ordem (${adjustedQuoteAmount.toFixed(4)} ${quoteAsset}) é menor que o mínimo permitido`);
            }
            quantity = adjustedQuoteAmount / currentPrice;
        }
    }
    // Para compra, baseAmount é quoteAmount / price
    // Para venda, baseAmount é a própria quantity
    const baseAmount = action === 'buy' ? quantity : quantity;
    // Para compra, quoteAmount é o valor em USDT
    // Para venda, quoteAmount é quantity * price
    const quoteAmount = action === 'buy' ?
        (isPercentage ? quoteBalance * (parseFloat(orderSize) / 100) : parseFloat(orderSize)) :
        quantity * currentPrice;
    logger.info(`
    Cálculo final:
    - Quantidade Base: ${baseAmount} ${baseAsset}
    - Quantidade Quote: ${quoteAmount} ${quoteAsset}
    - Preço: ${currentPrice}
  `);
    return {
        quantity: quantity,
        baseAmount: baseAmount,
        quoteAmount: quoteAmount,
        price: currentPrice,
        baseAsset: baseAsset,
        quoteAsset: quoteAsset,
        error: warnings.length > 0 ? warnings[0].message : undefined,
        metadata: {
            warnings: warnings.length > 0 ? warnings : undefined,
            precision: {
                base: 8, // Precisão padrão para a maioria dos ativos
                quote: 4 // Precisão padrão para USDT
            }
        }
    };
}
