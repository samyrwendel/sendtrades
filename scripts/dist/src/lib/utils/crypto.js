import { createHmac } from 'crypto';
// Função para converter string para array de bytes
function stringToUint8Array(str) {
    return new TextEncoder().encode(str);
}
// Função para converter array de bytes para string hexadecimal
function arrayBufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}
export async function generateSignature(message, secret) {
    const hmac = createHmac('sha256', secret);
    hmac.update(message);
    return hmac.digest('hex');
}
