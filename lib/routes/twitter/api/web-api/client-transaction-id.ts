import { ClientTransaction, fetchXDocument } from 'x-client-transaction-id';

import { config } from '@/config';
import cache from '@/utils/cache';

const cacheKey = 'twitter:x-client-transaction';

const fetchClientTransactionKeys = async () => {
    const document = await fetchXDocument();
    const { key, animationKey } = (await ClientTransaction.create(document)) as unknown as { key: string; animationKey: string };
    return { key, animationKey };
};

// `refresh` skips the cached keys and overwrites them; used after X rejects a transaction id with 404.
const getClientTransactionKeys = async (refresh: boolean) => {
    if (!refresh) {
        return cache.tryGet(cacheKey, fetchClientTransactionKeys, config.cache.contentExpire, false);
    }
    const keys = await fetchClientTransactionKeys();
    await cache.set(cacheKey, JSON.stringify(keys));
    return keys;
};

export const getClientTransactionId = async (method: string, path: string, refresh = false) => {
    const { key, animationKey } = await getClientTransactionKeys(refresh);
    const clientTransaction = Object.assign(Object.create(ClientTransaction.prototype), { isInitialized: true });
    return clientTransaction.generateTransactionId(method, path, undefined, key, animationKey);
};
