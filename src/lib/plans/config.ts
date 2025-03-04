export interface PlanFeature {
  name: string;
  description: string;
  included: boolean;
}

export interface Plan {
  id: 'free' | 'pro' | 'enterprise' | 'unlimited';
  name: string;
  description: string;
  price: number;
  maxBots: number;
  maxOrdersPerMinute: number;
  features: PlanFeature[];
}

export const PLANS: Record<Plan['id'], Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Perfeito para começar',
    price: 0,
    maxBots: 1,
    maxOrdersPerMinute: 60,
    features: [
      {
        name: 'Criação de Bots',
        description: 'Crie até 1 bot de trading',
        included: true
      },
      {
        name: 'Webhooks',
        description: 'Integração com TradingView',
        included: true
      },
      {
        name: 'Suporte Básico',
        description: 'Suporte via email',
        included: true
      },
      {
        name: 'Notificações Avançadas',
        description: 'Telegram e Email',
        included: false
      }
    ]
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'Para traders ativos',
    price: 29.99,
    maxBots: 5,
    maxOrdersPerMinute: 300,
    features: [
      {
        name: 'Criação de Bots',
        description: 'Crie até 5 bots de trading',
        included: true
      },
      {
        name: 'Webhooks',
        description: 'Integração com TradingView',
        included: true
      },
      {
        name: 'Suporte Prioritário',
        description: 'Suporte via email e chat',
        included: true
      },
      {
        name: 'Notificações Avançadas',
        description: 'Telegram e Email',
        included: true
      }
    ]
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Para profissionais e instituições',
    price: 99.99,
    maxBots: 20,
    maxOrdersPerMinute: 600,
    features: [
      {
        name: 'Criação de Bots',
        description: 'Crie até 20 bots de trading',
        included: true
      },
      {
        name: 'Webhooks',
        description: 'Integração com TradingView',
        included: true
      },
      {
        name: 'Suporte VIP',
        description: 'Suporte 24/7 via email, chat e telefone',
        included: true
      },
      {
        name: 'Notificações Avançadas',
        description: 'Telegram, Email e Webhooks personalizados',
        included: true
      }
    ]
  },
  unlimited: {
    id: 'unlimited',
    name: 'Unlimited',
    description: 'Sem limites, controle total',
    price: 299.99,
    maxBots: Infinity,
    maxOrdersPerMinute: Infinity,
    features: [
      {
        name: 'Criação de Bots',
        description: 'Bots ilimitados',
        included: true
      },
      {
        name: 'Webhooks',
        description: 'Integração ilimitada com TradingView e APIs personalizadas',
        included: true
      },
      {
        name: 'Suporte Dedicado',
        description: 'Gerente de conta dedicado 24/7',
        included: true
      },
      {
        name: 'Notificações Avançadas',
        description: 'Todas as integrações + Webhooks personalizados',
        included: true
      },
      {
        name: 'API Personalizada',
        description: 'Acesso à API completa com rate limits personalizados',
        included: true
      },
      {
        name: 'Infraestrutura Dedicada',
        description: 'Servidor dedicado para maior performance',
        included: true
      },
      {
        name: 'Backup Avançado',
        description: 'Backup em tempo real e recuperação instantânea',
        included: true
      },
      {
        name: 'Análise Avançada',
        description: 'Dashboard personalizado e relatórios detalhados',
        included: true
      }
    ]
  }
};

export function getPlan(planId: Plan['id']): Plan {
  return PLANS[planId];
}

export function checkPlanLimit(plan: Plan, type: 'bots' | 'orders', current: number): boolean {
  if (plan.id === 'unlimited') return true;

  switch (type) {
    case 'bots':
      return current < plan.maxBots;
    case 'orders':
      return current < plan.maxOrdersPerMinute;
    default:
      return false;
  }
} 