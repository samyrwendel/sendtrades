import express, { Request, Response, Router, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { authMiddleware } from '../middleware/auth';

// Carregar variáveis de ambiente
dotenv.config();

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-here';

// Inicializar cliente Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente do Supabase não configuradas');
  console.error('SUPABASE_URL:', supabaseUrl);
  console.error('SUPABASE_KEY:', supabaseKey ? '[CONFIGURADO]' : '[NÃO CONFIGURADO]');
  console.error('SUPABASE_ANON_KEY:', supabaseAnonKey ? '[CONFIGURADO]' : '[NÃO CONFIGURADO]');
  console.error('SUPABASE_SERVICE_KEY:', supabaseServiceKey ? '[CONFIGURADO]' : '[NÃO CONFIGURADO]');
  process.exit(1);
}

// Cliente público (para autenticação)
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce'
  }
});

// Cliente admin (para operações privilegiadas)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Interfaces
interface User {
  id: string;
  email: string;
  name: string;
  plan: string;
  active: boolean;
  theme?: 'light' | 'dark';
  created_at?: string;
  updated_at?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest extends LoginRequest {
  name: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  details?: string;
  token?: string;
  user?: Partial<User>;
}

// Função auxiliar para formatar resposta do usuário
const formatUserResponse = (user: Partial<User>): Partial<User> => ({
  id: user.id,
  email: user.email,
  name: user.name,
  plan: user.plan || 'free',
  active: user.active,
  theme: user.theme || 'dark'
});

// Função para validar email
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

// Handlers
const loginHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    console.log('🔑 Tentativa de login:', { email });

    // Verificar se o usuário existe na tabela User
    const { data: existingUser, error: userError } = await supabase
      .from('User')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (userError) {
      console.log('❌ Erro ao buscar usuário na tabela User:', userError);
      res.status(401).json({ 
        success: false,
        message: 'Credenciais inválidas',
        details: userError.message
      });
      return;
    }

    if (!existingUser) {
      console.log('❌ Usuário não encontrado na tabela User');
      res.status(401).json({ 
        success: false,
        message: 'Credenciais inválidas'
      });
      return;
    }

    // Verificar senha usando bcrypt
    const isPasswordValid = await bcryptjs.compare(password, existingUser.password);
    if (!isPasswordValid) {
      console.log('❌ Senha inválida');
      res.status(401).json({ 
        success: false,
        message: 'Credenciais inválidas'
      });
      return;
    }

    // Autenticar usando Supabase
    let authResult = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password
    });

    if (authResult.error) {
      console.log('❌ Erro na autenticação Supabase:', authResult.error);
      
      // Tentar recriar o usuário no Auth se não existir
      if (authResult.error.message.includes('Invalid login credentials')) {
        console.log('🔄 Tentando recriar usuário no Auth...');
        
        const { data: newAuthUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: email.toLowerCase(),
          password,
          email_confirm: true,
          user_metadata: {
            name: existingUser.name,
            plan: existingUser.plan || 'free',
            active: true
          }
        });

        if (createError) {
          console.log('❌ Erro ao recriar usuário no Auth:', createError);
          res.status(401).json({ 
            success: false,
            message: 'Erro ao recriar usuário',
            details: createError.message
          });
          return;
        }

        // Tentar login novamente
        authResult = await supabase.auth.signInWithPassword({
          email: email.toLowerCase(),
          password
        });

        if (authResult.error) {
          console.log('❌ Erro ao tentar login após recriar usuário:', authResult.error);
          res.status(401).json({ 
            success: false,
            message: 'Erro ao autenticar após recriar usuário',
            details: authResult.error.message
          });
          return;
        }
      } else {
        res.status(401).json({ 
          success: false,
          message: 'Credenciais inválidas',
          details: authResult.error.message
        });
        return;
      }
    }

    if (!authResult.data?.user) {
      console.log('❌ Usuário não encontrado no Supabase Auth');
      res.status(401).json({ 
        success: false,
        message: 'Credenciais inválidas'
      });
      return;
    }

    // Gerar token JWT
    const tokenPayload = {
      id: existingUser.id,
      email: existingUser.email,
      name: existingUser.name,
      plan: existingUser.plan || 'free'
    };

    console.log('✅ Gerando token com payload:', tokenPayload);

    const token = jwt.sign(
      tokenPayload,
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Login bem-sucedido:', { 
      userId: existingUser.id, 
      email: existingUser.email,
      tokenPreview: token.substring(0, 20) + '...'
    });

    res.json({ 
      success: true,
      token,
      user: formatUserResponse(existingUser)
    });
  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

const registerHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    console.log('📝 Iniciando registro de usuário:', { email, name });

    // Validar email
    if (!isValidEmail(email)) {
      console.log('❌ Email inválido:', email);
      res.status(400).json({ 
        success: false,
        message: 'Email inválido. Use um endereço de email válido.'
      });
      return;
    }

    // Validar senha
    if (!password || password.length < 6) {
      console.log('❌ Senha inválida');
      res.status(400).json({ 
        success: false,
        message: 'A senha deve ter pelo menos 6 caracteres'
      });
      return;
    }

    // Validar nome
    if (!name || name.trim().length === 0) {
      console.log('❌ Nome inválido');
      res.status(400).json({ 
        success: false,
        message: 'Nome é obrigatório'
      });
      return;
    }

    // Verificar se o email já está em uso
    const { data: existingUser, error: checkError } = await supabase
      .from('User')
      .select('email')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      console.log('❌ Email já está em uso:', email);
      res.status(400).json({
        success: false,
        message: 'Este email já está em uso'
      });
      return;
    }

    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: {
        name,
        plan: 'free',
        active: true
      }
    });

    if (authError || !authData.user) {
      console.log('❌ Erro ao criar usuário no Auth:', authError);
      res.status(400).json({
        success: false,
        message: 'Erro ao criar usuário',
        details: authError?.message
      });
      return;
    }

    // Gerar hash da senha para a tabela User
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Criar usuário na tabela User
    const { data: userData, error: userError } = await supabase
      .from('User')
      .insert([{
        id: authData.user.id,
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        plan: 'free',
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }])
      .select()
      .single();

    if (userError) {
      console.log('❌ Erro ao criar usuário na tabela User:', userError);
      
      // Deletar usuário do Auth em caso de erro
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      
      res.status(500).json({
        success: false,
        message: 'Erro ao criar usuário',
        details: userError.message
      });
      return;
    }

    // Gerar token JWT
    const tokenPayload = {
      id: authData.user.id,
      email: authData.user.email,
      name,
      plan: 'free'
    };

    const token = jwt.sign(
      tokenPayload,
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Registro bem-sucedido:', {
      userId: authData.user.id,
      email: authData.user.email,
      tokenPreview: token.substring(0, 20) + '...'
    });

    res.status(201).json({
      success: true,
      token,
      user: formatUserResponse(userData)
    });

  } catch (error) {
    console.error('❌ Erro no registro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

const verifyHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token não fornecido'
      });
      return;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        email: string;
        name: string;
        plan: string;
      };

      // Verificar se o usuário ainda existe e está ativo
      const { data: user, error: userError } = await supabase
        .from('User')
        .select('*')
        .eq('id', decoded.id)
        .single();

      if (userError || !user || !user.active) {
        res.status(401).json({
          success: false,
          message: 'Token inválido ou usuário inativo'
        });
        return;
      }

      res.json({
        success: true,
        user: formatUserResponse(user)
      });

    } catch (jwtError) {
      res.status(401).json({
        success: false,
        message: 'Token inválido ou expirado'
      });
      return;
    }
  } catch (error) {
    console.error('❌ Erro ao verificar token:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

// Handler para atualizar tema
const updateThemeHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { theme } = req.body;
    const userId = (req as any).user.id;  // ID do usuário do token

    if (!['light', 'dark'].includes(theme)) {
      res.status(400).json({
        success: false,
        message: 'Tema inválido'
      });
      return;
    }

    const { error } = await supabase
      .from('User')
      .update({ theme })
      .eq('id', userId);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Tema atualizado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar tema:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar tema',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

// Rotas
router.post('/login', loginHandler);
router.post('/register', registerHandler);
router.post('/verify', verifyHandler);
router.put('/theme', authMiddleware as RequestHandler, updateThemeHandler);

export default router; 