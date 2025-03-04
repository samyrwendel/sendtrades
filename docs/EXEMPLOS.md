# Exemplos de Uso do Trading Bot

## 1. Formato do Webhook

O webhook deve seguir este formato:
```json
{
  "action": "buy" | "sell",     // Tipo da ordem
  "ticker": "XRPUSDT",         // Par de trading
  "order_size": "100%",        // Tamanho da ordem (porcentagem ou valor fixo)
  "position_size": "1" | "0",  // 1 para compra (entrando), 0 para venda (saindo)
  "schema": "2",              // Versão do schema (sempre "2")
  "timestamp": "2025-02-20T13:45:56.275Z", // Timestamp em ISO 8601
  "public_id": "BOT_ID",      // ID público do bot
  "signature": "hash"         // Assinatura HMAC SHA256 (opcional)
}
```

## 2. Enviar Ordem de Compra

### Usando cURL
```bash
curl -X POST http://localhost:3001/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "action": "buy",
    "ticker": "XRPUSDT",
    "order_size": "100%",
    "position_size": "1",
    "schema": "2",
    "timestamp": "2025-02-20T13:45:56.275Z",
    "public_id": "BOT_ID"
  }'
```

### Usando Node.js (TypeScript)
```typescript
import axios from 'axios';
import { createHmac } from 'crypto';

interface WebhookPayload {
  action: 'buy' | 'sell';
  ticker: string;
  order_size: string;
  position_size: string;
  schema: string;
  timestamp: string;
  public_id: string;
  signature?: string;
}

// Função para gerar assinatura
function generateSignature(message: string, secret: string): string {
  const hmac = createHmac('sha256', secret);
  hmac.update(message);
  return hmac.digest('hex');
}

async function sendOrder() {
  try {
    const webhook: WebhookPayload = {
      action: "buy",
      ticker: "XRPUSDT",
      order_size: "100%",
      position_size: "1",
      schema: "2",
      timestamp: new Date().toISOString(),
      public_id: "BOT_ID"
    };

    // Gerar assinatura (opcional)
    const secret = "seu_webhook_secret";
    webhook.signature = generateSignature(JSON.stringify(webhook), secret);

    const response = await axios.post('http://localhost:3001/api/webhook', webhook);
    console.log('Ordem enviada:', response.data);
    
    // Aguardar processamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verificar logs
    const logs = await axios.get('http://localhost:3001/api/logs');
    console.log('Logs:', logs.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Erro:', error.response?.data);
    } else {
      console.error('Erro:', error);
    }
  }
}
```

### Usando Python
```python
import requests
import json
import hmac
import hashlib
from datetime import datetime

def generate_signature(message: str, secret: str) -> str:
    return hmac.new(
        secret.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()

webhook = {
    "action": "buy",
    "ticker": "XRPUSDT",
    "order_size": "100%",
    "position_size": "1",
    "schema": "2",
    "timestamp": datetime.now().isoformat(),
    "public_id": "BOT_ID"
}

# Gerar assinatura (opcional)
secret = "seu_webhook_secret"
webhook["signature"] = generate_signature(json.dumps(webhook), secret)

response = requests.post(
    'http://localhost:3001/api/webhook',
    json=webhook
)
print('Resposta:', response.json())

# Aguardar processamento
import time
time.sleep(2)

# Verificar logs
logs = requests.get('http://localhost:3001/api/logs')
print('Logs:', logs.json())
```

## 3. Enviar Ordem de Venda

### Usando Node.js (TypeScript)
```typescript
const webhook: WebhookPayload = {
  action: "sell",
  ticker: "XRPUSDT",
  order_size: "100%",    // Vender 100% do saldo disponível
  position_size: "0",    // 0 indica saída da posição
  schema: "2",
  timestamp: new Date().toISOString(),
  public_id: "BOT_ID"
};
```

## 4. Exemplos de Respostas

### Sucesso ao Enviar Ordem
```json
{
  "message": "Sinal recebido com sucesso",
  "signal_id": "01a0e393-9875-4b22-b939-43a3b3f7cffa",
  "received_at": "2025-02-20T13:46:26.312Z"
}
```

### Log de Ordem Calculada (Compra)
```json
{
  "type": "webhook_processed",
  "action": "buy",
  "status": "success",
  "message": "Ordem calculada: buy XRPUSDT",
  "details": {
    "Par": "XRPUSDT",
    "Tamanho Original": "100%",
    "Quantidade Calculada": "2.931977162347533",
    "Valor Base": "2.931977162347533",
    "Valor Quote": "2.931977162347533",
    "Preço": "2.6973"
  }
}
```

### Log de Ordem Executada (Venda)
```json
{
  "type": "webhook_executed",
  "action": "sell",
  "status": "success",
  "message": "Ordem executada: sell XRPUSDT",
  "details": {
    "Par": "XRPUSDT",
    "Order ID": "C02__521255330173341696018",
    "Quantidade": "8.21",
    "Valor": "22.149759000000003",
    "Preço": "2.6979"
  }
}
```

### Erro de Valor Mínimo
```json
{
  "error": "Valor da ordem (3.06 USDT) é menor que o mínimo permitido (5 USDT)",
  "details": {
    "calculatedAmount": 3.06,
    "minRequired": 5,
    "unit": "USDT"
  }
}
```

## 5. Regras e Limitações

1. **Valor Mínimo por Ordem**
   - Mínimo de 5 USDT por ordem
   - Aplica-se tanto para compras quanto vendas

2. **Formatos de Order Size**
   - Porcentagem: "100%", "50%", "25%", etc.
   - Valor fixo em USDT: "10", "20", etc.

3. **Position Size**
   - "1" para compras (entrando na posição)
   - "0" para vendas (saindo da posição)

4. **Timestamp**
   - Formato ISO 8601
   - Não pode ser mais antigo que 5 minutos
   - Deve estar em UTC

## 6. Boas Práticas

1. **Validação de Dados**
   - Verifique se o par de trading está ativo
   - Confirme se há saldo suficiente
   - Valide o formato do timestamp

2. **Tratamento de Erros**
   - Implemente retry em caso de erros de rede
   - Aguarde 2 segundos entre tentativas
   - Verifique os logs após cada ordem

3. **Monitoramento**
   - Acompanhe os logs de execução
   - Verifique o status final da ordem
   - Monitore os saldos antes e depois

4. **Segurança**
   - Use HTTPS para todas as requisições
   - Implemente assinatura dos webhooks
   - Mantenha as credenciais seguras

## 7. Script de Teste Completo

Veja o arquivo `scripts/testWebhook.ts` para um exemplo completo de implementação. 