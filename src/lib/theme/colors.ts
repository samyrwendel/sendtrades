// Cores principais do tema
export const colors = {
  // Cores de fundo
  background: {
    primary: '#020202',
    surface1: '#030303',
    surface2: '#050505',
    surface3: '#080808',
    surface4: '#101010',
    card: {
      light: '#FFFFFF',
      dark: 'var(--md-surface-1)'
    }
  },
  
  // Cores neon
  neon: {
    green: {
      primary: '#0AD85E',
      light: '#ADFFCE',
      transparent: 'rgba(10, 216, 94, 0.3)'
    },
    orange: {
      primary: '#FF9800',
      light: '#FFB74D',
    },
    red: {
      primary: '#FF2E60',
      light: '#FF97AF',
    }
  },

  // Cores de estado
  state: {
    active: {
      bg: 'rgba(10, 216, 94, 0.2)',  // #0AD85E com 20% opacidade
      text: {
        light: '#0AD85E',
        dark: '#ADFFCE'
      }
    },
    paused: {
      bg: 'rgba(255, 152, 0, 0.2)',  // #FF9800 com 20% opacidade
      text: {
        light: '#FF9800',
        dark: '#FFB74D'
      }
    }
  },

  // Cores de texto
  text: {
    primary: {
      light: '#111827',
      dark: 'var(--md-on-surface)'
    },
    secondary: {
      light: '#6B7280',
      dark: 'var(--md-on-surface-medium)'
    },
    placeholder: {
      light: 'rgba(10, 216, 94, 0.7)',
      dark: 'rgba(10, 216, 94, 0.7)'
    }
  },

  // Cores de borda
  border: {
    light: '#E5E7EB',
    dark: 'var(--md-surface-4)'
  },

  // Cores de botões
  button: {
    primary: {
      bg: '#0AD85E',
      text: {
        light: '#FFFFFF',
        dark: '#FFFFFF'
      },
      hover: {
        light: 'rgba(10, 216, 94, 0.9)',
        dark: 'rgba(10, 216, 94, 0.8)'
      }
    },
    secondary: {
      bg: '#374151',
      text: '#FFFFFF',
      hover: '#4B5563'
    },
    outline: {
      border: '#E5E7EB',
      text: '#6B7280',
      hover: {
        bg: '#F3F4F6',
        text: '#111827'
      }
    },
    destructive: {
      bg: '#FF2E60',
      text: '#FFFFFF',
      hover: 'rgba(255, 46, 96, 0.9)'
    }
  },

  // Cores de ícones
  icon: {
    primary: '#0AD85E',
    secondary: '#6B7280',
    destructive: '#FF2E60'
  },

  // Cores de elementos de formulário
  form: {
    input: {
      bg: {
        light: '#FFFFFF',
        dark: 'var(--md-surface-1)'
      },
      border: {
        light: '#E5E7EB',
        dark: 'var(--md-surface-4)'
      },
      text: {
        light: '#111827',
        dark: 'var(--md-on-surface)'
      },
      focus: {
        border: '#0AD85E',
        ring: '#0AD85E'
      }
    },
    select: {
      bg: {
        light: '#FFFFFF',
        dark: 'var(--md-surface-1)'
      },
      border: {
        light: '#E5E7EB',
        dark: 'var(--md-surface-4)'
      },
      text: {
        light: '#111827',
        dark: 'var(--md-on-surface)'
      }
    }
  },

  // Cores de tabelas
  table: {
    header: {
      bg: {
        light: '#F9FAFB',
        dark: 'var(--md-surface-2)'
      },
      text: {
        light: '#6B7280',
        dark: 'var(--md-on-surface-medium)'
      }
    },
    row: {
      bg: {
        light: '#FFFFFF',
        dark: 'var(--md-surface-1)'
      },
      hover: {
        light: '#F9FAFB',
        dark: 'var(--md-surface-2)'
      },
      border: {
        light: '#E5E7EB',
        dark: 'var(--md-surface-4)'
      }
    }
  }
} as const;

// Tipos para as cores
export type ThemeColors = typeof colors;

// Utilitário para gerar classes Tailwind com opacidade
export const withOpacity = (color: string, opacity: number) => {
  return `${color}/${opacity * 100}`;
};

// Utilitário para gerar classes CSS para elementos comuns
export const themeClasses = {
  // Classes para inputs
  input: {
    base: "bg-white dark:bg-[var(--md-surface-1)] border-gray-200 dark:border-[var(--md-surface-4)] text-gray-900 dark:text-[var(--md-on-surface)]",
    placeholder: "placeholder:text-[#0AD85E]/70 dark:placeholder:text-[#0AD85E]/70",
    focus: "focus:ring-[#0AD85E] focus:border-[#0AD85E] dark:focus:ring-[#0AD85E] dark:focus:border-[#0AD85E]",
    success: "border-[#0AD85E]/30 dark:border-[#0AD85E]/30"
  },
  
  // Classes para selects
  select: {
    trigger: "bg-white dark:bg-[var(--md-surface-1)] border-gray-200 dark:border-[var(--md-surface-4)] text-gray-900 dark:text-[var(--md-on-surface)]",
    icon: "text-[#0AD85E] dark:text-[#0AD85E]"
  },
  
  // Classes para cards
  card: {
    base: "bg-white dark:bg-[var(--md-surface-1)] border border-gray-200 dark:border-[var(--md-surface-4)] rounded-lg shadow-sm",
    header: "text-gray-900 dark:text-[var(--md-on-surface)]",
    content: "text-gray-600 dark:text-[var(--md-on-surface-medium)]"
  },
  
  // Classes para tabelas
  table: {
    base: "min-w-full divide-y divide-gray-200 dark:divide-[var(--md-surface-4)]",
    header: "bg-gray-50 dark:bg-[var(--md-surface-2)]",
    headerCell: "px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-[var(--md-on-surface-medium)] uppercase tracking-wider",
    body: "bg-white dark:bg-[var(--md-surface-1)] divide-y divide-gray-200 dark:divide-[var(--md-surface-4)]",
    row: "hover:bg-gray-50 dark:hover:bg-[var(--md-surface-2)]",
    cell: "px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-[var(--md-on-surface)]",
    cellSecondary: "px-6 py-4 text-sm text-gray-600 dark:text-[var(--md-on-surface-medium)]"
  },
  
  // Classes para headings
  heading: {
    h1: "text-2xl font-semibold text-gray-900 dark:text-[var(--md-on-surface)]",
    h2: "text-lg font-medium text-gray-900 dark:text-[var(--md-on-surface)]",
    h3: "text-base font-medium text-gray-900 dark:text-[var(--md-on-surface)]"
  },
  
  // Classes para textos
  text: {
    primary: "text-gray-900 dark:text-[var(--md-on-surface)]",
    secondary: "text-gray-600 dark:text-[var(--md-on-surface-medium)]",
    small: "text-sm text-gray-500 dark:text-[var(--md-on-surface-medium)]"
  },
  
  // Classes para ícones
  icon: {
    primary: "text-[#0AD85E] dark:text-[#0AD85E]",
    secondary: "text-gray-500 dark:text-[var(--md-on-surface-medium)]"
  },
  
  // Classes para layouts
  layout: {
    page: "space-y-6",
    header: "flex items-center justify-between",
    filters: "flex flex-col md:flex-row gap-3 md:gap-4 items-start md:items-center justify-between",
    filterInput: "flex-1 min-w-[200px] relative"
  }
};