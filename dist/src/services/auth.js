import { api } from './api';
export const login = async (email, password) => {
    try {
        console.log('🔄 Iniciando processo de login no auth.ts');
        console.log('📍 API URL:', api.defaults.baseURL);
        const data = { email, password };
        console.log('✅ Dados validados:', data);
        console.log('🔄 Enviando requisição para:', `${api.defaults.baseURL}/api/auth/login`);
        const response = await api.post('/api/auth/login', data);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    }
    catch (error) {
        console.error('❌ Erro detalhado:', error);
        console.error('❌ Erro da API:', error);
        throw new Error('Erro ao fazer login');
    }
};
export const updateUserTheme = async (theme) => {
    const token = localStorage.getItem('token');
    if (!token)
        throw new Error('Usuário não autenticado');
    await api.put('/api/auth/theme', { theme }, {
        headers: { Authorization: `Bearer ${token}` }
    });
};
