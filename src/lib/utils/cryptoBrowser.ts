import CryptoJS from 'crypto-js';

// Função para converter string para array de bytes
function stringToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// Função para converter array de bytes para string hexadecimal
function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function generateSignature(message: string, secret: string): Promise<string> {
  try {
    // Verificar se a mensagem contém um timestamp
    if (message.includes('timestamp=')) {
      const timestampMatch = message.match(/timestamp=(\d+)/);
      if (timestampMatch) {
        const timestamp = parseInt(timestampMatch[1]);
        console.log('\n=== Verificação do Timestamp na Assinatura ===');
        console.log('Timestamp encontrado:', timestamp);
        console.log('Em formato ISO:', new Date(timestamp).toISOString());
        
        // Verificar se o timestamp está em milissegundos (13 dígitos)
        if (String(timestamp).length !== 13) {
          console.warn('⚠️ Alerta: Timestamp pode não estar em milissegundos!');
          console.warn('Número de dígitos:', String(timestamp).length);
        }
      }
    }

    return CryptoJS.HmacSHA256(message, secret).toString();
  } catch (error) {
    console.error('Erro ao gerar assinatura:', error);
    throw error;
  }
} 