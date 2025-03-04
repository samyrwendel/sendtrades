import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { login, getSessionData } from '../lib/auth';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { Button } from '../components/ui/button';

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

  const handleSubmit = async (e: React.FormEvent) => {
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
      
    } catch (err) {
      setLoginSuccess(false);
      console.error('❌ Erro no login:', err);
      
      if (err instanceof Error) {
        // Mensagens de erro mais amigáveis
        if (err.message.includes('401')) {
          setError(t.errors.loginError.invalidCredentials);
        } else if (err.message.includes('404')) {
          setError(t.errors.loginError.serverNotFound);
        } else if (err.message.includes('500')) {
          setError(t.errors.loginError.internalError);
        } else if (err.message.includes('Network Error')) {
          setError(t.errors.loginError.networkError);
        } else {
          setError(err.message);
        }
      } else {
        setError(t.errors.loginError.unexpected);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020817] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          TradingBot
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Faça login para acessar sua conta
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800/50 backdrop-blur-sm py-8 px-4 shadow-lg ring-1 ring-white/10 sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-md text-sm flex items-center gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="flex-1">{error}</span>
              </div>
            )}
            
            {loginSuccess && successMessage && (
              <div className="bg-green-900/30 border border-green-800 text-green-400 px-4 py-3 rounded-md text-sm flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                <span className="flex-1">{successMessage}</span>
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200">
                Email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-[#0AD85E] focus:border-[#0AD85E] dark:focus:ring-[#ADFFCE] dark:focus:border-[#ADFFCE] focus:z-10 sm:text-sm bg-white dark:bg-[#030303]"
                  placeholder={t.auth.emailPlaceholder}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  disabled={isLoading || loginSuccess}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                Senha
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-[#0AD85E] focus:border-[#0AD85E] dark:focus:ring-[#ADFFCE] dark:focus:border-[#ADFFCE] focus:z-10 sm:text-sm bg-white dark:bg-[#030303]"
                  placeholder={t.auth.passwordPlaceholder}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  disabled={isLoading || loginSuccess}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-500 hover:text-gray-400 focus:outline-none"
                    disabled={isLoading || loginSuccess}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link
                  to="/password-recovery"
                  className="font-medium text-indigo-400 hover:text-indigo-300"
                >
                  Esqueceu sua senha?
                </Link>
              </div>
              <div className="text-sm">
                <Link
                  to="/register"
                  className="font-medium text-indigo-400 hover:text-indigo-300"
                >
                  Criar conta
                </Link>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                variant="success"
                className="group relative w-full"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  t.auth.signIn
                )}
              </Button>

              {error && (
                <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="mt-4">
                <Link
                  to="/password-recovery"
                  className="text-sm text-[#0AD85E] hover:text-[#0AD85E]/90 dark:text-[#ADFFCE] dark:hover:text-[#ADFFCE]/90"
                >
                  {t.auth.forgotPassword}
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}