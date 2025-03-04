# Sistema de Logs

## Visão Geral
O sistema possui um mecanismo de logs para registrar e visualizar todas as atividades dos bots, especialmente sinais de trading recebidos via webhook.

## Tipos de Logs

### Ordens de Compra (BUY)
- 🔼 Identificadas com seta verde para cima
- Fundo verde claro
- Exemplo: "Ordem BUY para BTCUSDT (100%)"

### Ordens de Venda (SELL)
- 🔽 Identificadas com seta vermelha para baixo
- Fundo vermelho claro
- Exemplo: "Ordem SELL para XRPUSDT (100%)"

### Logs do Sistema
- ℹ️ Identificados com ícone de informação azul
- Fundo azul claro
- Registram eventos do sistema e operações internas

## Estrutura do Log
```typescript
interface BotLog {
  id: string;
  botId: string;
  action: 'buy' | 'sell' | 'system';
  message: string;
  timestamp: string;
  payload?: {
    action: string;
    ticker: string;
    order_size: string;
    position_size: string;
    schema: string;
    timestamp: string;
    public_id: string;
  };
}
```

## Armazenamento
- Logs são armazenados no Supabase
- Tabela: `BotLog`
- Ordenados por timestamp (mais recentes primeiro)
- Limite de 100 logs por consulta

## Endpoints da API

### Listar Logs
```
GET /api/logs
Authorization: Bearer {token}
```

### Limpar Logs
```
POST /api/logs/clear
Authorization: Bearer {token}
```

## Interface
- Cards coloridos por tipo de ordem
- Cabeçalho com informações essenciais
- Data formatada em português
- Payload detalhado disponível em ambiente de desenvolvimento

## Segurança
- Acesso protegido por autenticação
- Logs imutáveis (não podem ser alterados)
- Cada usuário vê apenas logs dos seus bots

## Desenvolvimento
Para visualizar o payload completo em desenvolvimento:
1. Clique em "Ver payload" no card do log
2. O payload será exibido em formato JSON formatado
3. Esta opção só está disponível em ambiente de desenvolvimento 