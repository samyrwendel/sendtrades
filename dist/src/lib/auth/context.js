import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
const AuthContext = createContext(undefined);
const API_URL = import.meta.env.VITE_API_URL;
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        // Verificar token existente e carregar usuário
        const token = localStorage.getItem('session');
        if (token) {
            validateAndLoadUser(token);
        }
        else {
            setIsLoading(false);
        }
    }, []);
    const validateAndLoadUser = async (token) => {
        try {
            const response = await fetch(`${API_URL}/api/auth/validate`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Sessão inválida');
            }
            const data = await response.json();
            setUser(data.user);
        }
        catch (error) {
            localStorage.removeItem('session');
            setError('Sessão expirada. Por favor, faça login novamente.');
        }
        finally {
            setIsLoading(false);
        }
    };
    const login = async (credentials) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao fazer login');
            }
            const data = await response.json();
            localStorage.setItem('session', data.token);
            setUser(data.user);
        }
        catch (error) {
            setError(error instanceof Error ? error.message : 'Erro ao fazer login');
            throw error;
        }
        finally {
            setIsLoading(false);
        }
    };
    const logout = () => {
        localStorage.removeItem('session');
        setUser(null);
    };
    const clearError = () => {
        setError(null);
    };
    return (_jsx(AuthContext.Provider, { value: {
            user,
            isLoading,
            error,
            login,
            logout,
            clearError
        }, children: children }));
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
