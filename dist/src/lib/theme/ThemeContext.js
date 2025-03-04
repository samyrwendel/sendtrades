import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
const ThemeContext = createContext(undefined);
export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') || 'light';
        }
        return 'light';
    });
    useEffect(() => {
        // Remover classes antigas
        document.documentElement.classList.remove('light', 'dark');
        // Adicionar nova classe
        document.documentElement.classList.add(theme);
        // Atualizar localStorage
        localStorage.setItem('theme', theme);
        // Atualizar a cor do fundo do body
        document.body.style.backgroundColor = theme === 'light' ? '#f9fafb' : '#1f2937';
    }, [theme]);
    return (_jsx(ThemeContext.Provider, { value: { theme, setTheme }, children: children }));
}
export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
