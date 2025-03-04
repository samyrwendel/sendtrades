import React, { useEffect } from 'react';
import useTheme from '../hooks/useTheme';

export function Dashboard() {
  const { theme } = useTheme();

  useEffect(() => {
    // Força a cor do título via JavaScript
    const titles = document.querySelectorAll('h2.text-xl.font-semibold');
    titles.forEach(title => {
      if (theme === 'dark') {
        (title as HTMLElement).style.color = '#FFFFFF';
      } else {
        (title as HTMLElement).style.color = '#1F2937'; // Cor escura para tema claro
      }
    });
  }, [theme]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold">
        Bots Ativos
      </h2>
      {/* resto do conteúdo */}
    </div>
  );
} 