import { supabaseAdmin } from '../../lib/supabase';
export class LogController {
    // Listar logs
    async getLogs(req, res) {
        try {
            const { data: logs, error } = await supabaseAdmin
                .from('BotLog')
                .select(`
          *,
          bot:botId (
            name,
            public_id
          )
        `)
                .order('timestamp', { ascending: false })
                .limit(100);
            if (error) {
                console.error('❌ Erro ao buscar logs:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Erro ao buscar logs'
                });
            }
            return res.json({
                success: true,
                logs
            });
        }
        catch (error) {
            console.error('❌ Erro ao buscar logs:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno ao buscar logs'
            });
        }
    }
    // Limpar logs
    async clearLogs(req, res) {
        try {
            const { error } = await supabaseAdmin
                .from('BotLog')
                .delete()
                .neq('id', '0'); // Delete all logs
            if (error) {
                console.error('❌ Erro ao limpar logs:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Erro ao limpar logs'
                });
            }
            return res.json({
                success: true,
                message: 'Logs limpos com sucesso'
            });
        }
        catch (error) {
            console.error('❌ Erro ao limpar logs:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno ao limpar logs'
            });
        }
    }
}
