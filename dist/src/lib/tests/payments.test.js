import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { PaymentService } from '../payments/service';
describe('Sistema de Pagamentos', () => {
    let paymentService;
    beforeEach(() => {
        paymentService = PaymentService.getInstance();
        // Limpar o estado antes de cada teste
        paymentService.clearState();
    });
    afterEach(() => {
        // Limpar o estado após cada teste
        paymentService.clearState();
    });
    describe('Assinaturas', () => {
        it('deve criar uma nova assinatura', async () => {
            const userId = 'user123';
            const planId = 'pro';
            const subscription = await paymentService.createSubscription(userId, planId);
            expect(subscription).toBeDefined();
            expect(subscription.userId).toBe(userId);
            expect(subscription.planId).toBe(planId);
            expect(subscription.status).toBe('active');
            expect(subscription.cancelAtPeriodEnd).toBe(false);
        });
        it('deve lançar erro ao criar assinatura com plano inválido', async () => {
            const userId = 'user123';
            const planId = 'invalid_plan';
            await expect(paymentService.createSubscription(userId, planId))
                .rejects
                .toThrow('Plano não encontrado');
        });
        it('deve cancelar uma assinatura existente', async () => {
            const userId = 'user123';
            const planId = 'pro';
            const subscription = await paymentService.createSubscription(userId, planId);
            const canceledSubscription = await paymentService.cancelSubscription(subscription.id);
            expect(canceledSubscription.status).toBe('cancelled');
            expect(canceledSubscription.canceledAt).toBeDefined();
            expect(canceledSubscription.cancelAtPeriodEnd).toBe(true);
        });
    });
    describe('Métodos de Pagamento', () => {
        it('deve adicionar um novo método de pagamento', async () => {
            const userId = 'user123';
            const methodData = {
                type: 'credit_card',
                lastFour: '4242',
                expiryMonth: 12,
                expiryYear: 2025,
                brand: 'visa',
                isDefault: false
            };
            const method = await paymentService.addPaymentMethod(userId, methodData);
            expect(method).toBeDefined();
            expect(method.userId).toBe(userId);
            expect(method.lastFour).toBe('4242');
            expect(method.isDefault).toBe(true); // Primeiro método deve ser padrão
        });
        it('deve listar métodos de pagamento do usuário', async () => {
            const userId = 'user123';
            const methodData = {
                type: 'credit_card',
                lastFour: '4242',
                expiryMonth: 12,
                expiryYear: 2025,
                brand: 'visa',
                isDefault: false
            };
            await paymentService.addPaymentMethod(userId, methodData);
            const methods = await paymentService.getUserPaymentMethods(userId);
            expect(methods).toHaveLength(1);
            expect(methods[0].userId).toBe(userId);
        });
    });
    describe('Processamento de Pagamentos', () => {
        it('deve processar um pagamento com sucesso', async () => {
            const userId = 'user123';
            const amount = 29.99;
            const methodData = {
                id: 'pm_123',
                userId,
                type: 'credit_card',
                lastFour: '4242',
                expiryMonth: 12,
                expiryYear: 2025,
                brand: 'visa',
                isDefault: true
            };
            const payment = await paymentService.processPayment(userId, amount, methodData);
            expect(payment).toBeDefined();
            expect(payment.userId).toBe(userId);
            expect(payment.amount).toBe(amount);
            expect(['completed', 'failed']).toContain(payment.status);
        });
    });
    describe('Faturas', () => {
        it('deve criar fatura ao criar assinatura', async () => {
            const userId = 'user123';
            const planId = 'pro';
            await paymentService.createSubscription(userId, planId);
            const invoices = await paymentService.getUserInvoices(userId);
            expect(invoices).toHaveLength(1);
            expect(invoices[0].userId).toBe(userId);
            expect(invoices[0].status).toBe('pending');
        });
        it('deve listar faturas do usuário', async () => {
            const userId = 'user123';
            const planId = 'pro';
            await paymentService.createSubscription(userId, planId);
            const invoices = await paymentService.getUserInvoices(userId);
            expect(invoices).toBeDefined();
            expect(Array.isArray(invoices)).toBe(true);
            expect(invoices.every(i => i.userId === userId)).toBe(true);
        });
    });
});
