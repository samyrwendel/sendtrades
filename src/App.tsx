import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { LanguageProvider } from './lib/i18n/LanguageContext';
import { ThemeProvider } from './lib/theme/ThemeContext';
import { initWalletGuard } from './lib/wallet/walletGuard';
import { handleError } from './lib/errors/errorHandler';
import useTheme from './hooks/useTheme';
import { Toaster } from 'sonner';

interface UnhandledRejectionEvent extends Event {
  reason?: any;
  preventDefault: () => void;
}

function App(): JSX.Element {
  const { theme, setTheme } = useTheme();
  
  console.log('Tema atual:', theme); // Para debug

  useEffect(() => {
    // Inicializa o Wallet Guard
    initWalletGuard();

    // Armazenar console.error original
    const originalError = console.error;

    // Configurar novo handler
    console.error = (...args: any[]) => {
      // Se o erro já foi tratado, usa console original
      if (args[0]?.isHandled) {
        originalError.apply(console, args);
        return;
      }

      try {
        // Restaurar console.error original antes de chamar handleError
        console.error = originalError;
        handleError(args[0]);
      } catch (e) {
        originalError.apply(console, ['❌ Erro no handler:', e]);
      } finally {
        // Garantir que o console.error original seja restaurado
        console.error = originalError;
      }

      // Chamar console.error original com os argumentos originais
      originalError.apply(console, args);
    };

    // Handler para promessas não tratadas
    const handleUnhandledRejection = (event: UnhandledRejectionEvent) => {
      event.preventDefault();
      
      if (event.reason?.isHandled) {
        return;
      }

      try {
        handleError(event.reason);
      } catch (e) {
        console.error('❌ Erro no handler:', e);
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection as EventListener);

    // Carrega o tema salvo ou usa o padrão
    try {
      const savedTheme = localStorage.getItem('theme-storage');
      if (savedTheme) {
        const parsedTheme = JSON.parse(savedTheme);
        if (parsedTheme?.state?.theme && ['light', 'dark'].includes(parsedTheme.state.theme)) {
          setTheme(parsedTheme.state.theme);
        } else {
          setTheme('dark'); // Tema padrão se o valor salvo for inválido
        }
      } else {
        setTheme('dark'); // Tema padrão se não houver tema salvo
      }
    } catch (error) {
      console.warn('Erro ao carregar tema:', error);
      setTheme('dark'); // Tema padrão em caso de erro
    }

    return () => {
      console.error = originalError;
      window.removeEventListener('unhandledrejection', handleUnhandledRejection as EventListener);
    };
  }, [setTheme]);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className={`${theme} min-h-screen bg-white dark:bg-gray-900`}>
          <RouterProvider router={router} />
          <Toaster 
            richColors 
            position="top-right"
            toastOptions={{
              className: 'bg-black/60 border border-[#4ade80] text-[#4ade80] shadow-[0_0_10px_rgba(74,222,128,0.3)] backdrop-blur-sm',
              style: {
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 0 10px rgba(74, 222, 128, 0.3)'
              }
            }}
          />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;