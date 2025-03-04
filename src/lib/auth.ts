import { z } from 'zod';
import axios from 'axios';

// Função para obter o URL da API
function getApiUrl() {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) {
    // Se não houver URL configurada, usar o mesmo host que o frontend
    const protocol = window.location.protocol;
    const host = window.location.hostname;
    const port = '3000'; // Porta padrão do backend
    return `${protocol}//${host}:${port}`;
  }
  return apiUrl;
}

const API_URL = getApiUrl();

// Interface para o payload do token
interface TokenPayload {
  id: string;
  email: string;
  name: string;
  plan: string;
  exp: number;
  iat: number;
}

export async function login(email: string, password: string) {
  try {
    console.log('🔄 Iniciando processo de login no auth.ts');
    console.log('📍 API URL:', API_URL);
    
    // Validar dados
    const schema = z.object({
      email: z.string().email('Email inválido'),
      password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    });

    const validatedData = schema.parse({ email, password });
    console.log('✅ Dados validados:', { email: validatedData.email });

    // Fazer requisição de login
    console.log('🔄 Enviando requisição para:', `${API_URL}/api/auth/login`);
    const response = await axios.post(`${API_URL}/api/auth/login`, validatedData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📦 Resposta recebida:', {
      status: response.status,
      success: response.data.success,
      hasToken: !!response.data.token,
      user: response.data.user
    });

    if (!response.data.success || !response.data.token) {
      console.error('❌ Login falhou:', response.data);
      throw new Error(response.data.message || 'Erro ao fazer login');
    }

    // Validar token antes de salvar
    const token = response.data.token;
    console.log('🔄 Validando token recebido...');
    const isValidToken = await validateToken(token);
    
    if (!isValidToken) {
      console.error('❌ Token inválido recebido do servidor');
      throw new Error('Token inválido recebido do servidor');
    }

    // Salvar token
    localStorage.setItem('session', token);
    console.log('✅ Token salvo no localStorage');

    return token;
  } catch (error) {
    console.error('❌ Erro detalhado:', error);

    if (error instanceof z.ZodError) {
      console.error('❌ Erro de validação:', error.errors);
      throw new Error('Dados de login inválidos');
    }

    if (axios.isAxiosError(error)) {
      console.error('❌ Erro da API:', {
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });

      if (error.response?.status === 401) {
        throw new Error('Email ou senha incorretos');
      }

      if (error.response?.status === 404) {
        throw new Error('Servidor não encontrado');
      }

      if (error.response?.status === 500) {
        throw new Error('Erro interno do servidor');
      }

      throw new Error(error.response?.data?.message || 'Erro ao fazer login');
    }

    throw error;
  }
}

async function validateToken(token: string): Promise<boolean> {
  try {
    console.log('🔄 Validando token...');
    const response = await axios.post(`${API_URL}/api/auth/verify`, null, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('✅ Resposta da validação:', response.data);
    return response.data.success === true;
  } catch (error) {
    console.error('❌ Erro ao validar token:', error);
    return false;
  }
}

export function getSessionData(): TokenPayload | null {
  try {
    const token = localStorage.getItem('session');
    if (!token) {
      console.log('❌ Nenhum token encontrado no localStorage');
      return null;
    }

    // Verificar formato do token
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('❌ Token inválido: formato incorreto');
      localStorage.removeItem('session');
      return null;
    }

    // Decodificar payload
    const payload = JSON.parse(atob(parts[1])) as TokenPayload;
    console.log('✅ Token decodificado:', {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      plan: payload.plan,
      exp: new Date(payload.exp * 1000).toLocaleString()
    });

    // Verificar expiração
    const exp = payload.exp * 1000;
    if (Date.now() >= exp) {
      console.error('❌ Token expirado');
      localStorage.removeItem('session');
      return null;
    }

    return payload;
  } catch (error) {
    console.error('❌ Erro ao verificar sessão:', error);
    localStorage.removeItem('session');
    return null;
  }
}

export function logout() {
  try {
    localStorage.removeItem('session');
    console.log('✅ Sessão encerrada com sucesso');
    window.location.href = '/login';
  } catch (error) {
    console.error('❌ Erro ao fazer logout:', error);
  }
}