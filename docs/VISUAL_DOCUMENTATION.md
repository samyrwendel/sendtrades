# Documentação Visual do TradingBot

## 1. Layout Base
- Tema escuro por padrão com opção de alternar para tema claro
- Fundo principal: dark:bg-gray-900 (escuro) / bg-white (claro)
- Estrutura dividida em sidebar (desktop) e navegação inferior (mobile)

## 2. Navegação (Navigation.tsx)
### Desktop Sidebar
- Largura: 64 pixels (colapsada) / 256 pixels (expandida)
- Fundo: bg-white dark:bg-[#020817]
- Borda direita: border-r border-gray-200 dark:border-gray-700
- Logo: Ícone Bot em indigo-600 dark:indigo-400
- Botão de colapso: Posicionado à direita da sidebar

### Links de Navegação
- Estado normal: text-gray-600 dark:text-gray-300
- Estado hover: bg-gray-50 dark:bg-[#1e293b]
- Estado ativo: bg-indigo-50 text-indigo-600 dark:bg-[#1e293b] dark:text-indigo-100
- Ícones: h-5 w-5 com cor correspondente ao texto

### Mobile Navigation
- Fixada na parte inferior: fixed bottom-0
- Altura: h-16
- Fundo: bg-white dark:bg-[#020817]
- Borda superior: border-t border-gray-200 dark:border-gray-700
- Ícones: h-6 w-6 com texto abaixo

## 3. Cards de Bot (BotCard.tsx)
### Container
- Fundo: bg-white dark:bg-[#020817]
- Borda: border-gray-100 dark:border-indigo-800/30
- Sombra hover: hover:shadow-md
- Padding: p-3
- Cantos arredondados (implícito no Card component)

### Cabeçalho do Card
- Nome do Bot: text-base text-gray-900 dark:text-indigo-100
- Badge de Status:
  - Ativo: bg-emerald-100 text-emerald-700 dark:bg-[#020817] dark:text-emerald-400
  - Pausado: bg-amber-100 text-amber-700 dark:bg-[#020817] dark:text-amber-400

### Informações de API
- Fonte: font-mono
- Tamanho: text-xs
- Cor: text-gray-500 dark:text-indigo-300/70

### Botões de Ação
- Tamanho: h-7 w-7
- Editar: text-indigo-600 dark:text-indigo-400
- Pausar/Ativar: text-amber-600/text-emerald-600
- Excluir: text-red-600 dark:text-red-400

### Informações de Trading
- Grid de 2 colunas
- Texto label: text-xs font-medium text-muted-foreground
- Valor: text-sm font-semibold dark:text-gray-100

## 4. Mensagens Toast
### Container
- Fundo: bg-black/60 (60% opaco)
- Backdrop blur: backdrop-blur-sm
- Borda: border-[#4ade80] (verde neon)
- Sombra: shadow-[0_0_10px_rgba(74,222,128,0.3)]
- Posição: top-right

### Variantes
- Sucesso:
  - Texto: text-[#4ade80] (verde neon)
  - Borda: border-[#4ade80]
- Erro:
  - Texto: text-red-400
  - Borda: border-red-500

## 5. Overview Page
### Cabeçalho
- Título: text-2xl font-bold
- Subtítulo: text-gray-600 dark:text-gray-400

### Cards de Estatísticas
- Grid responsivo
- Fundo: bg-white dark:bg-[#020817]
- Borda suave
- Padding interno
- Ícones coloridos para cada estatística

### Gráficos
- Cores personalizadas para cada ativo
- Tooltips interativos
- Responsivos ao tema

## 6. Botões de Copiar (CopyButton.tsx)
### Botão
- Padding: p-2
- Cantos: rounded-md
- Hover: hover:bg-gray-100 dark:hover:bg-gray-700
- Transição suave

### Estados
- Normal: Ícone Copy em gray-500 dark:gray-400
- Copiado: Ícone Check em green-500
- Transição de 2 segundos

## 7. Formulários
### Inputs
- Fundo: bg-background
- Borda: border-input
- Texto: text-foreground
- Placeholder: text-muted-foreground
- Estados de foco e erro

### Selects
- Estilo consistente com inputs
- Dropdown com fundo escuro no tema dark
- Opções com hover states

## 8. Modais e Diálogos
### Alert Dialog
- Overlay escuro com blur
- Fundo: bg-white dark:bg-[#020817]
- Borda: border-gray-200 dark:border-gray-700
- Botões de ação com cores semânticas

## 9. Responsividade
- Breakpoints principais:
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px
  - 2xl: 1400px
- Adaptações específicas para mobile
- Layout fluido em tablets

## 10. Animações
- Transições suaves: transition-all
- Duração padrão: 200ms
- Easing: ease-in-out
- Animações específicas para:
  - Abertura/fechamento de acordeões
  - Hover states
  - Loading states
  - Toast notifications

## 11. Paleta de Cores
### Tema Claro
- Fundo principal: white
- Texto principal: gray-900
- Acentuação: indigo-600
- Bordas: gray-200

### Tema Escuro
- Fundo principal: #020817
- Texto principal: gray-100
- Acentuação: indigo-400
- Bordas: gray-700/indigo-800

### Cores Semânticas
- Sucesso: emerald-400/500
- Erro: red-400/500
- Aviso: amber-400/500
- Info: indigo-400/500

## 12. Tipografia
- Font-family: Sistema padrão
- Hierarquia:
  - Títulos: text-2xl font-bold
  - Subtítulos: text-xl font-semibold
  - Corpo: text-base
  - Small: text-sm
  - Micro: text-xs
- Font-mono para dados técnicos

## 13. Espaçamento
- Escala de 4px (0.25rem)
- Padrões comuns:
  - p-4 (1rem)
  - gap-2 (0.5rem)
  - my-8 (2rem)
  - mx-auto (centralização) 