import { ClientTransaction, handleXMigration } from '@lami/x-client-transaction-id';

let clientTransactionPromise: Promise<ClientTransaction> | undefined;

const buildClientTransaction = async () => ClientTransaction.create(await handleXMigration());

const getClientTransaction = () => {
    clientTransactionPromise ??= buildClientTransaction();
    return clientTransactionPromise;
};

export const getClientTransactionId = async (method: string, path: string) => {
    try {
        const clientTransaction = await getClientTransaction();
        return await clientTransaction.generateTransactionId(method, path);
    } catch {
        clientTransactionPromise = undefined;
    }
};
