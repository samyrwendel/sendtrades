# TradingBot 🤖📈

Sistema automatizado de trading em criptomoedas com interface web moderna e integrações com exchanges populares.

## 🚀 Funcionalidades

- ✅ Criação e gerenciamento de bots de trading
- ✅ Integração com MEXC e KuCoin (em breve)
- ✅ Recebimento de sinais via webhook
- ✅ Interface web moderna e responsiva
- ✅ Autenticação segura
- ✅ Monitoramento em tempo real
- ✅ Logs detalhados de operações

## 🛠️ Tecnologias

- **Frontend**: React + TypeScript
- **Backend**: Node.js + Express
- **Banco**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Comunicação**: WebSocket + REST API
- **Monitoramento**: Sentry + Grafana

## 📦 Instalação

1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/tradingbot.git
cd tradingbot
```

2. Instale as dependências
```bash
npm install
```

3. Configure as variáveis de ambiente
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

## 🔧 Configuração

### Variáveis de Ambiente

```env
# App
NODE_ENV=development
PORT=3000

# Database
SUPABASE_URL=sua-url-supabase
SUPABASE_KEY=sua-chave-supabase

# Security
JWT_SECRET=sua-chave-secreta
ENCRYPTION_KEY=sua-chave-encriptacao

# Monitoring
SENTRY_DSN=seu-dsn-sentry
```

### Configuração de Exchange

1. Crie uma conta na exchange desejada (MEXC ou KuCoin)
2. Gere uma API Key com permissões de trading
3. Configure as credenciais no bot através da interface

## 📚 Documentação

- [Arquitetura](docs/ARCHITECTURE.md)
- [Exchanges](docs/EXCHANGES.md)
- [Webhook](docs/WEBHOOK.md)
- [API](docs/API.md)

## 🔒 Segurança

- Autenticação JWT
- Criptografia de credenciais
- Rate limiting
- Validação de IPs
- Sanitização de inputs
- Proteção contra XSS

## 📊 Monitoramento

- Logs de sistema
- Métricas de performance
- Alertas de erro
- Dashboard de status
- Histórico de operações

## 🚀 Deploy

### Desenvolvimento
```bash
# Instalação
npm install

# Desenvolvimento
npm run dev

# Testes
npm run test

# Build
npm run build
```

### Produção
```bash
# Build da imagem
docker build -t tradingbot .

# Execução
docker-compose up -d

# Logs
docker-compose logs -f
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📧 Suporte

Para suporte, envie um email para [seu-email@exemplo.com](mailto:seu-email@exemplo.com) ou abra uma issue no GitHub.

## 🌟 Agradecimentos

- [React](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [Supabase](https://supabase.io/)
- [MEXC](https://www.mexc.com/)
- [KuCoin](https://www.kucoin.com/)

## 📈 Status do Projeto

- ✅ Versão: 1.0.0
- 🚧 Em desenvolvimento ativo
- 📅 Última atualização: Fevereiro 2024

## 🗺️ Roadmap

### Q1 2025
- [x] MVP com suporte a MEXC
- [x] Sistema de webhook
- [x] Interface básica
- [x] Autenticação

### Q2 2025
- [ ] Suporte a KuCoin
- [ ] Backtest de estratégias
- [ ] Notificações
- [ ] Dashboard avançado

### Q3 2025
- [ ] Suporte a mais exchanges
- [ ] Estratégias avançadas
- [ ] Interface mobile
- [ ] Análise de performance

### Q4 2025
- [ ] Machine learning
- [ ] Social trading
- [ ] API pública
- [ ] Marketplace de estratégias 
