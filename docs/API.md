# API do TradingBot

## Visão Geral

A API do TradingBot é uma API RESTful que permite gerenciar bots de trading, receber sinais via webhook e interagir com exchanges de criptomoedas.

## Autenticação

Todas as rotas (exceto webhook) requerem autenticação via token JWT no header:

```bash
Authorization: Bearer seu_token_jwt
```

## Endpoints

### Autenticação

#### Login
```http
POST /api/auth/login

{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}

Response 200:
{
  "token": "seu_token_jwt",
  "user": {
    "id": "user_123",
    "email": "usuario@exemplo.com"
  }
}
```

#### Refresh Token
```http
POST /api/auth/refresh

{
  "refreshToken": "seu_refresh_token"
}

Response 200:
{
  "token": "novo_token_jwt",
  "refreshToken": "novo_refresh_token"
}
```

### Bots

#### Listar Bots
```http
GET /api/bots

Response 200:
{
  "bots": [
    {
      "id": "bot_123",
      "public_id": "ABC123XY",
      "name": "BTCUSDT Bot",
      "enabled": true,
      "exchange": {
        "name": "MEXC",
        "config": {
          "credentials": {
            "apiKey": "***",
            "secretKey": "***"
          },
          "testnet": false,
          "tradingInfo": {
            "baseAsset": "BTC",
            "quoteAsset": "USDT",
            "minOrderSize": "0.0001",
            "maxOrderSize": "10",
            "precision": 8,
            "status": "TRADING"
          }
        }
      },
      "webhook": {
        "enabled": true,
        "secretKey": "***",
        "allowedIPs": ["127.0.0.1"],
        "maxOrdersPerMinute": 60
      },
      "settings": {
        "maxOrderSize": "1",
        "minOrderSize": "0.0001",
        "maxDailyOrders": 100,
        "tradingEnabled": true,
        "notifications": {
          "email": false,
          "telegram": false
        }
      },
      "statistics": {
        "totalTrades": 10,
        "successfulTrades": 8,
        "failedTrades": 2,
        "lastTradeAt": "2024-02-14T10:00:00Z",
        "profitLoss": "123.45",
        "winRate": "80"
      }
    }
  ]
}
```

#### Obter Bot
```http
GET /api/bots/:id

Response 200:
{
  "bot": {
    // Mesma estrutura do objeto bot acima
  }
}
```

#### Criar Bot
```http
POST /api/bots

{
  "name": "BTCUSDT Bot",
  "tradingPair": "BTCUSDT",
  "exchange": {
    "name": "MEXC",
    "config": {
      "credentials": {
        "apiKey": "sua_api_key",
        "secretKey": "sua_secret_key"
      },
      "testnet": false,
      "tradingInfo": {
        "baseAsset": "BTC",
        "quoteAsset": "USDT",
        "minOrderSize": "0.0001",
        "maxOrderSize": "10",
        "precision": 8,
        "status": "TRADING"
      }
    }
  },
  "webhook": {
    "enabled": true,
    "allowedIPs": ["127.0.0.1"],
    "maxOrdersPerMinute": 60
  },
  "settings": {
    "maxOrderSize": "1",
    "minOrderSize": "0.0001",
    "maxDailyOrders": 100,
    "tradingEnabled": true,
    "notifications": {
      "email": false,
      "telegram": false
    }
  }
}

Response 201:
{
  "bot": {
    // Bot criado com public_id gerado
  }
}
```

#### Atualizar Bot
```http
PUT /api/bots/:id

{
  // Mesma estrutura do POST, campos opcionais
}

Response 200:
{
  "bot": {
    // Bot atualizado
  }
}
```

#### Excluir Bot
```http
DELETE /api/bots/:id

Response 204
```

#### Ativar/Desativar Bot
```http
POST /api/bots/:id/toggle

Response 200:
{
  "bot": {
    // Bot com status atualizado
  }
}
```

### Webhook

#### Receber Sinal
```http
POST /trading

{
  "action": "buy",
  "ticker": "BTCUSDT",
  "order_size": "100%",
  "position_size": "1",
  "schema": "2",
  "timestamp": 1676329938,
  "public_id": "ABC123XY"
}

Response 200:
{
  "success": true,
  "order": {
    "id": "ord_123",
    "status": "FILLED",
    "price": "50000",
    "quantity": "0.1"
  }
}
```

