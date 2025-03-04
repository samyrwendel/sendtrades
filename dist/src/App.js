import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { LanguageProvider } from './lib/i18n/LanguageContext';
import { ThemeProvider } from './lib/theme/ThemeContext';
import { initWalletGuard } from './lib/wallet/walletGuard';
import { handleError } from './lib/errors/errorHandler';
import useTheme from './hooks/useTheme';
function App() {
    const { theme, setTheme } = useTheme();
    console.log('Tema atual:', theme); // Para debug
    useEffect(() => {
        // Inicializa o Wallet Guard
        initWalletGuard();
        // Armazenar console.error original
        const originalError = console.error;
        // Configurar novo handler
        console.error = (...args) => {
            // Se o erro já foi tratado, usa console original
            if (args[0]?.isHandled) {
                originalError.apply(console, args);
                return;
            }
            try {
                // Restaurar console.error original antes de chamar handleError
                console.error = originalError;
                handleError(args[0]);
            }
            catch (e) {
                originalError.apply(console, ['❌ Erro no handler:', e]);
            }
            finally {
                // Garantir que o console.error original seja restaurado
                console.error = originalError;
            }
            // Chamar console.error original com os argumentos originais
            originalError.apply(console, args);
        };
        // Handler para promessas não tratadas
        const handleUnhandledRejection = (event) => {
            event.preventDefault();
            if (event.reason?.isHandled) {
                return;
            }
            try {
                handleError(event.reason);
            }
            catch (e) {
                console.error('❌ Erro no handler:', e);
            }
        };
        window.addEventListener('unhandledrejection', handleUnhandledRejection);
        // Carrega o tema salvo ou usa o padrão
        const savedTheme = localStorage.getItem('theme-storage');
        if (savedTheme) {
            const parsedTheme = JSON.parse(savedTheme);
            setTheme(parsedTheme.state.theme);
        }
        else {
            setTheme('dark'); // Tema padrão
        }
        return () => {
            console.error = originalError;
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        };
    }, [setTheme]);
    return (_jsx("div", { className: `${theme} min-h-screen bg-white dark:bg-gray-900`, children: _jsx(ThemeProvider, { children: _jsx(LanguageProvider, { children: _jsx(RouterProvider, { router: router }) }) }) }));
}
export default App;
