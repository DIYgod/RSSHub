import { ClientTransaction, fetchXDocument } from 'x-client-transaction-id';

import { config } from '@/config';
import cache from '@/utils/cache';

const getClientTransactionKeys = () =>
    cache.tryGet(
        'twitter:x-client-transaction',
        async () => {
            const document = await fetchXDocument();
            const { key, animationKey } = (await ClientTransaction.create(document)) as unknown as { key: string; animationKey: string };
            return { key, animationKey };
        },
        config.cache.contentExpire,
        false
    );

export const getClientTransactionId = async (method: string, path: string) => {
    const { key, animationKey } = await getClientTransactionKeys();
    const clientTransaction = Object.assign(Object.create(ClientTransaction.prototype), { isInitialized: true });
    return clientTransaction.generateTransactionId(method, path, undefined, key, animationKey);
};
