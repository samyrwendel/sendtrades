-- Adicionar novas colunas à tabela BotLog
ALTER TABLE "BotLog"
  ADD COLUMN IF NOT EXISTS "action" TEXT,
  ADD COLUMN IF NOT EXISTS "details" TEXT,
  ADD COLUMN IF NOT EXISTS "status" TEXT,
  ADD COLUMN IF NOT EXISTS "clientip" TEXT,
  ADD COLUMN IF NOT EXISTS "userId" UUID REFERENCES "User"(id),
  ADD COLUMN IF NOT EXISTS "payload" JSONB;

-- Atualizar colunas existentes para não serem nulas
ALTER TABLE "BotLog"
  ALTER COLUMN "action" SET NOT NULL,
  ALTER COLUMN "details" SET NOT NULL,
  ALTER COLUMN "status" SET NOT NULL;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS "botlog_userId_idx" ON "BotLog"("userId");
CREATE INDEX IF NOT EXISTS "botlog_status_idx" ON "BotLog"("status");

-- Atualizar políticas de segurança
DROP POLICY IF EXISTS "Users can view logs of own bots" ON "BotLog";
DROP POLICY IF EXISTS "Users can create logs for own bots" ON "BotLog";

CREATE POLICY "Users can view logs of own bots" ON "BotLog"
  FOR SELECT USING (
    auth.uid()::text = "userId" OR
    EXISTS (
      SELECT 1 FROM "Bots"
      WHERE "Bots".id = "BotLog"."botId"
      AND "Bots"."userId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can create logs for own bots" ON "BotLog"
  FOR INSERT WITH CHECK (
    auth.uid()::text = "userId" OR
    EXISTS (
      SELECT 1 FROM "Bots"
      WHERE "Bots".id = "BotLog"."botId"
      AND "Bots"."userId" = auth.uid()::text
    )
  );

-- Forçar atualização do cache do schema
NOTIFY pgrst, 'reload schema'; 