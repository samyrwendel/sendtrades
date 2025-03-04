import axios, { AxiosError, AxiosResponse } from 'axios';
import fs from 'fs';

interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

interface TokenPayload {
  id: string;
  email: string;
  name: string;
  plan: string;
  iat: number;
  exp: number;
}

interface LogData {
  message?: string;
  code?: string;
  response?: unknown;
  preview?: string;
  length?: number;
  stack?: string;
  success?: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  id?: string;
  email?: string;
  name?: string;
  plan?: string;
  iat?: number;
  exp?: number;
}

const API_URL = 'http://localhost:3000';
const LOG_FILE = 'login_test.log';

async function log(message: string, data: LogData | null = null): Promise<void> {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  const logData = data ? `${JSON.stringify(data, null, 2)}\n` : '';
  
  console.log(message);
  if (data) console.log(data);
  
  fs.appendFileSync(LOG_FILE, logMessage + logData);
}

async function testLoginFlow(): Promise<void> {
  try {
    // 1. Testar conexão com o servidor
    log('🔄 Testando conexão com o servidor...');
    try {
      await axios.get(API_URL);
      log('✅ Servidor está respondendo');
    } catch (error) {
      if (error instanceof AxiosError) {
        log('❌ Erro ao conectar com o servidor:', {
          message: error.message,
          code: error.code
        });
      }
      return;
    }

    // 2. Tentar login com credenciais corretas
    log('🔄 Tentando login com credenciais corretas...');
    try {
      const loginResponse: AxiosResponse<LoginResponse> = await axios.post(`${API_URL}/api/auth/login`, {
        email: 'admin@admin.com',
        password: 'admin123'
      });
      
      log('✅ Resposta do login:', loginResponse.data);
      
      if (loginResponse.data.success) {
        const token = loginResponse.data.token;
        log('✅ Token recebido:', { 
          preview: token.substring(0, 20) + '...',
          length: token.length 
        });

        // 3. Testar token recebido
        log('🔄 Testando token recebido...');
        try {
          const parts = token.split('.');
          if (parts.length !== 3) {
            log('❌ Token inválido: formato incorreto');
            return;
          }

          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString()) as TokenPayload;
          log('✅ Payload do token:', payload);

          // 4. Testar autenticação com o token
          log('🔄 Testando autenticação com o token...');
          const testResponse = await axios.get(`${API_URL}/api/bots`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          log('✅ Autenticação bem-sucedida:', testResponse.data);
        } catch (error) {
          if (error instanceof Error) {
            log('❌ Erro ao testar token:', {
              message: error.message,
              response: error instanceof AxiosError ? error.response?.data : undefined
            });
          }
        }
      } else {
        log('❌ Login falhou:', loginResponse.data);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        log('❌ Erro no login:', {
          message: error.message,
          response: error.response?.data
        });
      }
    }

  } catch (error) {
    if (error instanceof Error) {
      log('❌ Erro geral:', {
        message: error.message,
        stack: error.stack
      });
    }
  }
}

// Limpar arquivo de log
fs.writeFileSync(LOG_FILE, '');

// Executar teste
log('🚀 Iniciando teste de login...\n');
testLoginFlow(); 