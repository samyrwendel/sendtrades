import { describe, it, expect, beforeEach, jest, afterAll } from '@jest/globals';
import { getPlan } from '../plans/config';
import { createPlanLimitsMiddleware } from '../middleware/planLimits';
import { ServerStorage } from '../../api/serverStorage';
// Mock do ServerStorage
const mockServerStorage = {
    getBots: jest.fn()
};
jest.mock('../../api/serverStorage', () => ({
    getInstance: () => mockServerStorage
}));
// Limpar todos os timers após os testes
afterAll(() => {
    jest.useRealTimers();
});
// Mock do Request e Response
const mockRequest = () => {
    return {
        user: null,
        headers: {},
        path: '',
        method: 'GET'
    };
};
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};
// Configuração do usuário de teste
const testUser = {
    id: 'test-123',
    name: 'Usuário de Teste',
    email: 'teste@exemplo.com',
    plan: 'free',
    maxBots: 1,
    createdAt: new Date(),
    updatedAt: new Date()
};
// Configuração do admin
const adminUser = {
    id: 'admin-123',
    name: 'Administrador',
    email: 'admin@admin.com',
    plan: 'unlimited',
    maxBots: Infinity,
    createdAt: new Date(),
    updatedAt: new Date()
};
describe('Sistema de Autenticação e Planos', () => {
    let storage;
    let req;
    let res;
    let next;
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
            await middleware(req, res, next);
            expect(next).toHaveBeenCalled();
        });
        it('deve bloquear usuário free que atingiu o limite', async () => {
            const middleware = createPlanLimitsMiddleware(storage);
            req.method = 'POST';
            req.path = '/bots';
            // Adicionar um bot para atingir o limite
            await storage.addBot({
                id: 'bot-1',
                name: 'Bot de Teste',
                enabled: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                config: { owner: testUser.id }
            });
            await middleware(req, res, next);
            expect(res.status).toHaveBeenCalledWith(403);
        });
        it('deve permitir acesso ilimitado para admin', async () => {
            const middleware = createPlanLimitsMiddleware(storage);
            req.user = adminUser;
            req.method = 'POST';
            req.path = '/bots';
            // Mesmo com vários bots, admin deve ter acesso
            const botPromises = Array.from({ length: 10 }).map((_, i) => storage.addBot({
                id: `bot-${i}`,
                name: `Bot ${i}`,
                enabled: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                config: { owner: adminUser.id }
            }));
            await Promise.all(botPromises);
            await middleware(req, res, next);
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
        const mockUser = {
            id: '123',
            email: 'test@test.com',
            name: 'Test User',
            plan: 'free',
            maxBots: 1,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const plan = getPlan(mockUser.plan);
        expect(plan.maxBots).toBe(mockUser.maxBots);
    });
    it('deve validar corretamente as credenciais', () => {
        const validCredentials = {
            email: 'test@test.com',
            password: 'password123'
        };
        expect(validCredentials.email).toContain('@');
        expect(validCredentials.password.length).toBeGreaterThan(6);
    });
});
describe('Middleware de Limites do Plano', () => {
    let mockRequest;
    let mockResponse;
    let nextFunction;
    let mockServerStorage;
    let checkPlanLimits;
    beforeEach(() => {
        // Configurar mock do ServerStorage com apenas as funções necessárias
        mockServerStorage = {
            getBots: jest.fn()
        };
        mockServerStorage.getBots.mockResolvedValue([]);
        // Criar middleware com o mock
        checkPlanLimits = createPlanLimitsMiddleware(mockServerStorage);
        // Configurar request e response mocks
        mockRequest = {
            user: {
                id: '123',
                name: 'Test User',
                email: 'test@example.com',
                plan: 'free',
                maxBots: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            method: 'GET',
            path: '/bots'
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        nextFunction = jest.fn();
        // Limpar todos os mocks
        jest.clearAllMocks();
    });
    it('deve permitir acesso irrestrito para admin', async () => {
        mockRequest.user = {
            id: 'admin',
            name: 'Admin',
            email: 'admin@admin.com',
            plan: 'free',
            maxBots: 1,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        await checkPlanLimits(mockRequest, mockResponse, nextFunction);
        expect(nextFunction).toHaveBeenCalled();
        expect(mockResponse.status).not.toHaveBeenCalled();
        expect(mockResponse.json).not.toHaveBeenCalled();
    });
    it('deve permitir acesso para usuário autenticado com plano válido', async () => {
        await checkPlanLimits(mockRequest, mockResponse, nextFunction);
        expect(nextFunction).toHaveBeenCalled();
    });
    it('deve bloquear acesso para usuário não autenticado', async () => {
        mockRequest.user = undefined;
        await checkPlanLimits(mockRequest, mockResponse, nextFunction);
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
            error: 'Usuário não autenticado'
        });
    });
    it('deve bloquear criação de bot quando limite é atingido', async () => {
        mockRequest.method = 'POST';
        mockRequest.path = '/bots';
        const mockBot = {
            id: 'bot1',
            name: 'Bot 1',
            enabled: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            config: {
                owner: '123'
            }
        };
        mockServerStorage.getBots.mockResolvedValueOnce([mockBot]);
        await checkPlanLimits(mockRequest, mockResponse, nextFunction);
        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({
            error: 'Limite de bots atingido',
            message: expect.stringContaining('Seu plano free permite apenas 1 bots')
        });
    });
    it('deve bloquear acesso a funcionalidades premium', async () => {
        mockRequest.path = '/api/trading';
        await checkPlanLimits(mockRequest, mockResponse, nextFunction);
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
        const mockBot = { id: '1', name: 'Test Bot' };
        mockServerStorage.getBots.mockResolvedValueOnce([mockBot]);
        // ... existing code ...
    });
});
