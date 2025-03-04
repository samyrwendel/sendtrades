# Sistema de Temas do TradingBot

Este documento descreve o sistema de temas centralizado do TradingBot, que foi criado para garantir consistência visual em toda a aplicação e facilitar futuras modificações.

## Estrutura do Sistema

O sistema de temas é composto por:

1. **Variáveis de Cores** - Definidas em `src/lib/theme/colors.ts`
2. **Classes CSS Reutilizáveis** - Definidas em `src/lib/theme/colors.ts` como `themeClasses`
3. **Componentes de Layout** - Definidos em `src/components/ui/page-layout.tsx`
4. **Componentes de UI Temáticos** - Definidos em vários arquivos em `src/components/ui/`

## Como Usar

### Cores e Classes

Para usar as cores e classes do tema, importe-as do arquivo de cores:

```tsx
import { colors, themeClasses } from "../lib/theme/colors";
import { cn } from "../lib/utils";

// Usando classes do tema
<div className={themeClasses.text.primary}>Texto primário</div>

// Combinando classes do tema com outras classes
<div className={cn(themeClasses.card.base, "p-4")}>Conteúdo do card</div>
```

### Componentes de Layout

Os componentes de layout ajudam a manter uma estrutura consistente em todas as páginas:

```tsx
import { PageLayout, PageHeader, PageFilterSection, PageContent, PageSection } from "../components/ui/page-layout";

function MinhaPage() {
  return (
    <PageLayout>
      <PageHeader title="Título da Página">
        <Button variant="success">Ação Principal</Button>
      </PageHeader>
      
      <PageFilterSection>
        {/* Filtros da página */}
      </PageFilterSection>
      
      <PageContent>
        <PageSection title="Seção 1">
          {/* Conteúdo da seção 1 */}
        </PageSection>
        
        <PageSection title="Seção 2">
          {/* Conteúdo da seção 2 */}
        </PageSection>
      </PageContent>
    </PageLayout>
  );
}
```

### Componentes de UI Temáticos

Vários componentes de UI foram criados para garantir consistência:

- **SearchInput** - Input de busca com ícone
- **Table Components** - Componentes para criar tabelas estilizadas
- **ThemedCard** - Componentes para criar cards estilizados

## Categorias de Classes

### Layout

- `layout.page` - Container principal da página
- `layout.header` - Cabeçalho da página
- `layout.filters` - Seção de filtros
- `layout.filterInput` - Container para input de filtro

### Texto

- `text.primary` - Texto principal
- `text.secondary` - Texto secundário
- `text.small` - Texto pequeno

### Cabeçalhos

- `heading.h1` - Título principal
- `heading.h2` - Subtítulo
- `heading.h3` - Título de seção

### Cards

- `card.base` - Estilo base do card
- `card.header` - Cabeçalho do card
- `card.content` - Conteúdo do card

### Tabelas

- `table.base` - Estilo base da tabela
- `table.header` - Cabeçalho da tabela
- `table.headerCell` - Célula do cabeçalho
- `table.body` - Corpo da tabela
- `table.row` - Linha da tabela
- `table.cell` - Célula da tabela
- `table.cellSecondary` - Célula secundária

### Inputs

- `input.base` - Estilo base do input
- `input.placeholder` - Estilo do placeholder
- `input.focus` - Estilo do foco
- `input.success` - Estilo de sucesso

### Ícones

- `icon.primary` - Ícone primário (verde)
- `icon.secondary` - Ícone secundário

## Modificando o Tema

Para modificar o tema, basta alterar as definições no arquivo `src/lib/theme/colors.ts`. Todas as alterações serão refletidas automaticamente em todos os componentes que usam o tema.

Por exemplo, para alterar a cor principal do tema:

```ts
// Em src/lib/theme/colors.ts
export const colors = {
  // ...
  neon: {
    green: {
      primary: '#0AD85E', // Altere esta cor para mudar a cor principal do tema
      // ...
    },
    // ...
  },
  // ...
};
```

## Benefícios

- **Consistência** - Todas as páginas seguem o mesmo padrão visual
- **Manutenção Simplificada** - Alterações no tema podem ser feitas em um único lugar
- **Desenvolvimento Mais Rápido** - Componentes reutilizáveis aceleram o desenvolvimento
- **Adaptabilidade** - Fácil adaptação para diferentes temas (claro/escuro)