-- Função para criar a tabela users se não existir
CREATE OR REPLACE FUNCTION create_users_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verifica se a tabela já existe
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'users'
  ) THEN
    -- Cria a tabela users
    CREATE TABLE public.users (
      id UUID PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      plan TEXT,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE,
      updated_at TIMESTAMP WITH TIME ZONE
    );

    -- Adiciona as políticas de segurança RLS
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

    -- Política para permitir select apenas do próprio usuário
    CREATE POLICY users_select_policy ON public.users
      FOR SELECT
      USING (auth.uid() = id);

    -- Política para permitir update apenas do próprio usuário
    CREATE POLICY users_update_policy ON public.users
      FOR UPDATE
      USING (auth.uid() = id);

    -- Política para permitir insert apenas do próprio usuário
    CREATE POLICY users_insert_policy ON public.users
      FOR INSERT
      WITH CHECK (auth.uid() = id);

    -- Política para permitir delete apenas do próprio usuário
    CREATE POLICY users_delete_policy ON public.users
      FOR DELETE
      USING (auth.uid() = id);
  END IF;
END;
$$; 