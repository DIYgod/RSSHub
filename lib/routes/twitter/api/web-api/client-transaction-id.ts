import { ClientTransaction, fetchXDocument } from 'x-client-transaction-id';

import { config } from '@/config';
import cache from '@/utils/cache';

// v2: entries cached by the pre-0.3 shim are `{}` and would leave `keyBytes` undefined until they expire.
const cacheKey = 'twitter:x-client-transaction:v2';

// `x-client-transaction-id` >= 0.3 keeps the derived keys in a (private) `keys` field and `generateTransactionId`
// throws `ClientTransactionNotInitializedError` unless it is set. `keys` is plain JSON, so it can go through the cache.
type ClientTransactionKeys = { keyBytes: number[]; animationKey: string };

const fetchClientTransactionKeys = async (): Promise<ClientTransactionKeys> => {
    const document = await fetchXDocument();
    const clientTransaction = (await ClientTransaction.create(document)) as unknown as { keys: ClientTransactionKeys };
    return clientTransaction.keys;
};

// `refresh` skips the cached keys and overwrites them; used after X rejects a transaction id with 404.
const getClientTransactionKeys = async (refresh: boolean): Promise<ClientTransactionKeys> => {
    if (!refresh) {
        return cache.tryGet(cacheKey, fetchClientTransactionKeys, config.cache.contentExpire, false);
    }
    const keys = await fetchClientTransactionKeys();
    await cache.set(cacheKey, JSON.stringify(keys));
    return keys;
};

export const getClientTransactionId = async (method: string, path: string, refresh = false) => {
    const keys = await getClientTransactionKeys(refresh);
    const clientTransaction = Object.assign(Object.create(ClientTransaction.prototype), { keys });
    return clientTransaction.generateTransactionId(method, path);
};
