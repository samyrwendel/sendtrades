import '@testing-library/jest-dom';

// Mock das variáveis de ambiente
process.env.JWT_SECRET = 'test-secret';
process.env.VITE_API_URL = 'http://localhost:3000';
process.env.MAX_BOTS_FREE = '1';
process.env.MAX_BOTS_PRO = '5';
process.env.MAX_BOTS_ENTERPRISE = '20';
process.env.MAX_ORDERS_FREE = '60';
process.env.MAX_ORDERS_PRO = '300';
process.env.MAX_ORDERS_ENTERPRISE = '600'; 