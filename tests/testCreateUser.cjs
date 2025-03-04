const axios = require('axios');

const API_URL = 'http://192.168.1.33:3000/api';

async function createUser() {
  try {
    const userData = {
      name: 'Administrador',
      email: 'admin@admin.com',
      password: 'admin123',
      plan: 'unlimited'
    };

    const response = await axios.post(`${API_URL}/auth/register`, userData);
    console.log('✅ Usuário criado com sucesso:', response.data);
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error.response?.data || error.message);
    throw error;
  }
}

createUser(); 