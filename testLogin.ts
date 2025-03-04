import axios, { AxiosError } from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
  plan: string;
}

interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

const API_URL = 'http://192.168.1.33:3000';

async function testLogin(): Promise<string | null> {
  try {
    console.log('🔄 Testando login...');
    
    const response = await axios.post<LoginResponse>(`${API_URL}/api/auth/login`, {
      email: 'admin@admin.com',
      password: 'admin123'
    });

    if (response.data.success) {
      console.log('✅ Login realizado com sucesso!');
      console.log('🔑 Token:', response.data.token);
      console.log('👤 Usuário:', JSON.stringify(response.data.user, null, 2));
      return response.data.token;
    } else {
      console.error('❌ Erro no login:', response.data.message);
      return null;
    }
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data) {
      console.error('❌ Erro ao fazer login:', error.response.data.message);
    } else {
      console.error('❌ Erro ao fazer login:', error instanceof Error ? error.message : String(error));
    }
    return null;
  }
}

testLogin(); 