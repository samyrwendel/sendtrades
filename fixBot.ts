import axios, { AxiosError } from 'axios';

interface ExchangeConfig {
  name: string;
  config: Record<string, unknown>;
}

interface Bot {
  id: string;
  name: string;
  enabled: boolean;
  tradingPair: string;
  exchange: ExchangeConfig;
}

interface UpdatedBotData {
  name: string;
  enabled: boolean;
  tradingPair: string;
  exchange: ExchangeConfig;
}

interface ApiResponse {
  bots: Bot[];
}

const API_URL = 'http://localhost:3000';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU3MzIyNTBjLTAwMjYtNGEzZS05ZDFjLWVmOGUzMzcxODUxYiIsImVtYWlsIjoiYWRtaW5AYWRtaW4uY29tIiwibmFtZSI6IkFkbWluaXN0cmFkb3IiLCJwbGFuIjoidW5saW1pdGVkIiwiaWF0IjoxNzM5MjQ1MjMxLCJleHAiOjE3MzkzMzE2MzF9.aWfkO6am8wlXy__FELca7kMv68YuNtK6ThPMwbgXWCc';

async function fixBot(): Promise<void> {
  try {
    // Primeiro, vamos buscar o bot
    const response = await axios.get<ApiResponse>(API_URL + '/api/bots', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.bots && response.data.bots.length > 0) {
      const bot = response.data.bots[0]; // Pegando o primeiro bot

      // Dados atualizados do bot (baseado no schema do Prisma)
      const updatedBotData: UpdatedBotData = {
        name: bot.name,
        enabled: true,
        tradingPair: 'XRPUSDT',
        exchange: {
          name: 'MEXC',
          config: {}
        }
      };

      console.log('🔄 Atualizando bot...');
      console.log('ID do bot:', bot.id);
      console.log('Dados atualizados:', JSON.stringify(updatedBotData, null, 2));

      // Atualizando o bot
      const updateResponse = await axios.put(
        `${API_URL}/api/bots/${bot.id}`,
        updatedBotData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('✅ Bot atualizado com sucesso:', updateResponse.data);

    } else {
      console.log('❌ Nenhum bot encontrado para atualizar');
    }

  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      console.error('❌ Erro:', error.response.status, error.response.data);
      if (error.response.data.error) {
        console.error('Detalhes do erro:', error.response.data.error);
      }
    } else {
      console.error('❌ Erro:', error instanceof Error ? error.message : String(error));
    }
  }
}

fixBot(); 