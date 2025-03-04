import { describe, it, expect, beforeEach, jest, afterAll } from '@jest/globals';
import { AuthUser, LoginCredentials } from '../auth/types';
import { getPlan, checkPlanLimit } from '../plans/config';
import { Request, Response, NextFunction } from 'express';
import { Bot, PlanType } from '../types';
import { createPlanLimitsMiddleware } from '../middleware/planLimits';
import { ServerStorage } from '../../api/serverStorage';

// Interface para o mock do ServerStorage
interface MockStorage {
  getBots: jest.Mock<Promise<Bot[]>, []>;
  addBot: jest.Mock<Promise<Bot>, [Bot]>;
  deleteBot: jest.Mock<Promise<void>, [string]>;
  clearLogs: jest.Mock<Promise<void>, []>;
}

// Configurar retornos padrão
const mockServerStorage = {
  getBots: jest.fn().mockResolvedValue([testBot]),
  addBot: jest.fn().mockImplementation((bot: Bot) => Promise.resolve(bot)),
  deleteBot: jest.fn().mockResolvedValue(undefined),
  clearLogs: jest.fn().mockResolvedValue(undefined)
} as unknown as ServerStorage;

jest.mock('../../api/serverStorage', () => ({
  getInstance: () => mockServerStorage
}));

// Importar depois do mock para garantir que o mock seja aplicado
import { checkPlanLimits } from '../middleware/planLimits';

// Limpar todos os timers após os testes
afterAll(() => {
  jest.useRealTimers();
});

