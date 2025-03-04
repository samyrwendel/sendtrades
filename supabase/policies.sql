-- Verificar se as tabelas existem
DO $$ 
BEGIN
    -- Criar tabelas se não existirem
    CREATE TABLE IF NOT EXISTS "User" (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        plan TEXT DEFAULT 'free',
        active BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "bots" (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        enabled BOOLEAN DEFAULT false,
        "userId" TEXT NOT NULL REFERENCES "User"(id),
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "tradingPair" TEXT NOT NULL,
        exchange JSONB NOT NULL DEFAULT '{}',
        webhook JSONB NOT NULL DEFAULT '{}',
        settings JSONB NOT NULL DEFAULT '{}',
        statistics JSONB NOT NULL DEFAULT '{}'
    );

    CREATE TABLE IF NOT EXISTS "BotLog" (
        id TEXT PRIMARY KEY,
        "botId" TEXT NOT NULL REFERENCES "bots"(id),
        type TEXT NOT NULL,
        action TEXT NOT NULL,
        message TEXT NOT NULL,
        details TEXT NOT NULL,
        metadata JSONB,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "userId" TEXT REFERENCES "User"(id),
        "clientIp" TEXT,
        status TEXT NOT NULL,
        payload JSONB
    );

    CREATE TABLE IF NOT EXISTS "Order" (
        id TEXT PRIMARY KEY,
        "botId" TEXT NOT NULL REFERENCES "bots"(id),
        type TEXT NOT NULL,
        status TEXT NOT NULL,
        amount TEXT NOT NULL,
        price TEXT,
        symbol TEXT NOT NULL,
        exchange TEXT NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB
    );

    CREATE TABLE IF NOT EXISTS "ApiKey" (
        id TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL REFERENCES "User"(id),
        name TEXT NOT NULL,
        key TEXT UNIQUE NOT NULL,
        "lastUsedAt" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "expiresAt" TIMESTAMP WITH TIME ZONE,
        active BOOLEAN DEFAULT true
    );
END $$;

-- Habilitar RLS para todas as tabelas
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bots" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BotLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ApiKey" ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view own profile" ON "User";
DROP POLICY IF EXISTS "Users can update own profile" ON "User";
DROP POLICY IF EXISTS "Users can view own bots" ON "bots";
DROP POLICY IF EXISTS "Users can create bots" ON "bots";
DROP POLICY IF EXISTS "Users can update own bots" ON "bots";
DROP POLICY IF EXISTS "Users can delete own bots" ON "bots";
DROP POLICY IF EXISTS "Users can view logs of own bots" ON "BotLog";
DROP POLICY IF EXISTS "Users can create logs for own bots" ON "BotLog";
DROP POLICY IF EXISTS "Users can view orders of own bots" ON "Order";
DROP POLICY IF EXISTS "Users can create orders for own bots" ON "Order";
DROP POLICY IF EXISTS "Users can update orders of own bots" ON "Order";
DROP POLICY IF EXISTS "Users can view own API keys" ON "ApiKey";
DROP POLICY IF EXISTS "Users can create API keys" ON "ApiKey";
DROP POLICY IF EXISTS "Users can update own API keys" ON "ApiKey";
DROP POLICY IF EXISTS "Users can delete own API keys" ON "ApiKey";
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "User";
DROP POLICY IF EXISTS "Enable insert for registration" ON "User";
DROP POLICY IF EXISTS "Enable read for public profiles" ON "User";

-- Políticas para User
CREATE POLICY "Users can view own profile" ON "User"
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile" ON "User"
  FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Enable insert for registration" ON "User"
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read for public profiles" ON "User"
  FOR SELECT USING (true);

-- Políticas para bots
CREATE POLICY "Users can view own bots" ON "bots"
  FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can create bots" ON "bots"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own bots" ON "bots"
  FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own bots" ON "bots"
  FOR DELETE USING (auth.uid()::text = "userId");

-- Políticas para BotLog
CREATE POLICY "Users can view logs of own bots" ON "BotLog"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "bots"
      WHERE "bots".id = "BotLog"."botId"
      AND "bots"."userId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can create logs for own bots" ON "BotLog"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "bots"
      WHERE "bots".id = "BotLog"."botId"
      AND "bots"."userId" = auth.uid()::text
    )
  );

-- Políticas para Order
CREATE POLICY "Users can view orders of own bots" ON "Order"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "bots"
      WHERE "bots".id = "Order"."botId"
      AND "bots"."userId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can create orders for own bots" ON "Order"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "bots"
      WHERE "bots".id = "Order"."botId"
      AND "bots"."userId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can update orders of own bots" ON "Order"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM "bots"
      WHERE "bots".id = "Order"."botId"
      AND "bots"."userId" = auth.uid()::text
    )
  );

-- Políticas para ApiKey
CREATE POLICY "Users can view own API keys" ON "ApiKey"
  FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can create API keys" ON "ApiKey"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own API keys" ON "ApiKey"
  FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own API keys" ON "ApiKey"
  FOR DELETE USING (auth.uid()::text = "userId");

-- Política para permitir autenticação
CREATE POLICY "Enable read access for authenticated users" ON "User"
  FOR SELECT USING (auth.role() = 'authenticated'); 