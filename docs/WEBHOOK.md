# Sistema de Webhook

## Visão Geral
O sistema de webhook recebe sinais de trading e os processa, gerando logs apropriados para cada ação.

## Estrutura dos Logs

### Tipos de Logs
1. **Ordens de Trading**
   - `action: 'buy' | 'sell'`
   - Registra ordens recebidas via webhook
   - Inclui detalhes da ordem (ticker, tamanho, etc.)

2. **Logs do Sistema**
   - `action: 'system'`
   - Registra eventos internos e erros
   - Usado para monitoramento e debug

### Interface BotLog
```typescript
interface BotLog {
  id: string;           // UUID único do log
  botId: string;        // ID do bot relacionado
  action: 'buy' | 'sell' | 'system';  // Tipo da ação
  message: string;      // Mensagem principal
  timestamp: string;    // ISO 8601 timestamp
  payload?: {           // Dados adicionais
    action: string;
    ticker: string;
    order_size: string;
    position_size: string;
    schema: string;
    timestamp: string;
    public_id: string;
  };
  bot?: {              // Informações do bot
    name: string;
    public_id: string;
  };
}
```

## Payload do Webhook
```json
{
  "action": "buy",           // "buy" ou "sell"
  "ticker": "BTCUSDT",      // Par de trading
  "order_size": "100%",     // Tamanho da ordem
  "position_size": "1",     // Tamanho da posição
  "schema": "2",            // Versão do schema
  "timestamp": "2024-02-17T13:00:00.000Z",
  "public_id": "LIAZQCMU"   // ID público do bot
}
```

## Fluxo de Processamento

1. **Recebimento do Webhook**
   - Validação do payload
   - Verificação do bot pelo public_id
   - Geração de log inicial

2. **Processamento**
   - Validação dos dados
   - Verificação de limites
   - Geração de log de sucesso/erro

3. **Resposta**
   - Sucesso: 200 OK com detalhes
   - Erro: Status apropriado com mensagem

## Visualização

### Interface
- Cards coloridos por tipo:
  - 🟢 Verde para compras
  - 🔴 Vermelho para vendas
  - 🔵 Azul para sistema

### Filtros
- Por tipo de log
- Por data
- Por nome do bot/ID
- Por conteúdo

## Segurança
- Validação de IP
- Autenticação via public_id
- Rate limiting
- Logs detalhados de erros

## Exemplos

### Log de Compra
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "botId": "bot123",
  "action": "buy",
  "message": "Ordem BUY para BTCUSDT (100%)",
  "timestamp": "2024-02-17T13:00:00.000Z",
  "payload": {
    "action": "buy",
    "ticker": "BTCUSDT",
    "order_size": "100%"
  }
}
```

### Log de Sistema
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "botId": "system",
  "action": "system",
  "message": "Validação de webhook",
  "timestamp": "2024-02-17T13:00:00.000Z"
}
```

## Desenvolvimento
- Logs em desenvolvimento mostram payload completo
- Ambiente de teste disponível
- Ferramentas de debug incluídas 