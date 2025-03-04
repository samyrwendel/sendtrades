# Integração com Exchanges - TradingBot

## Exchanges Suportadas

Atualmente, o TradingBot suporta as seguintes exchanges:

1. **MEXC**
   - Spot Trading
   - Futuros (em desenvolvimento)
   - [Documentação Oficial](https://mxcdevelop.github.io/apidocs/spot_v3_en)

2. **KuCoin** (em desenvolvimento)
   - Spot Trading
   - [Documentação Oficial](https://docs.kucoin.com)

## Estrutura de Credenciais

### 1. MEXC
```typescript
interface MexcCredentials {
  apiKey: string;
  secretKey: string;
  testnet: boolean;
}
```

### 2. KuCoin
```typescript
interface KuCoinCredentials {
  apiKey: string;
  secretKey: string;
  passphrase: string;
  testnet: boolean;
}
```

## Configuração de Exchange

```typescript
interface ExchangeConfig {
  exchange: "MEXC" | "KUCOIN";
  credentials: MexcCredentials | KuCoinCredentials;
  tradingInfo: {
    precision: number;
    minOrderSize: number;
    maxOrderSize: number;
    status: "TRADING" | "PAUSED" | "STOPPED";
  };
}
```

## Validação de Credenciais

### 1. MEXC
```typescript
async function validateMexcCredentials(credentials: MexcCredentials) {
  try {
    const client = new MexcClient({
      apiKey: credentials.apiKey,
      secretKey: credentials.secretKey,
      testnet: credentials.testnet
    });

    // Testar conexão
    await client.getAccountInfo();
    return true;
  } catch (error) {
    throw new Error("Credenciais MEXC inválidas");
  }
}
```

### 2. KuCoin
```typescript
async function validateKuCoinCredentials(credentials: KuCoinCredentials) {
  try {
    const client = new KuCoinClient({
      apiKey: credentials.apiKey,
      secretKey: credentials.secretKey,
      passphrase: credentials.passphrase,
      testnet: credentials.testnet
    });

    // Testar conexão
    await client.getAccountInfo();
    return true;
  } catch (error) {
    throw new Error("Credenciais KuCoin inválidas");
  }
}
```

## Execução de Ordens

### 1. Ordem de Compra
```typescript
async function placeBuyOrder(bot: Bot, price: string, quantity: string) {
  const client = getExchangeClient(bot);
  
  const order = await client.createOrder({
    symbol: bot.tradingPair,
    side: "BUY",
    type: "LIMIT",
    price: price,
    quantity: quantity
  });

  await logOrder({
    botId: bot.id,
    orderId: order.id,
    type: "BUY",
    price: price,
    quantity: quantity,
    status: order.status
  });

  return order;
}
```

### 2. Ordem de Venda
```typescript
async function placeSellOrder(bot: Bot, price: string, quantity: string) {
  const client = getExchangeClient(bot);
  
  const order = await client.createOrder({
    symbol: bot.tradingPair,
    side: "SELL",
    type: "LIMIT",
    price: price,
    quantity: quantity
  });

  await logOrder({
    botId: bot.id,
    orderId: order.id,
    type: "SELL",
    price: price,
    quantity: quantity,
    status: order.status
  });

  return order;
}
```

## Gerenciamento de Saldo

### 1. Obter Saldo
```typescript
async function getBalance(bot: Bot, asset: string) {
  const client = getExchangeClient(bot);
  const balance = await client.getBalance(asset);
  
  return {
    free: balance.free,
    locked: balance.locked,
    total: balance.total
  };
}
```

### 2. Verificar Saldo Disponível
```typescript
async function checkAvailableBalance(bot: Bot, asset: string, amount: string) {
  const balance = await getBalance(bot, asset);
  
  if (parseFloat(balance.free) < parseFloat(amount)) {
    throw new Error("Saldo insuficiente");
  }
  
  return true;
}
```

## Monitoramento de Ordens

### 1. Status da Ordem
```typescript
async function checkOrderStatus(bot: Bot, orderId: string) {
  const client = getExchangeClient(bot);
  const order = await client.getOrder(orderId);
  
  return {
    orderId: order.id,
    status: order.status,
    filledQuantity: order.filledQuantity,
    remainingQuantity: order.remainingQuantity,
    price: order.price,
    avgPrice: order.avgPrice
  };
}
```

### 2. Histórico de Ordens
```typescript
async function getOrderHistory(bot: Bot, limit: number = 100) {
  const client = getExchangeClient(bot);
  const orders = await client.getOrders({
    symbol: bot.tradingPair,
    limit: limit
  });
  
  return orders.map(order => ({
    orderId: order.id,
    type: order.side,
    price: order.price,
    quantity: order.quantity,
    status: order.status,
    timestamp: order.timestamp
  }));
}
```

## Tratamento de Erros

### 1. Códigos de Erro
```typescript
const EXCHANGE_ERROR_CODES = {
  INVALID_CREDENTIALS: "EX001",
  INSUFFICIENT_BALANCE: "EX002",
  INVALID_ORDER: "EX003",
  RATE_LIMIT_EXCEEDED: "EX004",
  MARKET_CLOSED: "EX005",
  INVALID_PRICE: "EX006",
  INVALID_QUANTITY: "EX007",
  ORDER_NOT_FOUND: "EX008",
  EXCHANGE_ERROR: "EX009"
};
```

### 2. Respostas de Erro
```json
{
  "success": false,
  "error": {
    "code": "EX002",
    "message": "Saldo insuficiente",
    "details": {
      "required": "100.50",
      "available": "50.25",
      "asset": "USDT"
    }
  }
}
```

## Considerações de Segurança

1. **Proteção de Credenciais**
   - Nunca armazenar chaves em texto plano
   - Usar variáveis de ambiente
   - Limitar permissões das APIs ao mínimo necessário

2. **Rate Limiting**
   - Respeitar limites da exchange
   - Implementar filas de requisições
   - Monitorar uso da API

3. **Validações**
   - Validar todos os inputs
   - Verificar saldos antes de operar
   - Confirmar status das ordens

## Logs e Monitoramento

### 1. Estrutura do Log
```typescript
interface ExchangeLog {
  id: string;
  botId: string;
  timestamp: Date;
  type: "ORDER" | "BALANCE" | "ERROR";
  exchange: string;
  details: any;
}
```

### 2. Exemplo de Log
```json
{
  "id": "log_123",
  "botId": "bot_456",
  "timestamp": "2024-02-14T10:00:00Z",
  "type": "ORDER",
  "exchange": "MEXC",
  "details": {
    "orderId": "ord_789",
    "type": "BUY",
    "price": "50000",
    "quantity": "0.1",
    "status": "FILLED",
    "fees": {
      "asset": "USDT",
      "amount": "0.05"
    }
  }
}
```

## Testes

### 1. Testes de Integração
```typescript
describe("Exchange Integration", () => {
  it("should validate credentials", async () => {
    const result = await validateCredentials(testBot);
    expect(result).toBe(true);
  });

  it("should place buy order", async () => {
    const order = await placeBuyOrder(testBot, "50000", "0.1");
    expect(order.status).toBe("FILLED");
  });

  it("should get balance", async () => {
    const balance = await getBalance(testBot, "USDT");
    expect(balance.free).toBeDefined();
  });
});
```

### 2. Testes de Erro
```typescript
describe("Exchange Error Handling", () => {
  it("should handle invalid credentials", async () => {
    try {
      await validateCredentials(invalidBot);
    } catch (error) {
      expect(error.code).toBe("EX001");
    }
  });

  it("should handle insufficient balance", async () => {
    try {
      await placeBuyOrder(testBot, "50000", "100");
    } catch (error) {
      expect(error.code).toBe("EX002");
    }
  });
}); 