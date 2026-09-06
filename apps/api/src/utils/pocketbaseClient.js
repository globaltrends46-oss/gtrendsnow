import Pocketbase from 'pocketbase';
import logger from './logger.js';

const POCKETBASE_HOST = `http://localhost:8090`;

async function waitForHealth({ retries = 2, delayMs = 300 } = {}) {
    for (let i = 1; i <= retries; i++) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 800);
            const response = await fetch(`${POCKETBASE_HOST}/api/health`, { method: 'HEAD', signal: controller.signal });
            clearTimeout(timeout);

            if (response.ok) {
                return true;
            }
        } catch {
            // PocketBase not reachable yet
        }
        await new Promise((r) => setTimeout(r, delayMs));
    }
    return false;
}

const pocketbaseClient = new Pocketbase(POCKETBASE_HOST);

pocketbaseClient.autoCancellation(false);

let authPromise = null;

pocketbaseClient.beforeSend = async function (url, options) {
    if (url.includes('/api/collections/_superusers/auth-with-password')) {
        return { url, options };
    }

    const adminEmail = process.env.PB_SUPERUSER_EMAIL || process.env.POCKETBASE_ADMIN_EMAIL || "admin@gtrendsnow.com";
    const adminPassword = process.env.PB_SUPERUSER_PASSWORD || process.env.POCKETBASE_ADMIN_PASSWORD || "SecureAdminPass123!";

    if (!pocketbaseClient.authStore.isValid && !authPromise) {
        authPromise = pocketbaseClient.collection('_superusers').authWithPassword(
            adminEmail,
            adminPassword,
        ).finally(() => {
            authPromise = null;
        });
    }

    if (authPromise) {
        await authPromise;
    }

    if (pocketbaseClient.authStore.isValid && pocketbaseClient.authStore.token) {
        options.headers = options.headers || {};
        options.headers['Authorization'] = pocketbaseClient.authStore.token;
    }

    return { url, options };
};

(async () => {
    try {
        const isHealthy = await waitForHealth();
        if (!isHealthy) {
            logger.info('PocketBase server offline - using contentStore JSON storage');
            return;
        }

        const adminEmail = process.env.PB_SUPERUSER_EMAIL || process.env.POCKETBASE_ADMIN_EMAIL || "admin@gtrendsnow.com";
        const adminPassword = process.env.PB_SUPERUSER_PASSWORD || process.env.POCKETBASE_ADMIN_PASSWORD || "SecureAdminPass123!";

        if (!pocketbaseClient.authStore.isValid && !authPromise) {
            authPromise = pocketbaseClient.collection('_superusers').authWithPassword(
                adminEmail,
                adminPassword,
            ).finally(() => {
                authPromise = null;
            });
        }
        
        if (authPromise) {
            await authPromise;
        }
        
        logger.info('PocketBase client initialized successfully');
    } catch (err) {
        logger.info('PocketBase standalone mode active');
    }
})();

export default pocketbaseClient;
export { pocketbaseClient };
