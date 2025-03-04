import React from 'react';
import { Moon, Sun } from 'lucide-react';
import useTheme from '../hooks/useTheme';
import { updateUserTheme } from '../services/auth';

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    
    // Atualiza localmente
    setTheme(newTheme);
    
    try {
      // Salva no backend
      await updateUserTheme(newTheme);
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center w-full px-2 py-2 text-sm font-medium rounded-md transition-colors"
      title={theme === 'light' ? 'Mudar para tema escuro' : 'Mudar para tema claro'}
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 mr-3" />
      ) : (
        <Sun className="w-5 h-5 mr-3" />
      )}
      {theme === 'light' ? 'Tema Escuro' : 'Tema Claro'}
    </button>
  );
};