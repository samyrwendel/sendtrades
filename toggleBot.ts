import axios, { AxiosError } from 'axios';

interface Bot {
  id: string;
  name: string;
  status: string;
}

interface ApiResponse {
  bots?: Bot[];
  success?: boolean;
  message?: string;
  error?: string;
}

interface ToggleResponse {
  success: boolean;
  message: string;
  bot?: Bot;
}

const API_URL = 'http://localhost:3000';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU3MzIyNTBjLTAwMjYtNGEzZS05ZDFjLWVmOGUzMzcxODUxYiIsImVtYWlsIjoiYWRtaW5AYWRtaW4uY29tIiwibmFtZSI6IkFkbWluaXN0cmFkb3IiLCJwbGFuIjoidW5saW1pdGVkIiwiaWF0IjoxNzM5MjQ1MjMxLCJleHAiOjE3MzkzMzE2MzF9.aWfkO6am8wlXy__FELca7kMv68YuNtK6ThPMwbgXWCc';

async function toggleBot(): Promise<void> {
  try {
    // Primeiro, vamos buscar os bots
    const response = await axios.get<ApiResponse>(`${API_URL}/api/bots`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.bots && response.data.bots.length > 0) {
      for (const bot of response.data.bots) {
        console.log(`\n🔄 Alternando status do bot ${bot.name} (${bot.id})...`);
        
        // Alternando o status do bot
        const toggleResponse = await axios.post<ToggleResponse>(
          `${API_URL}/api/bots/${bot.id}/toggle`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        console.log('✅ Status alterado:', toggleResponse.data);
      }
    } else {
      console.log('❌ Nenhum bot encontrado');
    }

  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      console.error('❌ Erro:', error.response.status, error.response.data);
      if (error.response.data.error) {
        console.error('Detalhes do erro:', error.response.data.error);
      }
    } else {
      console.error('❌ Erro:', error instanceof Error ? error.message : 'Erro desconhecido');
    }
  }
}

toggleBot(); 