import crypto from 'crypto';

/**
 * Gera uma assinatura HMAC SHA256 para autenticação na API da MEXC
 * @param queryString - String de consulta ou corpo da requisição a ser assinado
 * @param secretKey - Chave secreta da API
 * @returns Assinatura em hexadecimal
 */
export function generateSignature(queryString: string, secretKey: string): string {
  return crypto
    .createHmac('sha256', secretKey)
    .update(queryString)
    .digest('hex');
} 