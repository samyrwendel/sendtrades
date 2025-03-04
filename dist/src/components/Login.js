import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth';
import useTheme from '../hooks/useTheme';
import { toast } from 'sonner';
import { Button, Input, Label } from './ui';
export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { setTheme } = useTheme();
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('🔄 Iniciando tentativa de login...');
        try {
            console.log('📧 Tentando login com:', email);
            const response = await login(email, password);
            if (response.success) {
                // Carregar tema do usuário
                if (response.user?.theme) {
                    setTheme(response.user.theme);
                }
                toast.success('Login realizado com sucesso!');
                navigate('/dashboard');
            }
            else {
                toast.error(response.message || 'Erro ao fazer login');
            }
        }
        catch (error) {
            console.error('❌ Erro no login:', error);
            toast.error('Erro ao fazer login');
        }
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "max-w-md w-full space-y-8", children: [_jsx("div", { children: _jsx("h2", { className: "mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100", children: "Login" }) }), _jsxs("form", { className: "mt-8 space-y-6", onSubmit: handleSubmit, children: [_jsxs("div", { className: "rounded-md shadow-sm -space-y-px", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "email", className: "sr-only", children: "Email" }), _jsx(Input, { id: "email", name: "email", type: "email", autoComplete: "email", required: true, className: "appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm", placeholder: "Email", value: email, onChange: (e) => setEmail(e.target.value) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "password", className: "sr-only", children: "Senha" }), _jsx(Input, { id: "password", name: "password", type: "password", autoComplete: "current-password", required: true, className: "appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm", placeholder: "Senha", value: password, onChange: (e) => setPassword(e.target.value) })] })] }), _jsx("div", { children: _jsx(Button, { type: "submit", className: "group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500", children: "Entrar" }) })] })] }) }));
}
