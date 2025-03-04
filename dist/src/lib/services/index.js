import { startOrderProcessor } from './orderProcessor';
import { logger } from '../utils/logger';
export function initializeServices() {
    try {
        logger.info('🚀 Iniciando serviços...');
        // Iniciar processador de ordens
        startOrderProcessor();
        logger.info('✅ Processador de ordens iniciado');
        logger.info('✅ Todos os serviços iniciados com sucesso');
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        logger.error('❌ Erro ao iniciar serviços:', errorMessage);
        throw error;
    }
}