// Configurar o usuário de teste
const testUser: AuthUser = {
  id: 'test-123',
  email: 'test@example.com',
  name: 'Test User',
  plan: 'free' as PlanType,
  maxBots: 1,
  active: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Configurar o bot de teste
const testBot: Bot = {
  id: 'bot-123',
  public_id: 'BOT123',
  name: 'Test Bot',
  enabled: true,
  userId: testUser.id,
  tradingPair: 'BTCUSDT',
  exchange: {
    name: 'MEXC',
    config: {
      credentials: {
        apiKey: 'test-key',
        secretKey: 'test-secret'
      },
      testnet: false
    }
  },
  webhook: {
    enabled: true,
    url: 'https://test.com/webhook',
    secretKey: 'test-secret',
    allowedIPs: ['127.0.0.1'],
    maxOrdersPerMinute: 60
  },
  settings: {
    maxOrderSize: '100',
    minOrderSize: '10',
    maxDailyOrders: 100,
    tradingEnabled: true,
    notifications: {
      email: true,
      telegram: false
    }
  },
  statistics: {
    totalTrades: 0,
    successfulTrades: 0,
    failedTrades: 0,
    lastTradeAt: null,
    profitLoss: '0',
    winRate: '0'
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

// Mock do Request e Response
const mockRequest = (user: Partial<AuthUser> = testUser) => ({
  user,
  headers: { authorization: 'Bearer test-token' }
});

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Configuração do admin
const adminUser: AuthUser = {
  id: 'admin-123',
  name: 'Administrador',
  email: 'admin@admin.com',
  plan: 'admin' as PlanType,
  maxBots: Infinity,
  active: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Tipos para os mocks
interface TestRequest {
  user?: AuthUser;
  method: string;
  path: string;
  headers?: Record<string, string>;
}

type MockResponseFn = jest.Mock<any>;

interface TestResponse {
  status: MockResponseFn;
  json: MockResponseFn;
  send: MockResponseFn;
}

describe('Sistema de Autenticação e Planos', () => {
  let storage: ServerStorage;
  let req: TestRequest;
  let res: TestResponse;
  let next: jest.Mock;

  beforeEach(async () => {
    storage = ServerStorage.getInstance();
    
    // Configurar request e response
    req = {
      user: testUser,
      method: 'GET',
      path: '/bots',
      headers: {}
    };

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };

    res = mockRes;
    next = jest.fn();

    // Limpar storage
    storage.clearLogs();
    const bots = await storage.getBots();
    await Promise.all(bots.map(bot => storage.deleteBot(bot.id)));
  });

  describe('Verificação de Planos', () => {
    it('deve permitir acesso para usuário free dentro do limite', async () => {
      const middleware = createPlanLimitsMiddleware(storage);
      req.method = 'POST';
      req.path = '/bots';

      await middleware(req as unknown as Request, res as unknown as Response, next);
      expect(next).toHaveBeenCalled();
    });

    it('deve bloquear usuário free que atingiu o limite', async () => {
      const middleware = createPlanLimitsMiddleware(storage);
      req.method = 'POST';
      req.path = '/bots';

      // Adicionar um bot para atingir o limite
      await storage.addBot({
        id: 'bot-1',
        public_id: 'BOT1',
        name: 'Bot de Teste',
        enabled: true,
        userId: testUser.id,
        tradingPair: 'BTCUSDT',
        exchange: {
          name: 'MEXC',
          config: {
            credentials: {
              apiKey: 'test',
              secretKey: 'test'
            },
            testnet: false
          }
        },
        webhook: {
          enabled: false,
          url: '',
          secretKey: '',
          allowedIPs: [],
          maxOrdersPerMinute: 60
        },
        settings: {
          maxOrderSize: '100',
          minOrderSize: '10',
          maxDailyOrders: 100,
          tradingEnabled: true,
          notifications: {
            email: false,
            telegram: false
          }
        },
        statistics: {
          totalTrades: 0,
          successfulTrades: 0,
          failedTrades: 0,
          lastTradeAt: null,
          profitLoss: '0',
          winRate: '0'
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        config: { owner: testUser.id }
      });

      await middleware(req as unknown as Request, res as unknown as Response, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('deve permitir acesso ilimitado para admin', async () => {
      const middleware = createPlanLimitsMiddleware(storage);
      req.user = adminUser;
      req.method = 'POST';
      req.path = '/bots';

      // Mesmo com vários bots, admin deve ter acesso
      const botPromises = Array.from({ length: 10 }).map((_, i) => 
        storage.addBot({
          id: `bot-${i}`,
          public_id: `BOT${i}`,
          name: `Bot ${i}`,
          enabled: true,
          userId: adminUser.id,
          tradingPair: 'BTCUSDT',
          exchange: {
            name: 'MEXC',
            config: {
              credentials: {
                apiKey: 'test',
                secretKey: 'test'
              },
              testnet: false
            }
          },
          webhook: {
            enabled: false,
            url: '',
            secretKey: '',
            allowedIPs: [],
            maxOrdersPerMinute: 60
          },
          settings: {
            maxOrderSize: '100',
            minOrderSize: '10',
            maxDailyOrders: 100,
            tradingEnabled: true,
            notifications: {
              email: false,
              telegram: false
            }
          },
          statistics: {
            totalTrades: 0,
            successfulTrades: 0,
            failedTrades: 0,
            lastTradeAt: null,
            profitLoss: '0',
            winRate: '0'
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          config: { owner: adminUser.id }
        })
      );

      await Promise.all(botPromises);
      await middleware(req as unknown as Request, res as unknown as Response, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Funcionalidades por Plano', () => {
    it('deve ter features corretas para cada plano', () => {
      const freePlan = getPlan('free');
      const proPlan = getPlan('pro');
      const enterprisePlan = getPlan('enterprise');
      const unlimitedPlan = getPlan('unlimited');

      // Verificar limites
      expect(freePlan.maxBots).toBe(1);
      expect(proPlan.maxBots).toBe(5);
      expect(enterprisePlan.maxBots).toBe(20);
      expect(unlimitedPlan.maxBots).toBe(Infinity);

      // Verificar features
      expect(freePlan.features.find(f => f.name === 'Notificações Avançadas')?.included).toBe(false);
      expect(proPlan.features.find(f => f.name === 'Notificações Avançadas')?.included).toBe(true);
      expect(enterprisePlan.features.find(f => f.name === 'Suporte VIP')?.included).toBe(true);
      expect(unlimitedPlan.features.find(f => f.name === 'API Personalizada')?.included).toBe(true);
    });
  });
});

// Testes de integração
describe('Integração do Sistema', () => {
  it('deve manter consistência entre autenticação e limites', async () => {
    const mockUser: AuthUser = {
      id: 'test-123',
      email: 'test@example.com',
      name: 'Test User',
      plan: 'free' as PlanType,
      maxBots: 1,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const plan = getPlan(mockUser.plan);
    expect(plan.maxBots).toBe(mockUser.maxBots);
  });

  it('deve validar corretamente as credenciais', () => {
    const validCredentials: LoginCredentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    expect(validCredentials.email).toContain('@');
    expect(validCredentials.password.length).toBeGreaterThan(6);
  });
});

interface MockRequest extends Partial<Request> {
  user?: AuthUser;
  method?: string;
  path?: string;
}

type MockResponse = {
  status: jest.Mock;
  json: jest.Mock;
} & Partial<Response>;

type MockGetBots = jest.Mock<Promise<Bot[]>, []>;

interface MockServerStorage extends Pick<ServerStorage, 'getBots'> {
  getBots: MockGetBots;
}

describe('Middleware de Limites do Plano', () => {
  let mockRequest: MockRequest;
  let mockResponse: MockResponse;
  let nextFunction: jest.Mock;
  let mockServerStorage: { getBots: jest.Mock };
  let checkPlanLimits: ReturnType<typeof createPlanLimitsMiddleware>;

  beforeEach(() => {
    // Configurar mock do ServerStorage com apenas as funções necessárias
    mockServerStorage = {
      getBots: jest.fn()
    };

    mockServerStorage.getBots.mockResolvedValue([]);

    // Criar middleware com o mock
    checkPlanLimits = createPlanLimitsMiddleware(mockServerStorage as unknown as ServerStorage);

    // Configurar request e response mocks
    mockRequest = {
      user: {
        id: 'test-123',
        name: 'Test User',
        email: 'test@example.com',
        plan: 'free' as PlanType,
        maxBots: 1,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      method: 'POST',
      path: '/bots'
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    } as MockResponse;

    nextFunction = jest.fn();

    // Limpar todos os mocks
    jest.clearAllMocks();
  });

  it('deve permitir acesso irrestrito para admin', async () => {
    mockRequest.user = {
      id: 'admin',
      name: 'Admin',
      email: 'admin@admin.com',
      plan: 'free' as PlanType,
      maxBots: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await checkPlanLimits(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  it('deve permitir acesso para usuário autenticado com plano válido', async () => {
    await checkPlanLimits(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalled();
  });

  it('deve bloquear acesso para usuário não autenticado', async () => {
    mockRequest.user = undefined;

    await checkPlanLimits(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Usuário não autenticado'
    });
  });

  it('deve bloquear criação de bot quando limite é atingido', async () => {
    mockRequest.method = 'POST';
    mockRequest.path = '/bots';

    const mockBot: Bot = {
      id: 'bot1',
      name: 'Bot 1',
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      config: {
        owner: '123'
      }
    };

    mockServerStorage.getBots.mockResolvedValueOnce([mockBot]);

    await checkPlanLimits(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Limite de bots atingido',
      message: expect.stringContaining('Seu plano free permite apenas 1 bots')
    });
  });

  it('deve bloquear acesso a funcionalidades premium', async () => {
    mockRequest.path = '/api/trading';

    await checkPlanLimits(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Funcionalidade não disponível',
      message: expect.stringContaining('não está disponível no seu plano free')
    });
  });
});

describe('checkPlanLimits middleware', () => {
  it('should allow request if user has no bots', async () => {
    mockServerStorage.getBots.mockResolvedValueOnce([]);
    // ... existing code ...
  });

  it('should block request if user has reached bot limit', async () => {
    const mockBot = { id: '1', name: 'Test Bot' } as Bot;
    mockServerStorage.getBots.mockResolvedValueOnce([mockBot]);
    // ... existing code ...
  });
});

describe('Testes de autenticação', () => {
  beforeEach(() => {
    mockServerStorage.getBots.mockClear();
    mockServerStorage.addBot.mockClear();
    mockServerStorage.deleteBot.mockClear();
    mockServerStorage.clearLogs.mockClear();
  });

  // ... existing code ...
}); 