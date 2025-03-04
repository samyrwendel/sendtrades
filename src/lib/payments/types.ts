export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
export type PaymentMethod = 'credit_card' | 'pix' | 'boleto' | 'crypto';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trial';

export interface PaymentIntent {
  id: string;
  userId: string;
  planId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  paymentIntentId?: string;
  trialEnd?: Date;
  metadata?: Record<string, any>;
}

export interface Invoice {
  id: string;
  userId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  dueDate: Date;
  paidAt?: Date;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  description: string;
  amount: number;
  quantity: number;
}

export interface PaymentMethodInfo {
  id: string;
  userId: string;
  type: PaymentMethod;
  lastFour?: string;
  expiryMonth?: number;
  expiryYear?: number;
  brand?: string;
  isDefault: boolean;
} 