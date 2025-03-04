import { getExchange } from './exchanges';
export class ExchangeService {
    constructor(exchangeName) {
        const exchange = getExchange(exchangeName);
        if (!exchange) {
            throw new Error(`Exchange ${exchangeName} não encontrada`);
        }
        this.exchange = exchange;
    }
    async validateCredentials(credentials) {
        return this.exchange.validateCredentials(credentials);
    }
    async getBalances(credentials) {
        return this.exchange.getBalances(credentials);
    }
    async executeTrade(credentials, params) {
        return this.exchange.executeTrade(credentials, params);
    }
    getName() {
        return this.exchange.name;
    }
    getLogo() {
        return this.exchange.logo;
    }
}
