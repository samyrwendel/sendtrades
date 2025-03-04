import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';

// Carregar variáveis de ambiente
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_KEY || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

console.log('URL:', SUPABASE_URL);

async function dropPrismaMigrationsTable() {
  try {
    // Cliente com chave de serviço para operações administrativas
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Remover a tabela _prisma_migrations
    console.log('🔄 Removendo tabela _prisma_migrations...');
    const { error: dropError } = await supabaseAdmin
      .from('_prisma_migrations')
      .delete()
      .neq('id', 0); // Remove todos os registros

    if (dropError) {
      console.log('❌ Erro ao remover registros da tabela _prisma_migrations:', dropError);
      
      // Tentar remover a tabela diretamente via SQL
      const { error: sqlError } = await supabaseAdmin.rpc('exec_sql', {
        sql_query: 'DROP TABLE IF EXISTS public._prisma_migrations CASCADE;'
      });

      if (sqlError) {
        console.log('❌ Erro ao remover tabela _prisma_migrations via SQL:', sqlError);
      } else {
        console.log('✅ Tabela _prisma_migrations removida com sucesso via SQL!');
      }
    } else {
      console.log('✅ Registros da tabela _prisma_migrations removidos com sucesso!');
    }

  } catch (error) {
    console.error('❌ Erro ao remover tabela:', error);
  }
}

async function dropUsersTable() {
  try {
    // Cliente com chave de serviço para operações administrativas
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Remover a tabela users
    console.log('🔄 Removendo tabela users...');
    const { error: dropError } = await supabaseAdmin
      .from('users')
      .delete()
      .neq('id', 0); // Remove todos os registros

    if (dropError) {
      console.log('❌ Erro ao remover registros da tabela users:', dropError);
      
      // Tentar remover a tabela diretamente via SQL
      const { error: sqlError } = await supabaseAdmin.rpc('exec_sql', {
        sql_query: 'DROP TABLE IF EXISTS public.users CASCADE;'
      });

      if (sqlError) {
        console.log('❌ Erro ao remover tabela users via SQL:', sqlError);
      } else {
        console.log('✅ Tabela users removida com sucesso via SQL!');
      }
    } else {
      console.log('✅ Registros da tabela users removidos com sucesso!');
    }

  } catch (error) {
    console.error('❌ Erro ao remover tabela:', error);
  }
}

async function main() {
  // Primeiro remover as tabelas desnecessárias
  await dropPrismaMigrationsTable();
  await dropUsersTable();

  try {
    // Cliente com chave anônima para operações do usuário
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Tentar fazer login
    console.log('🔄 Tentando fazer login como usuário normal...');
    const { data: loginResponse, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'ip@ipmais.com',
      password: 'senha123456'
    });

    if (loginError) {
      console.log('❌ Erro ao fazer login:', loginError);
      return;
    }

    console.log('✅ Login realizado com sucesso!');
    console.log('Detalhes da sessão:', JSON.stringify(loginResponse, null, 2));

    // Hash da senha para a tabela User
    const hashedPassword = await bcryptjs.hash('senha123456', 10);

    // Inserir dados do usuário na tabela User
    console.log('🔄 Inserindo dados do usuário na tabela User...');
    const { error: insertError } = await supabase
      .from('User')
      .upsert({
        id: loginResponse.user.id,
        email: loginResponse.user.email,
        password: hashedPassword,
        name: loginResponse.user.user_metadata.name,
        plan: loginResponse.user.user_metadata.plan,
        active: loginResponse.user.user_metadata.active,
        createdAt: loginResponse.user.created_at,
        updatedAt: loginResponse.user.updated_at
      }, {
        onConflict: 'id'
      });

    if (insertError) {
      console.log('❌ Erro ao inserir dados do usuário:', insertError);
    } else {
      console.log('✅ Dados do usuário inseridos com sucesso!');
    }

    // Buscar dados do usuário
    console.log('🔄 Buscando dados do usuário...');
    const { data: userData, error: userError } = await supabase
      .from('User')
      .select('*')
      .eq('id', loginResponse.user.id)
      .single();

    if (userError) {
      console.log('❌ Erro ao buscar dados do usuário:', userError);
    } else {
      console.log('✅ Dados do usuário:', userData);
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

main(); 