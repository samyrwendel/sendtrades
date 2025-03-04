import { PaymentIntent, Subscription, Invoice, PaymentMethodInfo } from './types';
import { Plan, getPlan } from '../plans/config';
import { v4 as uuidv4 } from 'uuid';

export class PaymentService {
  private static instance: PaymentService;
  private subscriptions: Map<string, Subscription> = new Map();
  private paymentIntents: Map<string, PaymentIntent> = new Map();
  private paymentMethods: Map<string, PaymentMethodInfo> = new Map();
  private invoices: Map<string, Invoice> = new Map();

  private constructor() {
    this.clearState();
  }

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  // Limpar estado do serviço (útil para testes)
  public clearState(): void {
    this.subscriptions = new Map();
    this.paymentIntents = new Map();
    this.paymentMethods = new Map();
    this.invoices = new Map();
  }

  // Criar uma nova assinatura
  public async createSubscription(userId: string, planId: string): Promise<Subscription> {
    const plan = getPlan(planId as Plan['id']);
    if (!plan) {
      throw new Error('Plano não encontrado');
    }

    const subscription: Subscription = {
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
  private async createInvoice(subscription: Subscription): Promise<Invoice> {
    const plan = getPlan(subscription.planId as Plan['id']);
    if (!plan) {
      throw new Error('Plano não encontrado');
    }

    const invoice: Invoice = {
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
  public async processPayment(
    userId: string, 
    amount: number, 
    method: PaymentMethodInfo
  ): Promise<PaymentIntent> {
    const paymentIntent: PaymentIntent = {
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
      } else {
        paymentIntent.status = 'failed';
      }

      paymentIntent.updatedAt = new Date();
      this.paymentIntents.set(paymentIntent.id, paymentIntent);

      return paymentIntent;
    } catch (error) {
      paymentIntent.status = 'failed';
      paymentIntent.updatedAt = new Date();
      this.paymentIntents.set(paymentIntent.id, paymentIntent);
      throw error;
    }
  }

  // Cancelar assinatura
  public async cancelSubscription(subscriptionId: string): Promise<Subscription> {
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
  public async getUserSubscription(userId: string): Promise<Subscription | null> {
    for (const subscription of this.subscriptions.values()) {
      if (subscription.userId === userId && subscription.status === 'active') {
        return subscription;
      }
    }
    return null;
  }

  // Obter faturas do usuário
  public async getUserInvoices(userId: string): Promise<Invoice[]> {
    const userInvoices: Invoice[] = [];
    for (const invoice of this.invoices.values()) {
      if (invoice.userId === userId) {
        userInvoices.push(invoice);
      }
    }
    return userInvoices;
  }

  // Adicionar método de pagamento
  public async addPaymentMethod(
    userId: string,
    method: Omit<PaymentMethodInfo, 'id' | 'userId'>
  ): Promise<PaymentMethodInfo> {
    const paymentMethod: PaymentMethodInfo = {
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
  public async getUserPaymentMethods(userId: string): Promise<PaymentMethodInfo[]> {
    const methods: PaymentMethodInfo[] = [];
    for (const method of this.paymentMethods.values()) {
      if (method.userId === userId) {
        methods.push(method);
      }
    }
    return methods;
  }
} 