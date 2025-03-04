import '@testing-library/jest-dom';

// Configurações de ambiente para testes
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      JWT_SECRET: string;
      VITE_API_URL: string;
      MAX_BOTS_FREE: string;
      MAX_BOTS_PRO: string;
      MAX_BOTS_ENTERPRISE: string;
      MAX_BOTS_UNLIMITED: string;
      MAX_ORDERS_FREE: string;
      MAX_ORDERS_PRO: string;
      MAX_ORDERS_ENTERPRISE: string;
      MAX_ORDERS_UNLIMITED: string;
    }
  }
}

// Configurações de ambiente
process.env.JWT_SECRET = 'test-secret';
process.env.VITE_API_URL = 'http://localhost:3000';

// Limites dos planos
process.env.MAX_BOTS_FREE = '1';
process.env.MAX_BOTS_PRO = '5';
process.env.MAX_BOTS_ENTERPRISE = '20';
process.env.MAX_BOTS_UNLIMITED = '999999';
process.env.MAX_ORDERS_FREE = '60';
process.env.MAX_ORDERS_PRO = '300';
process.env.MAX_ORDERS_ENTERPRISE = '600';
process.env.MAX_ORDERS_UNLIMITED = '999999';

export {}; 