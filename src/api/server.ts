import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import botsRouter from './routes/bots';
import authRoutes from './routes/authRoutes';
import { CacheService } from '../lib/cache/service';
import { authMiddleware } from './middleware/auth';
import { createClient } from '@supabase/supabase-js';
import webhookRoutes from './routes/webhookRoutes';
import { logger } from '../config/logger';
import logRoutes from './routes/logRoutes';
import { initializeServices } from '../lib/services';
import pricesRoutes from './routes/pricesRoutes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');

// Carregar variáveis de ambiente
dotenv.config({ path: envPath });

// Log das variáveis de ambiente
console.log('📁 Arquivo .env:', envPath);
console.log('🔑 Variáveis de ambiente carregadas:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '[CONFIGURADO]' : '[NÃO CONFIGURADO]');
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? '[CONFIGURADO]' : '[NÃO CONFIGURADO]');
console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '[CONFIGURADO]' : '[NÃO CONFIGURADO]');

const app = express();
const port = process.env.PORT || 3001;

// Inicializar cliente Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente do Supabase não configuradas');
  console.error('SUPABASE_URL:', supabaseUrl);
  console.error('SUPABASE_KEY:', supabaseKey ? '[CONFIGURADO]' : '[NÃO CONFIGURADO]');
  console.error('SUPABASE_SERVICE_KEY:', supabaseServiceKey ? '[CONFIGURADO]' : '[NÃO CONFIGURADO]');
  process.exit(1);
}

// Cliente público (para autenticação)
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce'
  }
});

// Cliente admin (para operações privilegiadas)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Inicializar cache com memória
const cacheService = CacheService.getInstance({
  defaultTTL: parseInt(process.env.CACHE_TTL || '300'),
  provider: 'memory'
});

// Configuração do CORS
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://192.168.1.16:5173',
    'http://192.168.1.16:3000',
    'https://192.168.1.16:5173',
    'https://192.168.1.16:3000',
    // Permitir qualquer IP da rede local
    /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/,
    /^https:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-webhook-secret',
    'x-api-key'
  ],
  exposedHeaders: [
    'Content-Range',
    'X-Content-Range'
  ]
};

// Modificar a configuração do CORS para aceitar expressões regulares
app.use(cors({
  ...corsOptions,
  origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    const isAllowed = corsOptions.origin.some(allowedOrigin => {
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return allowedOrigin === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('❌ Origem bloqueada pelo CORS:', origin);
      callback(new Error('Não permitido pelo CORS'));
    }
  }
}));

// Configuração de segurança
app.use(helmet({
  contentSecurityPolicy: false, // Desabilitado em desenvolvimento
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: false
}));

// Middleware para processar JSON com limite aumentado
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Middleware para logging detalhado
const loggingMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const start = Date.now();
  
  // Log da requisição
  console.log('\n🔍 Nova Requisição:');
  console.log(`📥 ${req.method} ${req.url}`);
  console.log('📋 Headers:', JSON.stringify(req.headers, null, 2));
  if (req.method !== 'GET') {
    console.log('📦 Body:', JSON.stringify(req.body, null, 2));
  }
  console.log('❓ Query:', JSON.stringify(req.query, null, 2));
  console.log('🌐 IP:', req.ip);

  // Intercepta a resposta para logar
  const oldSend = res.send;
  res.send = function(data: any) {
    const duration = Date.now() - start;
    console.log(`\n✉️ Resposta (${duration}ms):`);
    console.log('📤 Status:', res.statusCode);
    console.log('📋 Headers:', JSON.stringify(res.getHeaders(), null, 2));
    try {
      console.log('📦 Body:', typeof data === 'string' ? JSON.parse(data) : data);
    } catch (e) {
      console.log('📦 Body:', data);
    }
    return oldSend.call(res, data);
  };

  next();
};

app.use(loggingMiddleware);

// Rotas de autenticação (sem autenticação)
app.use('/api/auth', authRoutes);

// Rotas protegidas
app.use('/api/bots', authMiddleware as express.RequestHandler, botsRouter);
app.use('/api/prices', authMiddleware as express.RequestHandler, pricesRoutes);

// Rotas de webhook
app.use('/api/webhook', webhookRoutes);

// Registrar rotas
app.use('/api', logRoutes);

// Rota de teste com mais logs
app.get('/api/test', (req: express.Request, res: express.Response) => {
    console.log('📥 Requisição recebida em /api/test');
    console.log('Headers:', req.headers);
    console.log('IP:', req.ip);
    res.json({ message: 'API está funcionando!' });
    console.log('📤 Resposta enviada');
});

// Middleware de erro
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error('Erro não tratado:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

// Modificando o listener para aceitar conexões de qualquer IP
const serverPort = typeof port === 'string' ? parseInt(port) : port;

const server = app.listen(serverPort, '0.0.0.0', () => {
  console.log('\n🚀 Servidor iniciado:');
  console.log(`📡 URL: http://localhost:${serverPort}`);
  console.log(`📡 URL (rede): http://0.0.0.0:${serverPort}`);
  console.log('⚙️ Configurações:');
  console.log('- CORS:', JSON.stringify(corsOptions, null, 2));
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('- Supabase URL:', process.env.SUPABASE_URL);
  console.log('- Porta:', serverPort);
  console.log('- Endereço:', server.address());

  // Inicializar serviços
  initializeServices();
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('\n💥 Erro não capturado:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n💥 Promise rejeitada não tratada:', {
    reason,
    promise,
    timestamp: new Date().toISOString()
  });
});

export default app; 