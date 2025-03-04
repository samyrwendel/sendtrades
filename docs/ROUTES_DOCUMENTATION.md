# Documentação de Rotas do TradingBot

## 1. Rotas Principais

### Página Inicial (/)
- Redireciona para `/overview` se autenticado
- Redireciona para `/login` se não autenticado

### Overview (/overview)
- Dashboard principal do sistema
- Exibe todos os bots ativos
- Mostra estatísticas e gráficos
- Requer autenticação

### Login (/login)
- Página de autenticação
- Formulário de login
- Redirecionamento automático após sucesso

### Novo Bot (/new-bot)
- Criação de novo bot
- Formulário completo de configuração
- Validação de credenciais
- Requer autenticação

### Edição de Bot (/edit-bot/:id)
- Edição de bot existente
- Carrega configurações atuais
- Permite modificação de parâmetros
- Requer autenticação

## 2. Botões e Ações

### Navegação Principal
- Overview: Navega para `/overview`
- Novo Bot: Navega para `/new-bot`
- Configurações: Abre modal de configurações
- Logout: Encerra sessão e redireciona para `/login`

### Ações de Bot
- Editar: Navega para `/edit-bot/:id`
- Pausar/Ativar: Atualiza status do bot
- Excluir: Remove bot após confirmação

### Botões de Formulário
- Salvar: Persiste alterações
- Cancelar: Retorna à página anterior
- Validar API: Testa credenciais
- Copiar Webhook: Copia URL para clipboard

## 3. Proteção de Rotas

### Middleware de Autenticação
- Verifica token JWT
- Redireciona para login se inválido
- Atualiza token se necessário

### Níveis de Acesso
- Público: `/login`
- Autenticado: Todas as outras rotas
- Admin: Rotas administrativas (se existirem)

## 4. Comportamentos de Navegação

### Redirecionamentos
- Após login: `/overview`
- Após logout: `/login`
- Após criar bot: `/overview`
- Após excluir bot: `/overview`

### Preservação de Estado
- Mantém filtros ao navegar
- Preserva formulários não enviados
- Restaura última página após login

## 5. URLs de API

### Endpoints de Bot
- GET `/api/bots`: Lista todos os bots
- POST `/api/bots`: Cria novo bot
- GET `/api/bots/:id`: Obtém bot específico
- PUT `/api/bots/:id`: Atualiza bot
- DELETE `/api/bots/:id`: Remove bot

### Endpoints de Autenticação
- POST `/api/auth/login`: Login
- POST `/api/auth/logout`: Logout
- POST `/api/auth/refresh`: Atualiza token

### Endpoints de Trading
- GET `/api/trading/pairs`: Lista pares disponíveis
- GET `/api/trading/balance`: Consulta saldo
- POST `/api/trading/order`: Executa ordem

### Endpoints de Webhook
- POST `/api/webhook/:botId`: Recebe sinais
- GET `/api/webhook/logs/:botId`: Histórico

## 6. Tratamento de Erros

### Páginas de Erro
- 404: Página não encontrada
- 403: Acesso negado
- 500: Erro interno

### Feedback Visual
- Loading states durante navegação
- Mensagens de erro em formulários
- Toasts para ações assíncronas

## 7. Navegação Mobile

### Menu Inferior
- Ícones principais
- Indicador de página atual
- Acesso rápido a funções

### Gestos
- Swipe para voltar
- Pull to refresh
- Scroll infinito onde aplicável 