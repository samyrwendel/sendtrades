# Arquitetura SaaS - TradingBot

## Visão Geral
Este documento descreve a arquitetura do TradingBot, focando em multi-tenancy, segurança e escalabilidade. O sistema utiliza Supabase como banco de dados principal e serviço de autenticação.

## Estrutura do Banco de Dados

### Tabelas Principais
```sql
-- Usuários
CREATE TABLE "User" (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  name VARCHAR,
  plan VARCHAR NOT NULL DEFAULT 'free',
  max_bots INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bots
CREATE TABLE "Bots" (
  id UUID PRIMARY KEY,
  public_id VARCHAR(8) UNIQUE NOT NULL CHECK (public_id ~ '^[A-Z0-9]{8}$'),
  user_id UUID REFERENCES "User"(id),
  name VARCHAR NOT NULL,
  trading_pair VARCHAR NOT NULL,
  active BOOLEAN DEFAULT false,
  exchange JSON,
  webhook JSON,
  settings JSON,
  statistics JSON,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Operações
CREATE TABLE "Order" (
  id UUID PRIMARY KEY,
  bot_id UUID REFERENCES "Bots"(id),
  type VARCHAR NOT NULL,
  status VARCHAR NOT NULL,
  amount DECIMAL,
  price DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Logs
CREATE TABLE "BotLog" (
  id UUID PRIMARY KEY,
  bot_id UUID REFERENCES "Bots"(id),
  level VARCHAR NOT NULL,
  message TEXT,
  details JSON,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Interfaces TypeScript

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
  maxBots: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Bot {
  id: string;          // UUID interno
  public_id: string;   // ID público do bot (8 caracteres alfanuméricos)
  userId: string;      // Dono do bot
  name: string;
  tradingPair: string;
  active: boolean;
  exchange: {
    name: string;
    credentials: {
      apiKey: string;
      secretKey: string;
    };
    tradingInfo: {
      baseAsset: string;
      quoteAsset: string;
      minOrderSize: string;
      maxOrderSize: string;
      precision: number;
      status: string;
    };
  };
  webhook: {
    enabled: boolean;
    secretKey: string;
    allowedIPs: string[];
    maxOrdersPerMinute: number;
  };
  settings: {
    maxOrderSize: string;
    minOrderSize: string;
    maxDailyOrders: number;
    tradingEnabled: boolean;
    notifications: {
      email: boolean;
      telegram: boolean;
    };
  };
  statistics: {
    totalTrades: number;
    successfulTrades: number;
    failedTrades: number;
    lastTradeAt: string | null;
    profitLoss: string;
    winRate: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

## Autenticação e Autorização

### Políticas de Segurança do Supabase
```sql
-- Políticas para Bots
CREATE POLICY "Users can view own bots" ON "Bots"
  FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can create bots" ON "Bots"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own bots" ON "Bots"
  FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own bots" ON "Bots"
  FOR DELETE USING (auth.uid()::text = "userId");

-- Políticas para BotLog
CREATE POLICY "Users can view logs of own bots" ON "BotLog"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Bots"
      WHERE "Bots".id = "BotLog"."botId"
      AND "Bots"."userId" = auth.uid()::text
    )
  );

-- Políticas para Order
CREATE POLICY "Users can view orders of own bots" ON "Order"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Bots"
      WHERE "Bots".id = "Order"."botId"
      AND "Bots"."userId" = auth.uid()::text
    )
  );
```

## WebSocket

### Configuração
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// Inscrever-se em atualizações de bots
const subscription = supabase
  .channel('public:Bots')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'Bots',
      filter: `userId=eq.${userId}`
    },
    (payload) => {
      console.log('Mudança detectada:', payload);
      // Atualizar interface
    }
  )
  .subscribe();
```

## Cache

O Supabase fornece cache automático para consultas frequentes. Para otimizar o desempenho:

1. Use `.select('*').eq('userId', user.id)` para consultas frequentes
2. Mantenha os dados em cache no frontend usando React Query ou SWR
3. Implemente cache manual para dados estáticos ou que mudam pouco

## Limites e Planos

```typescript
interface Plan {
  name: string;
  maxBots: number;
  maxOrdersPerMinute: number;
  features: string[];
  price: number;
}

const PLANS: Record<string, Plan> = {
  free: {
    name: 'Free',
    maxBots: 1,
    maxOrdersPerMinute: 60,
    features: ['basic'],
    price: 0
  },
  pro: {
    name: 'Pro',
    maxBots: 5,
    maxOrdersPerMinute: 300,
    features: ['basic', 'advanced'],
    price: 29.99
  },
  enterprise: {
    name: 'Enterprise',
    maxBots: 20,
    maxOrdersPerMinute: 600,
    features: ['basic', 'advanced', 'premium'],
    price: 99.99
  }
};
```

## Monitoramento e Logs

```typescript
interface LogEntry {
  level: 'info' | 'warn' | 'error';
  userId: string;
  botId?: string;
  message: string;
  details?: any;
  timestamp: Date;
}

const logAction = async (entry: LogEntry): Promise<void> => {
  await supabase
    .from('BotLog')
    .insert([{
      botId: entry.botId,
      level: entry.level,
      message: entry.message,
      details: entry.details,
      timestamp: entry.timestamp
    }]);

  // Enviar para sistema de monitoramento se for erro
  if (entry.level === 'error') {
    await notifyAdmins(entry);
  }
};
```

## Considerações de Segurança

1. **Dados Sensíveis**
   - Credenciais de API são criptografadas antes de salvar
   - Chaves de API são armazenadas apenas no Supabase
   - Variáveis sensíveis em .env

2. **Rate Limiting**
   - Por usuário (baseado no plano)
   - Por IP (prevenção de DDoS)
   - Por endpoint (proteção da API)

3. **Validação**
   - Validação de entrada em todas as rotas
   - Verificação de propriedade dos bots
   - Limites baseados no plano

## Escalabilidade

1. **Horizontal**
   - Supabase gerencia a escalabilidade do banco
   - Load balancing automático
   - Conexões WebSocket distribuídas

2. **Vertical**
   - Índices otimizados
   - Cache eficiente
   - Consultas otimizadas

## Próximos Passos

1. **Melhorias de Segurança**
   - Implementar 2FA
   - Adicionar logs de auditoria
   - Melhorar validação de IPs

2. **Otimizações**
   - Implementar cache no frontend
   - Otimizar consultas frequentes
   - Melhorar tempo de resposta

3. **Novas Funcionalidades**
   - Integração com mais exchanges
   - Sistema de notificações
   - Dashboard avançado

4. **Monitoramento**
   - Implementar métricas detalhadas
   - Alertas automáticos
   - Dashboard de status 