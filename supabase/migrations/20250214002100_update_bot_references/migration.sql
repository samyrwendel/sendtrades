-- Drop foreign key constraints
ALTER TABLE "BotLog" DROP CONSTRAINT IF EXISTS "BotLog_botId_fkey";
ALTER TABLE "Order" DROP CONSTRAINT IF EXISTS "Order_botId_fkey";

-- Drop indexes
DROP INDEX IF EXISTS "bots_userId_idx";

-- Rename table
ALTER TABLE IF EXISTS "bots" RENAME TO "Bots";

-- Recreate indexes with new table name
CREATE INDEX IF NOT EXISTS "Bots_userId_idx" ON "Bots"("userId");

-- Add foreign key constraints back with new table name
ALTER TABLE "BotLog" ADD CONSTRAINT "BotLog_botId_fkey" 
  FOREIGN KEY ("botId") REFERENCES "Bots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Order" ADD CONSTRAINT "Order_botId_fkey" 
  FOREIGN KEY ("botId") REFERENCES "Bots"("id") ON DELETE RESTRICT ON UPDATE CASCADE; 