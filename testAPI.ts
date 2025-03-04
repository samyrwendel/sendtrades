import axios, { AxiosError, AxiosResponse } from 'axios';

interface Bot {
  id: string;
  name: string;
  enabled: boolean;
  userId: string;
  tradingPair: string;
  exchange: Record<string, unknown>;
  webhook: Record<string, unknown>;
  settings: Record<string, unknown>;
  statistics: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  bots: Bot[];
}

const API_URL = 'http://localhost:3000';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU3MzIyNTBjLTAwMjYtNGEzZS05ZDFjLWVmOGUzMzcxODUxYiIsImVtYWlsIjoiYWRtaW5AYWRtaW4uY29tIiwibmFtZSI6IkFkbWluaXN0cmFkb3IiLCJwbGFuIjoidW5saW1pdGVkIiwiaWF0IjoxNzM5MjQ1MjMxLCJleHAiOjE3MzkzMzE2MzF9.aWfkO6am8wlXy__FELca7kMv68YuNtK6ThPMwbgXWCc';

async function testAPI(): Promise<void> {
  try {
    console.log('🔄 Testando API...');
    
    // Teste 1: GET /api/bots
    console.log('\n🔍 GET /api/bots');
    const response: AxiosResponse<ApiResponse> = await axios.get(API_URL + '/api/bots', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📊 Status:', response.status);
    console.log('📦 Dados:', JSON.stringify(response.data, null, 2));
    
    // Teste 2: GET /api/bots/active
    console.log('\n🔍 GET /api/bots/active');
    const activeResponse: AxiosResponse<ApiResponse> = await axios.get(API_URL + '/api/bots/active', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📊 Status:', activeResponse.status);
    console.log('📦 Dados:', JSON.stringify(activeResponse.data, null, 2));

  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      console.error('❌ Erro da API:', {
        status: error.response.status,
        data: error.response.data
      });
    } else {
      console.error('❌ Erro:', error instanceof Error ? error.message : String(error));
    }
  }
}

testAPI(); 