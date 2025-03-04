const axios = require('axios');

const API_URL = 'http://192.168.1.33:3000';

async function testLogin() {
  try {
    console.log('🔄 Testando login...');
    
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin@admin.com',
      password: 'admin123'
    });

    if (response.data.success) {
      console.log('✅ Login realizado com sucesso!');
      console.log('🔑 Token:', response.data.token);
      return response.data.token;
    } else {
      console.error('❌ Erro no login:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao fazer login:', error.response?.data?.message || error.message);
    return null;
  }
}

testLogin(); 