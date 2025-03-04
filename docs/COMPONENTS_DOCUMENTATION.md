# Documentação de Componentes do TradingBot

## 1. Componentes de Layout

### Layout.tsx
- Componente wrapper principal
- Gerencia a estrutura básica da aplicação
- Integra a navegação com o conteúdo
- Responsável pelo layout responsivo

### Navigation.tsx
- Gerencia navegação desktop e mobile
- Funcionalidades:
  - Alternância de tema (claro/escuro)
  - Troca de idioma (PT-BR/EN)
  - Menu colapsável na versão desktop
  - Menu inferior na versão mobile
  - Logout do sistema

## 2. Componentes de Bot

### BotCard.tsx
- Exibe informações do bot em formato de card
- Funcionalidades:
  - Exibição de status (ativo/inativo)
  - Controles de ação (editar/pausar/excluir)
  - Exibição de credenciais mascaradas
  - Informações de trading
  - Confirmação de exclusão via modal
- Estados:
  - Loading durante ações
  - Feedback visual de ações
  - Tratamento de erros

### WebhookExamples.tsx
- Exibe exemplos de webhooks para integração
- Funcionalidades:
  - Exemplos de JSON para compra/venda
  - Botões de cópia com feedback
  - Formatação syntax-highlighted
- Personalização:
  - Adaptação ao par de trading
  - Inclusão do public_id do bot

### CopyButton.tsx
- Botão reutilizável para cópia
- Funcionalidades:
  - Cópia para clipboard
  - Feedback visual (ícone)
  - Toast de confirmação
  - Tratamento de erros
- Estados:
  - Normal (ícone de cópia)
  - Copiado (ícone de check)
  - Erro (toast vermelho)

## 3. Componentes de Formulário

### SimplePairSelector.tsx
- Seletor de pares de trading
- Funcionalidades:
  - Filtragem por Quote Asset
  - Ordenação automática
  - Manutenção do par inicial
  - Formatação Base/Quote
- Estados:
  - Loading
  - Selecionado
  - Vazio

### EditBot.tsx
- Formulário de edição de bot
- Funcionalidades:
  - Edição de configurações
  - Validação de campos
  - Carregamento de pares
  - Preview de webhook
- Campos:
  - Nome do bot
  - Par de trading
  - Configurações de ordem
  - Webhooks
  - Notificações

## 4. Componentes de Feedback

### Toast Notifications
- Sistema de notificações
- Tipos:
  - Sucesso (verde neon)
  - Erro (vermelho)
  - Info (azul)
  - Warning (amarelo)
- Características:
  - Auto-dismiss
  - Animações suaves
  - Fundo translúcido
  - Efeito blur

### AlertDialog
- Diálogos de confirmação
- Usos:
  - Exclusão de bot
  - Ações irreversíveis
  - Avisos importantes
- Características:
  - Overlay com blur
  - Botões de ação
  - Escape key para fechar
  - Foco gerenciado

## 5. Páginas Principais

### Overview.tsx
- Dashboard principal
- Funcionalidades:
  - Resumo de bots
  - Estatísticas gerais
  - Gráficos de performance
  - Saldos de ativos
- Atualizações:
  - Polling automático
  - Websocket (quando disponível)
  - Cache de dados

### NewBots.tsx
- Criação de novos bots
- Funcionalidades:
  - Formulário de criação
  - Validação de API
  - Seleção de exchange
  - Configurações iniciais
- Validações:
  - Credenciais da API
  - Limites do plano
  - Formato dos dados

## 6. Serviços e Utilidades

### tokenService.ts
- Gerenciamento de tokens
- Funcionalidades:
  - Cache de ícones
  - Atualização dinâmica
  - Fallback para ícones locais

### mexcService.ts
- Integração com MEXC
- Funcionalidades:
  - Validação de credenciais
  - Busca de pares
  - Execução de ordens
  - Consulta de saldos

## 7. Hooks Personalizados

### useAuth
- Gerenciamento de autenticação
- Funcionalidades:
  - Login/Logout
  - Refresh token
  - Verificação de sessão
  - Persistência de dados

### useTheme
- Gerenciamento de tema
- Funcionalidades:
  - Alternância claro/escuro
  - Persistência de preferência
  - Sincronização com sistema

## 8. Contextos

### LanguageContext
- Internacionalização
- Funcionalidades:
  - Troca de idiomas
  - Traduções
  - Formatação de números/datas

### ThemeContext
- Tema da aplicação
- Funcionalidades:
  - Tema global
  - Variáveis CSS
  - Classes utilitárias 