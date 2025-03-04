import { ServerStorage } from '../../api/serverStorage';
const ADMIN_EMAILS = ['admin@admin.com'];
const PLAN_LIMITS = {
    free: {
        maxBots: 1,
        maxOrdersPerDay: 10,
        maxOrderSize: '1000',
        features: ['basic_trading', 'email_notifications']
    },
    pro: {
        maxBots: 5,
        maxOrdersPerDay: 100,
        maxOrderSize: '10000',
        features: ['basic_trading', 'email_notifications', 'telegram_notifications', 'advanced_trading']
    },
    enterprise: {
        maxBots: 20,
        maxOrdersPerDay: 1000,
        maxOrderSize: '100000',
        features: ['basic_trading', 'email_notifications', 'telegram_notifications', 'advanced_trading', 'api_access']
    },
    unlimited: {
        maxBots: Infinity,
        maxOrdersPerDay: Infinity,
        maxOrderSize: 'unlimited',
        features: ['basic_trading', 'email_notifications', 'telegram_notifications', 'advanced_trading', 'api_access', 'white_label']
    }
};
export function createPlanLimitsMiddleware(storage) {
    return async function checkPlanLimits(req, res, next) {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        // Bypass para administradores
        if (user.email && ADMIN_EMAILS.includes(user.email)) {
            return next();
        }
        const plan = user.plan || 'free';
        const planLimits = PLAN_LIMITS[plan];
        if (!planLimits) {
            return res.status(400).json({ error: 'Plano inválido' });
        }
        // Verificar se o usuário pode criar mais bots
        if (req.method === 'POST' && req.path === '/bots') {
            const currentBotCount = await getUserBotCount(storage, user.id);
            if (currentBotCount >= planLimits.maxBots) {
                return res.status(403).json({
                    error: 'Limite de bots atingido',
                    message: `Seu plano ${plan} permite apenas ${planLimits.maxBots} bots. Faça upgrade para criar mais bots.`
                });
            }
        }
        // Verificar se o usuário tem acesso à funcionalidade
        const feature = getFeatureFromPath(req.path);
        if (feature && !planLimits.features.includes(feature)) {
            return res.status(403).json({
                error: 'Funcionalidade não disponível',
                message: `A funcionalidade ${feature} não está disponível no seu plano ${plan}. Faça upgrade para acessar.`
            });
        }
        next();
    };
}
function getFeatureFromPath(path) {
    const featureMap = {
        '/api': 'api_access',
        '/notifications/telegram': 'telegram_notifications',
        '/trading/advanced': 'advanced_trading',
        '/white-label': 'white_label'
    };
    return Object.entries(featureMap).find(([prefix]) => path.startsWith(prefix))?.[1] || null;
}
async function getUserBotCount(storage, userId) {
    const bots = await storage.getBots();
    // Filtra os bots pelo owner (que é o userId)
    return bots.filter(bot => bot.config?.owner === userId).length;
}
// Exportar a função checkPlanLimits com a instância padrão do storage
export const checkPlanLimits = createPlanLimitsMiddleware(ServerStorage.getInstance());
