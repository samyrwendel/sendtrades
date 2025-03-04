import { getPlan } from '../plans/config';
import { v4 as uuidv4 } from 'uuid';
export class PaymentService {
    constructor() {
        this.subscriptions = new Map();
        this.paymentIntents = new Map();
        this.paymentMethods = new Map();
        this.invoices = new Map();
        this.clearState();
    }
    static getInstance() {
        if (!PaymentService.instance) {
            PaymentService.instance = new PaymentService();
        }
        return PaymentService.instance;
    }
    // Limpar estado do serviço (útil para testes)
    clearState() {
        this.subscriptions = new Map();
        this.paymentIntents = new Map();
        this.paymentMethods = new Map();
        this.invoices = new Map();
    }
    // Criar uma nova assinatura
    async createSubscription(userId, planId) {
        const plan = getPlan(planId);
        if (!plan) {
            throw new Error('Plano não encontrado');
        }
        const subscription = {
            id: uuidv4(),
            userId,
            planId,
            status: 'active',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
            cancelAtPeriodEnd: false,
            metadata: {}
        };
        this.subscriptions.set(subscription.id, subscription);
        // Criar fatura inicial
        await this.createInvoice(subscription);
        return subscription;
    }
    // Criar uma nova fatura
    async createInvoice(subscription) {
        const plan = getPlan(subscription.planId);
        if (!plan) {
            throw new Error('Plano não encontrado');
        }
        const invoice = {
            id: uuidv4(),
            userId: subscription.userId,
            subscriptionId: subscription.id,
            amount: plan.price,
            currency: 'BRL',
            status: 'pending',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
            items: [
                {
                    description: `Assinatura ${plan.name}`,
                    amount: plan.price,
                    quantity: 1
                }
            ]
        };
        this.invoices.set(invoice.id, invoice);
        return invoice;
    }
    // Processar pagamento
    async processPayment(userId, amount, method) {
        const paymentIntent = {
            id: uuidv4(),
            userId,
            planId: '', // Será preenchido ao vincular com a assinatura
            amount,
            currency: 'BRL',
            status: 'pending',
            method: method.type,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        try {
            // Simular processamento de pagamento
            const success = Math.random() > 0.1; // 90% de chance de sucesso
            if (success) {
                paymentIntent.status = 'completed';
            }
            else {
                paymentIntent.status = 'failed';
            }
            paymentIntent.updatedAt = new Date();
            this.paymentIntents.set(paymentIntent.id, paymentIntent);
            return paymentIntent;
        }
        catch (error) {
            paymentIntent.status = 'failed';
            paymentIntent.updatedAt = new Date();
            this.paymentIntents.set(paymentIntent.id, paymentIntent);
            throw error;
        }
    }
    // Cancelar assinatura
    async cancelSubscription(subscriptionId) {
        const subscription = this.subscriptions.get(subscriptionId);
        if (!subscription) {
            throw new Error('Assinatura não encontrada');
        }
        subscription.status = 'cancelled';
        subscription.canceledAt = new Date();
        subscription.cancelAtPeriodEnd = true;
        this.subscriptions.set(subscriptionId, subscription);
        return subscription;
    }
    // Obter assinatura ativa do usuário
    async getUserSubscription(userId) {
        for (const subscription of this.subscriptions.values()) {
            if (subscription.userId === userId && subscription.status === 'active') {
                return subscription;
            }
        }
        return null;
    }
    // Obter faturas do usuário
    async getUserInvoices(userId) {
        const userInvoices = [];
        for (const invoice of this.invoices.values()) {
            if (invoice.userId === userId) {
                userInvoices.push(invoice);
            }
        }
        return userInvoices;
    }
    // Adicionar método de pagamento
    async addPaymentMethod(userId, method) {
        const paymentMethod = {
            id: uuidv4(),
            userId,
            ...method
        };
        // Se for o primeiro método, definir como padrão
        const userMethods = Array.from(this.paymentMethods.values())
            .filter(m => m.userId === userId);
        if (userMethods.length === 0) {
            paymentMethod.isDefault = true;
        }
        this.paymentMethods.set(paymentMethod.id, paymentMethod);
        return paymentMethod;
    }
    // Obter métodos de pagamento do usuário
    async getUserPaymentMethods(userId) {
        const methods = [];
        for (const method of this.paymentMethods.values()) {
            if (method.userId === userId) {
                methods.push(method);
            }
        }
        return methods;
    }
}
