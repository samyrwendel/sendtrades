import { Request, Response } from 'express';
import { mexcExchange } from '../../lib/exchanges/mexc';
import { logger } from '../../config/logger';

export class PricesController {
  static async getPrices(req: Request, res: Response) {
    try {
      const { tokens } = req.body;

      if (!Array.isArray(tokens)) {
        return res.status(400).json({ error: 'O campo tokens deve ser um array' });
      }

      const prices: Record<string, string> = {};
      const errors: Record<string, string> = {};

      // Busca preços para cada token
      await Promise.all(tokens.map(async (token) => {
        try {
          // Tenta primeiro com par USDT
          try {
            const price = await mexcExchange.getCurrentPrice(`${token}USDT`);
            prices[token] = price;
            return;
          } catch (error) {
            // Se falhar com USDT, tenta com USDC
            try {
              const price = await mexcExchange.getCurrentPrice(`${token}USDC`);
              prices[token] = price;
              return;
            } catch (secondError) {
              throw new Error('Não foi possível obter o preço com USDT nem USDC');
            }
          }
        } catch (error) {
          logger.error(`Erro ao buscar preço para ${token}:`, error);
          errors[token] = error instanceof Error ? error.message : 'Erro desconhecido';
        }
      }));

      // Retorna os preços encontrados e erros
      return res.json({
        prices,
        errors: Object.keys(errors).length > 0 ? errors : undefined
      });

    } catch (error) {
      logger.error('Erro ao buscar preços:', error);
      return res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
} 