-- Primeiro, desabilitar as restrições de chave estrangeira
SET session_replication_role = 'replica';

-- Limpar todas as tabelas relacionadas
TRUNCATE TABLE "BotLog" CASCADE;
TRUNCATE TABLE "Order" CASCADE;
TRUNCATE TABLE "Bot" CASCADE;

-- Reabilitar as restrições de chave estrangeira
SET session_replication_role = 'origin'; 