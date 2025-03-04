-- Criar tabela Bots
CREATE TABLE IF NOT EXISTS "Bots" (
  "id" UUID PRIMARY KEY,
  "public_id" VARCHAR(8) UNIQUE NOT NULL CHECK (public_id ~ '^[A-Z0-9]{8}$'),
  "userId" UUID REFERENCES "User"(id),
  "name" VARCHAR NOT NULL,
  "tradingPair" VARCHAR NOT NULL,
  "enabled" BOOLEAN DEFAULT false,
  "exchange" JSONB NOT NULL,
  "webhook" JSONB,
  "settings" JSONB,
  "statistics" JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela BotLog
CREATE TABLE IF NOT EXISTS "BotLog" (
  "id" UUID PRIMARY KEY,
  "botId" UUID REFERENCES "Bots"(id),
  "type" VARCHAR NOT NULL,
  "message" TEXT,
  "data" JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela Order
CREATE TABLE IF NOT EXISTS "Order" (
  "id" UUID PRIMARY KEY,
  "botId" UUID REFERENCES "Bots"(id),
  "symbol" VARCHAR NOT NULL,
  "side" VARCHAR NOT NULL,
  "type" VARCHAR NOT NULL,
  "status" VARCHAR NOT NULL,
  "price" DECIMAL,
  "quantity" DECIMAL,
  "quoteQuantity" DECIMAL,
  "commission" DECIMAL,
  "commissionAsset" VARCHAR,
  "data" JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices
CREATE INDEX IF NOT EXISTS "bots_userId_idx" ON "Bots"("userId");
CREATE INDEX IF NOT EXISTS "bots_public_id_idx" ON "Bots"("public_id");
CREATE INDEX IF NOT EXISTS "botlog_botId_idx" ON "BotLog"("botId");
CREATE INDEX IF NOT EXISTS "order_botId_idx" ON "Order"("botId");

-- Criar políticas de segurança
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

CREATE POLICY "Users can create logs for own bots" ON "BotLog"
  FOR INSERT WITH CHECK (
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

CREATE POLICY "Users can create orders for own bots" ON "Order"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Bots"
      WHERE "Bots".id = "Order"."botId"
      AND "Bots"."userId" = auth.uid()::text
    )
  );

-- Habilitar RLS
ALTER TABLE "Bots" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BotLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY; 