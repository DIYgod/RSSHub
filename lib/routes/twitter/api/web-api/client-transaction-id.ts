import { ClientTransaction, fetchXDocument } from 'x-client-transaction-id';

import { config } from '@/config';
import logger from '@/utils/logger';

let clientTransactionPromise: Promise<ClientTransaction> | undefined;
let clientTransactionBuiltAt = 0;

const buildClientTransaction = async () => ClientTransaction.create(await fetchXDocument());

const getClientTransaction = () => {
    const now = Date.now();
    if (!clientTransactionPromise || now - clientTransactionBuiltAt > config.cache.contentExpire * 1000) {
        clientTransactionBuiltAt = now;
        clientTransactionPromise = buildClientTransaction();
    }
    return clientTransactionPromise;
};

export const getClientTransactionId = async (method: string, path: string) => {
    try {
        const clientTransaction = await getClientTransaction();
        return await clientTransaction.generateTransactionId(method, path);
    } catch (error) {
        logger.error(`twitter: failed to generate x-client-transaction-id: ${error}`);
        clientTransactionPromise = undefined;
        clientTransactionBuiltAt = 0;
    }
};
