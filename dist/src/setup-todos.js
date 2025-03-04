import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';
// Carregar variáveis de ambiente
dotenv.config();
async function setupTodos() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Erro: Variáveis de ambiente do Supabase não configuradas');
        console.error('SUPABASE_URL:', supabaseUrl);
        console.error('SUPABASE_ANON_KEY:', supabaseKey ? '[CONFIGURADO]' : '[NÃO CONFIGURADO]');
        process.exit(1);
    }
    console.log('🔄 Iniciando setup da tabela todos...');
    console.log('URL:', supabaseUrl);
    const supabase = createClient(supabaseUrl, supabaseKey);
    try {
        // Testar a conexão primeiro
        const { data: testData, error: testError } = await supabase
            .from('todos')
            .select('*')
            .limit(1);
        if (testError) {
            console.log('⚠️ Tabela ainda não existe, vamos criá-la...');
        }
        else {
            console.log('✅ Conexão com Supabase estabelecida!');
            console.log('📋 Dados existentes:', testData);
        }
        // Ler o arquivo SQL
        const sqlPath = join(process.cwd(), 'supabase', 'todos.sql');
        const sqlContent = readFileSync(sqlPath, 'utf8');
        // Executar cada comando SQL separadamente
        const commands = sqlContent.split(';').filter(cmd => cmd.trim());
        for (const command of commands) {
            const { error } = await supabase.rpc('exec_sql', {
                sql_query: command.trim() + ';'
            });
            if (error) {
                console.error('❌ Erro ao executar comando SQL:', error);
                console.error('Comando:', command.trim());
            }
        }
        // Testar a consulta dos dados
        const { data: todos, error: selectError } = await supabase
            .from('todos')
            .select('*');
        if (selectError) {
            console.error('❌ Erro ao consultar dados:', selectError);
            return;
        }
        console.log('\n📋 Dados na tabela:');
        console.table(todos);
    }
    catch (error) {
        console.error('❌ Erro ao configurar tabela todos:', error);
    }
}
setupTodos();
