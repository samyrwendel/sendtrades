import axios, { AxiosError, AxiosResponse } from 'axios';

interface UserData {
  name: string;
  email: string;
  password: string;
  plan: string;
}

interface CreateUserResponse {
  success: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    plan: string;
  };
}

const API_URL = 'http://192.168.1.33:3000/api';

async function createUser(): Promise<void> {
  try {
    const userData: UserData = {
      name: 'Administrador',
      email: 'admin@admin.com',
      password: 'admin123',
      plan: 'unlimited'
    };

    const response: AxiosResponse<CreateUserResponse> = await axios.post(`${API_URL}/auth/register`, userData);
    console.log('✅ Usuário criado com sucesso:', response.data);
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      console.error('❌ Erro ao criar usuário:', error.response.data);
    } else {
      console.error('❌ Erro ao criar usuário:', error instanceof Error ? error.message : String(error));
    }
    throw error;
  }
}

createUser(); 