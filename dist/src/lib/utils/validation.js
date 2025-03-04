export function validatePublicId(publicId) {
    return /^[A-Z0-9]{8}$/.test(publicId);
}
export function validateWebhookPayload(payload) {
    // Verifica se todos os campos obrigatórios existem
    const requiredFields = [
        'action',
        'ticker',
        'order_size',
        'position_size',
        'schema',
        'timestamp',
        'public_id'
    ];
    const hasAllFields = requiredFields.every(field => {
        const value = payload[field];
        return value !== undefined && value !== null && value !== '';
    });
    if (!hasAllFields) {
        return false;
    }
    // Verifica os tipos dos campos
    const types = {
        action: typeof payload.action === 'string',
        ticker: typeof payload.ticker === 'string',
        order_size: typeof payload.order_size === 'string',
        position_size: typeof payload.position_size === 'string',
        schema: typeof payload.schema === 'string',
        timestamp: typeof payload.timestamp === 'string',
        public_id: typeof payload.public_id === 'string'
    };
    console.log('🔍 Tipos dos campos:', types);
    return Object.values(types).every(isValid => isValid === true);
}
export function validateIP(ip) {
    // Remove espaços em branco
    ip = ip.trim();
    // Verifica se é localhost
    if (ip === '::1' || ip === '127.0.0.1') {
        return true;
    }
    // Regex para validar IPv4
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipv4Regex.test(ip)) {
        // Verifica se cada octeto está entre 0 e 255
        const octetos = ip.split('.');
        return octetos.every(octeto => {
            const num = parseInt(octeto, 10);
            return !isNaN(num) && num >= 0 && num <= 255 && octeto === num.toString();
        });
    }
    // Regex para validar IPv6
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    if (ipv6Regex.test(ip)) {
        const grupos = ip.split(':');
        return grupos.every(grupo => {
            const num = parseInt(grupo, 16);
            return !isNaN(num) && num >= 0 && num <= 65535;
        });
    }
    return false;
}
export function validateIPList(ips) {
    if (!ips.trim()) {
        return { isValid: true, invalidIPs: [] };
    }
    const ipList = ips.split(',').map(ip => ip.trim()).filter(ip => ip.length > 0);
    const invalidIPs = ipList.filter(ip => !validateIP(ip));
    return {
        isValid: invalidIPs.length === 0,
        invalidIPs
    };
}
