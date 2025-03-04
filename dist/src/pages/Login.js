import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { login, getSessionData } from '../lib/auth';
import { useLanguage } from '../lib/i18n/LanguageContext';
export function Login() {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loginSuccess, setLoginSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    // Verificar se já existe uma sessão ativa
    useEffect(() => {
        const checkSession = async () => {
            const session = getSessionData();
            if (session) {
                console.log('✅ Sessão ativa encontrada:', session);
                console.log('🔄 Redirecionando para dashboard...');
                navigate('/');
            }
        };
        checkSession();
    }, [navigate]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoginSuccess(false);
        setSuccessMessage('');
        try {
            setIsLoading(true);
            console.log('🔄 Iniciando tentativa de login...');
            // Validações básicas
            if (!email.trim()) {
                throw new Error('Por favor, informe seu email');
            }
            if (!password.trim()) {
                throw new Error('Por favor, informe sua senha');
            }
            console.log('📧 Tentando login com:', email);
            const token = await login(email, password);
            if (!token) {
                throw new Error('Erro ao fazer login. Verifique suas credenciais.');
            }
            setLoginSuccess(true);
            setSuccessMessage('Login realizado com sucesso! Bem-vindo(a) de volta.');
            console.log('✅ Login realizado com sucesso!');
            // Verificar dados da sessão
            const session = getSessionData();
            if (!session) {
                throw new Error('Erro ao verificar dados da sessão');
            }
            console.log('👤 Dados do usuário:', session);
            console.log('🔄 Preparando redirecionamento...');
            // Pequeno delay para mostrar mensagem de sucesso
            setTimeout(() => {
                console.log('🔄 Redirecionando para dashboard...');
                navigate('/', { replace: true });
            }, 1500);
        }
        catch (err) {
            setLoginSuccess(false);
            console.error('❌ Erro no login:', err);
            if (err instanceof Error) {
                // Mensagens de erro mais amigáveis
                if (err.message.includes('401')) {
                    setError(t.errors.loginError.invalidCredentials);
                }
                else if (err.message.includes('404')) {
                    setError(t.errors.loginError.serverNotFound);
                }
                else if (err.message.includes('500')) {
                    setError(t.errors.loginError.internalError);
                }
                else if (err.message.includes('Network Error')) {
                    setError(t.errors.loginError.networkError);
                }
                else {
                    setError(err.message);
                }
            }
            else {
                setError(t.errors.loginError.unexpected);
            }
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-[#020817] flex flex-col justify-center py-12 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "sm:mx-auto sm:w-full sm:max-w-md", children: [_jsx("h2", { className: "mt-6 text-center text-3xl font-extrabold text-white", children: "TradingBot" }), _jsx("p", { className: "mt-2 text-center text-sm text-gray-400", children: "Fa\u00E7a login para acessar sua conta" })] }), _jsx("div", { className: "mt-8 sm:mx-auto sm:w-full sm:max-w-md", children: _jsx("div", { className: "bg-gray-800/50 backdrop-blur-sm py-8 px-4 shadow-lg ring-1 ring-white/10 sm:rounded-lg sm:px-10", children: _jsxs("form", { className: "space-y-6", onSubmit: handleSubmit, children: [error && (_jsxs("div", { className: "bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-md text-sm flex items-center gap-2", children: [_jsx(AlertCircle, { className: "h-5 w-5 flex-shrink-0" }), _jsx("span", { className: "flex-1", children: error })] })), loginSuccess && successMessage && (_jsxs("div", { className: "bg-green-900/30 border border-green-800 text-green-400 px-4 py-3 rounded-md text-sm flex items-center gap-2", children: [_jsx(CheckCircle2, { className: "h-5 w-5 flex-shrink-0" }), _jsx("span", { className: "flex-1", children: successMessage })] })), _jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-200", children: "Email" }), _jsxs("div", { className: "mt-1 relative", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: _jsx(Mail, { className: "h-5 w-5 text-gray-500" }) }), _jsx("input", { id: "email", name: "email", type: "email", autoComplete: "email", required: true, className: "appearance-none block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md shadow-sm bg-gray-900/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm", placeholder: "seu@email.com", value: email, onChange: (e) => {
                                                    setEmail(e.target.value);
                                                    setError('');
                                                }, disabled: isLoading || loginSuccess })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-200", children: "Senha" }), _jsxs("div", { className: "mt-1 relative", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: _jsx(Lock, { className: "h-5 w-5 text-gray-500" }) }), _jsx("input", { id: "password", name: "password", type: showPassword ? "text" : "password", autoComplete: "current-password", required: true, className: "appearance-none block w-full pl-10 pr-10 py-2 border border-gray-700 rounded-md shadow-sm bg-gray-900/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022", value: password, onChange: (e) => {
                                                    setPassword(e.target.value);
                                                    setError('');
                                                }, disabled: isLoading || loginSuccess }), _jsx("div", { className: "absolute inset-y-0 right-0 pr-3 flex items-center", children: _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "text-gray-500 hover:text-gray-400 focus:outline-none", disabled: isLoading || loginSuccess, children: showPassword ? (_jsx(EyeOff, { className: "h-5 w-5" })) : (_jsx(Eye, { className: "h-5 w-5" })) }) })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "text-sm", children: _jsx(Link, { to: "/password-recovery", className: "font-medium text-indigo-400 hover:text-indigo-300", children: "Esqueceu sua senha?" }) }), _jsx("div", { className: "text-sm", children: _jsx(Link, { to: "/register", className: "font-medium text-indigo-400 hover:text-indigo-300", children: "Criar conta" }) })] }), _jsx("div", { children: _jsx("button", { type: "submit", disabled: isLoading || loginSuccess, className: `w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                  ${isLoading || loginSuccess
                                        ? 'bg-indigo-500 cursor-not-allowed opacity-60'
                                        : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'} focus:ring-offset-gray-900`, children: isLoading ? (_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("svg", { className: "animate-spin h-5 w-5 text-white", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }), _jsx("span", { children: "Entrando..." })] })) : loginSuccess ? (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CheckCircle2, { className: "h-5 w-5" }), _jsx("span", { children: "Redirecionando..." })] })) : ('Entrar') }) })] }) }) })] }));
}
