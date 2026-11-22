import { AsyncLocalStorage } from 'node:async_hooks';

type RequestEnv = Record<string, string>;
type RequestConfigStore = { env: RequestEnv; config?: object };

const storage = new AsyncLocalStorage<RequestConfigStore>();

export const runWithRequestEnv = <T>(env: RequestEnv, callback: () => T): T => storage.run({ env }, callback);

export const getRequestConfig = <T extends object>(build: (env: RequestEnv) => T): T | undefined => {
    const store = storage.getStore();
    if (!store) {
        return;
    }
    store.config ??= build(store.env);
    return store.config as T;
};
