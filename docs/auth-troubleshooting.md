# Resolução de Problemas de Autenticação

## Problema: Inconsistência entre IDs de Usuário

### Sintomas
1. Login bem-sucedido, mas falha na verificação do token
2. Erro `Token inválido ou usuário inativo` ao tentar acessar rotas protegidas
3. IDs diferentes entre o token JWT e o objeto do usuário retornado

### Causa Raiz
O problema ocorria porque o token JWT estava sendo gerado com o ID do usuário do Supabase Auth (`authResult.data.user.id`), enquanto o sistema usa o ID da tabela `User` (`existingUser.id`).

### Solução Implementada

1. No arquivo `src/api/routes/authRoutes.ts`:
```typescript
// Antes (problema)
const tokenPayload = {
  id: authResult.data.user.id,  // ID do Supabase Auth
  email: authResult.data.user.email,
  name: existingUser.name,
  plan: existingUser.plan || 'free'
};

// Depois (solução)
const tokenPayload = {
  id: existingUser.id,  // ID da tabela User
  email: existingUser.email,
  name: existingUser.name,
  plan: existingUser.plan || 'free'
};
```

2. No arquivo `src/api/middleware/auth.ts`:
```typescript
// Adicionado logs para debug
console.log('🔑 Token decodificado:', decoded);
console.log('👤 Usuário encontrado:', userData);
console.log('❌ Erro ao buscar usuário:', userError);

// Melhorado tratamento de erros
if (userError) {
  console.error('Erro ao buscar usuário:', userError);
  res.status(401).json({ error: 'Erro ao validar usuário' });
  return;
}

if (!userData || !userData.active) {
  res.status(401).json({ error: 'Usuário não encontrado ou inativo' });
  return;
}
```

### Fluxo de Autenticação Correto

1. **Login**:
   - Verifica se usuário existe na tabela `User`
   - Autentica no Supabase Auth
   - Gera token JWT com dados da tabela `User`

2. **Verificação de Token**:
   - Decodifica o token JWT
   - Busca usuário na tabela `User` usando o ID do token
   - Verifica se usuário está ativo

3. **Middleware de Autenticação**:
   - Valida token em cada requisição
   - Busca dados atualizados do usuário
   - Anexa dados do usuário à requisição

### Prevenção

1. Sempre usar o mesmo ID (da tabela `User`) em todo o sistema
2. Manter logs detalhados para debug
3. Validar consistência dos dados entre Supabase Auth e tabela `User`
4. Testar fluxo completo de autenticação após mudanças

### Logs Úteis para Debug

```typescript
// No login
console.log('🔑 Tentativa de login:', { email });
console.log('✅ Gerando token com payload:', tokenPayload);
console.log('✅ Login bem-sucedido:', { 
  userId: authResult.data.user.id, 
  email: authResult.data.user.email,
  tokenPreview: token.substring(0, 20) + '...'
});

// No middleware
console.log('🔑 Token decodificado:', decoded);
console.log('👤 Usuário encontrado:', userData);
console.log('❌ Erro ao buscar usuário:', userError);
``` 