### Exchange

#### Validar Credenciais
```http
POST /api/exchange/validate

{
  "exchange": "MEXC",
  "credentials": {
    "apiKey": "sua_api_key",
    "secretKey": "sua_secret_key"
  }
}

Response 200:
{
  "valid": true
}
```

#### Obter Saldo
```http
GET /api/exchange/balance/:botId

Response 200:
{
  "balances": [
    {
      "asset": "BTC",
      "free": "0.1",
      "locked": "0",
      "total": "0.1"
    },
    {
      "asset": "USDT",
      "free": "1000",
      "locked": "0",
      "total": "1000"
    }
  ]
}
```

#### Obter Pares de Trading
```http
GET /api/exchange/pairs/:exchange

Response 200:
{
  "pairs": [
    {
      "symbol": "BTCUSDT",
      "baseAsset": "BTC",
      "quoteAsset": "USDT",
      "minOrderSize": "0.0001",
      "maxOrderSize": "10",
      "precision": 8,
      "status": "TRADING"
    }
  ]
}
```

### Logs

#### Obter Logs do Bot
```http
GET /api/logs/:botId

Query Parameters:
- type: "ORDER" | "ERROR" | "ALL"
- limit: number
- offset: number
- startDate: ISO date
- endDate: ISO date

Response 200:
{
  "logs": [
    {
      "id": "log_123",
      "botId": "bot_456",
      "timestamp": "2024-02-14T10:00:00Z",
      "type": "ORDER",
      "details": {
        "orderId": "ord_789",
        "type": "BUY",
        "price": "50000",
        "quantity": "0.1",
        "status": "FILLED"
      }
    }
  ],
  "total": 100,
  "offset": 0,
  "limit": 10
}
```

## Códigos de Erro

### Gerais
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

### Específicos
```typescript
const ERROR_CODES = {
  // Auth
  AUTH001: "Token inválido",
  AUTH002: "Token expirado",
  AUTH003: "Credenciais inválidas",
  
  // Bot
  BOT001: "Bot não encontrado",
  BOT002: "Nome inválido",
  BOT003: "Par de trading inválido",
  
  // Exchange
  EX001: "Credenciais inválidas",
  EX002: "Saldo insuficiente",
  EX003: "Ordem inválida",
  
  // Webhook
  WH001: "IP não autorizado",
  WH002: "Payload inválido",
  WH003: "Rate limit excedido"
};
```

## Rate Limiting

A API possui os seguintes limites por IP:

- `/api/*`: 100 requisições por minuto
- `/trading`: 60 requisições por minuto por bot
- `/api/exchange/*`: 30 requisições por minuto

## Websocket

### Conexão
```typescript
const ws = new WebSocket('wss://api.tradingbot.com/ws');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'seu_token_jwt'
  }));
};
```

### Eventos
```typescript
// Atualização de bot
{
  type: 'bot_update',
  data: {
    botId: 'bot_123',
    // Dados atualizados do bot
  }
}

// Nova ordem
{
  type: 'new_order',
  data: {
    botId: 'bot_123',
    orderId: 'ord_456',
    // Detalhes da ordem
  }
}

// Atualização de saldo
{
  type: 'balance_update',
  data: {
    botId: 'bot_123',
    balances: [
      // Lista de saldos
    ]
  }
}
```

## Exemplos

### Criar Bot com cURL
```bash
curl -X POST https://api.tradingbot.com/api/bots \
  -H "Authorization: Bearer seu_token_jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "BTCUSDT Bot",
    "tradingPair": "BTCUSDT",
    "exchange": {
      "name": "MEXC",
      "config": {
        "credentials": {
          "apiKey": "sua_api_key",
          "secretKey": "sua_secret_key"
        }
      }
    }
  }'
```

### Enviar Sinal com Python
```python
import requests
import time

webhook_url = "https://api.tradingbot.com/trading"
payload = {
    "action": "buy",
    "ticker": "BTCUSDT",
    "order_size": "100%",
    "position_size": "1",
    "schema": "2",
    "timestamp": int(time.time()),
    "public_id": "ABC123XY"
}

response = requests.post(webhook_url, json=payload)
print(response.json())
```

