-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own bots" ON "bots";
DROP POLICY IF EXISTS "Users can create bots" ON "bots";
DROP POLICY IF EXISTS "Users can update own bots" ON "bots";
DROP POLICY IF EXISTS "Users can delete own bots" ON "bots";

-- Create new policies with updated table name
CREATE POLICY "Users can view own bots" ON "Bots"
  FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can create bots" ON "Bots"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own bots" ON "Bots"
  FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own bots" ON "Bots"
  FOR DELETE USING (auth.uid()::text = "userId");

-- Update BotLog policies
DROP POLICY IF EXISTS "Users can view logs of own bots" ON "BotLog";
DROP POLICY IF EXISTS "Users can create logs for own bots" ON "BotLog";

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

-- Update Order policies
DROP POLICY IF EXISTS "Users can view orders of own bots" ON "Order";
DROP POLICY IF EXISTS "Users can create orders for own bots" ON "Order";

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