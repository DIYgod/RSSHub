import { ClientTransaction, fetchXDocument } from 'x-client-transaction-id';

let clientTransactionPromise: Promise<ClientTransaction> | undefined;

const buildClientTransaction = async () => ClientTransaction.create(await fetchXDocument());

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
