# Funcionamento do Sistema de Trading

## Visão Geral
O sistema é composto por vários módulos que trabalham em conjunto para processar sinais de trading e executar ordens na exchange MEXC. Aqui está uma explicação detalhada de cada componente.

## 1. Recebimento de Sinais (Webhooks)

### 1.1 Formato do Webhook
O sistema aceita webhooks no seguinte formato:
```json
{
  "action": "buy" | "sell",
  "ticker": "XRPUSDT",
  "order_size": "100%",
  "position_size": "1" | "0",
  "schema": "2",
  "timestamp": "2025-02-20T01:18:29.814Z",
  "public_id": "BOT_ID"
}
```

### 1.2 Processamento do Webhook
O processamento é feito em etapas:

1. **Validação Inicial** (`webhookHandler.ts`):
```typescript
export async function validateWebhookRequest(
  payload: WebhookPayload,
  bot: Bot,
  clientIp: string
): Promise<{ isValid: boolean; error?: string }> {
  // Validar schema
  if (payload.schema !== "2") {
    return { isValid: false, error: 'Schema inválido' };
  }

  // Validar public_id
  if (payload.public_id !== bot.public_id) {
    return { isValid: false, error: 'Bot ID inválido' };
  }

  // Validar ticker
  if (payload.ticker !== bot.tradingPair) {
    return { isValid: false, error: 'Par de trading inválido' };
  }
}
```

2. **Cálculo da Ordem** (`orderCalculator.ts`):
```typescript
export async function calculateOrderQuantity(
  balances: Balance[],
  orderSize: string,
  ticker: string,
  price: string,
  action: 'buy' | 'sell'
): Promise<OrderCalculationResult> {
  // Extrair ativos do ticker (ex: XRPUSDT -> XRP e USDT)
  const { baseAsset, quoteAsset } = extractAssetsFromTicker(ticker);
  
  // Obter saldos disponíveis
  const baseBalance = getBalance(baseAsset);
  const quoteBalance = getBalance(quoteAsset);
  
  // Verificar se é porcentagem
  const isPercentage = orderSize.endsWith('%');
  
  if (action === 'sell') {
    // Calcular quantidade para venda
    quantity = isPercentage ? 
      baseBalance * (parseFloat(orderSize) / 100) : 
      parseFloat(orderSize);
  } else {
    // Calcular quantidade para compra
    const quoteAmount = isPercentage ?
      quoteBalance * (parseFloat(orderSize) / 100) :
      parseFloat(orderSize);
    quantity = quoteAmount / parseFloat(price);
  }
}
```

## 2. Execução de Ordens

### 2.1 Processamento da Fila (`orderProcessor.ts`)
O sistema processa as ordens de forma assíncrona:

```typescript
export async function processOrderQueue() {
  // Buscar ordens pendentes
  const pendingOrders = await getPendingOrders();
  
  for (const order of pendingOrders) {
    try {
      // Obter exchange configurada
      const exchange = getExchange(order.bot.exchange.name);
      
      // Calcular quantidade
      const orderCalc = await calculateOrderQuantity(
        await exchange.getBalances(credentials),
        order.payload.order_size,
        order.payload.ticker,
        await exchange.getCurrentPrice(order.payload.ticker),
        order.action.toLowerCase()
      );
      
      // Executar ordem
      const tradeResult = await exchange.executeTrade(credentials, {
        symbol: order.payload.ticker,
        amount: orderCalc.quantity.toString(),
        type: order.action.toLowerCase(),
        timestamp: serverTime
      });
    } catch (error) {
      // Tratamento de erros
    }
  }
}
```

### 2.2 Execução na MEXC (`mexc.ts`)
A execução na MEXC é feita via API:

```typescript
async executeTrade(credentials: ExchangeCredentials, params: TradeParams) {
  // Gerar timestamp
  const timestamp = await this.getServerTime();
  
  // Parâmetros da ordem
  const orderParams = {
    symbol: params.symbol,
    side: params.type.toUpperCase(),
    type: 'MARKET',
    quantity: params.amount,
    timestamp: timestamp,
    recvWindow: 5000
  };
  
  // Gerar assinatura
  const signature = generateSignature(queryString, credentials.secretKey);
  
  // Enviar ordem
  const response = await axios.post(
    `${MEXC_API_URL}/order`,
    null,
    {
      params: { ...orderParams, signature },
      headers: { 'X-MEXC-APIKEY': credentials.apiKey }
    }
  );
}
```

## 3. Diferenças entre Ordens de Compra e Venda

### 3.1 Ordens de Compra (BUY)
- Usa `quoteOrderQty` para especificar o valor em USDT
- Calcula baseado no saldo de USDT disponível
- Position size = "1" (entrando na posição)

### 3.2 Ordens de Venda (SELL)
- Usa `quantity` para especificar a quantidade do ativo
- Calcula baseado no saldo do ativo disponível
- Position size = "0" (saindo da posição)

## 4. Logs e Monitoramento

O sistema mantém logs detalhados de cada etapa:

```typescript
await addLog({
  botId: bot.id,
  type: 'webhook_executed',
  action: payload.action,
  message: `Ordem executada: ${payload.action} ${payload.ticker}`,
  details: `Execução concluída:
    Par: ${payload.ticker}
    Order ID: ${tradeResult.orderId}
    Quantidade: ${orderCalc.quantity}
    Valor: ${orderCalc.quoteAmount} USDT
    Preço: ${orderCalc.price}`,
  status: 'success',
  clientip: clientIp,
  userId: bot.userId,
  public_id: bot.public_id,
  payload: {
    ...payload,
    orderId: tradeResult.orderId
  }
});
```

## 5. Tratamento de Erros

O sistema possui tratamento robusto de erros:

1. **Validação de Saldo Insuficiente**
2. **Verificação de Valor Mínimo da Ordem**
3. **Timeout na Execução**
4. **Erros de Rede**
5. **Erros da Exchange**

## 6. Testes

### 6.1 Script de Teste de Webhook
```javascript
async function testWebhook(action, size, ticker) {
  const webhook = {
    action: action,
    ticker: ticker,
    order_size: String(size),
    position_size: action === "buy" ? "1" : "0",
    schema: "2",
    timestamp: new Date().toISOString(),
    public_id: "BOT_ID"
  };
  
  // Enviar webhook
  const response = await axios.post('/api/webhook', webhook);
  
  // Aguardar processamento
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Buscar logs
  const logs = await axios.get('/api/logs');
}
```

## 7. Configurações Importantes

### 7.1 Precisão dos Ativos
- USDT: 4 casas decimais
- Outros ativos: variável conforme a exchange

### 7.2 Limites da MEXC
- Valor mínimo por ordem: 5 USDT
- Tempo máximo de recvWindow: 60000ms

## 8. Segurança

1. **Validação de IPs**
2. **Assinatura de Webhooks**
3. **Timeout em Requisições**
4. **Rate Limiting**
5. **Validação de Credenciais** 