import { ClientTransaction, fetchXDocument } from 'x-client-transaction-id';

import { config } from '@/config';
import cache from '@/utils/cache';
import logger from '@/utils/logger';

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
    try {
        const { key, animationKey } = await getClientTransactionKeys();
        const clientTransaction = Object.assign(Object.create(ClientTransaction.prototype), { isInitialized: true });
        return await clientTransaction.generateTransactionId(method, path, undefined, key, animationKey);
    } catch (error) {
        logger.error(`twitter: failed to generate x-client-transaction-id: ${error}`);
    }
};