### Monitorar Bot com Node.js
```javascript
const WebSocket = require('ws');

const ws = new WebSocket('wss://api.tradingbot.com/ws');

ws.on('open', () => {
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'seu_token_jwt'
  }));
});

ws.on('message', (data) => {
  const event = JSON.parse(data);
  
  switch (event.type) {
    case 'bot_update':
      console.log('Bot atualizado:', event.data);
      break;
    case 'new_order':
      console.log('Nova ordem:', event.data);
      break;
    case 'balance_update':
      console.log('Saldo atualizado:', event.data);
      break;
  }
});
```

# Documentação da API

## Endpoints

### Webhook
Endpoint para receber sinais de trading.

**URL**: `/api/webhook`  
**Método**: `POST`  
**Headers**:
- `Content-Type: application/json`

**Payload**:
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

**Resposta de Sucesso**:
```json
{
  "message": "Sinal recebido com sucesso",
  "signal_id": "f8ef5680-15a4-45e3-81a1-5a6fea799798",
  "received_at": "2025-02-20T01:18:59.883Z"
}
```

**Resposta de Erro**:
```json
{
  "error": "Mensagem de erro",
  "details": "Detalhes do erro"
}
```

### Logs
Endpoint para consultar logs do sistema.

**URL**: `/api/logs`  
**Método**: `GET`  
**Headers**:
- `Authorization: Bearer {token}`

**Resposta de Sucesso**:
```json
{
  "success": true,
  "logs": [
    {
      "id": "f8ef5680-15a4-45e3-81a1-5a6fea799798",
      "type": "webhook_received",
      "action": "sell",
      "status": "processing",
      "message": "Webhook processado: SELL XRPUSDT",
      "timestamp": "2025-02-20T01:18:59.883Z",
      "details": "Ordem SELL para XRPUSDT (100%)",
      "metadata": {
        "processedAt": "2025-02-20T01:18:59.883Z",
        "signalTimestamp": "2025-02-20T01:18:29.814Z"
      }
    }
  ]
}
```

### Limpar Logs
Endpoint para limpar logs do sistema.

**URL**: `/api/logs/clear`  
**Método**: `POST`  
**Headers**:
- `Authorization: Bearer {token}`

**Resposta de Sucesso**:
```json
{
  "success": true,
  "message": "Logs limpos com sucesso"
}
```

### Status do Bot
Endpoint para verificar o status do bot.

**URL**: `/api/bots/{bot_id}/status`  
**Método**: `GET`  
**Headers**:
- `Authorization: Bearer {token}`

**Resposta de Sucesso**:
```json
{
  "success": true,
  "bot": {
    "id": "BOT_ID",
    "name": "Nome do Bot",
    "status": "active",
    "tradingPair": "XRPUSDT",
    "lastTrade": {
      "action": "buy",
      "timestamp": "2025-02-20T01:18:59.883Z",
      "price": "2.7175",
      "quantity": "8.164235142594297"
    }
  }
}
```

## Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 400 | Requisição inválida |
| 401 | Não autorizado |
| 403 | Acesso negado |
| 404 | Recurso não encontrado |
| 429 | Muitas requisições |
| 500 | Erro interno do servidor |

## Rate Limiting

- Máximo de 60 requisições por minuto por IP
- Máximo de 10 ordens por minuto por bot
- Headers de resposta incluem:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

## Autenticação

O sistema usa autenticação via token JWT. O token deve ser incluído no header `Authorization` como `Bearer {token}`.

### Exemplo de Requisição Autenticada:
```bash
curl -X GET \
  'http://localhost:3001/api/logs' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

## Webhooks

### Validação de Assinatura
Para garantir a autenticidade dos webhooks, uma assinatura é gerada usando HMAC SHA256:

```javascript
const hmac = createHmac('sha256', webhookSecret);
hmac.update(JSON.stringify(payload));
const signature = hmac.digest('hex');
```

### Retry Policy
Em caso de falha, o sistema tentará reenviar o webhook nas seguintes condições:
- Máximo de 3 tentativas
- Intervalos exponenciais: 5s, 15s, 45s
- Timeout de 10 segundos por tentativa 