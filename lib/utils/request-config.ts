import { AsyncLocalStorage } from 'node:async_hooks';

// Request-scoped overrides of config values, e.g. credentials supplied by the client of a self-hosted instance.
// Kept free of other imports so that `@/config` can read it without a circular dependency.
export type RequestConfigOverrides = Record<string, Record<string, unknown>>;

type RequestConfigStore = {
    overrides: RequestConfigOverrides;
    merged: Map<string, object>;
};

const storage = new AsyncLocalStorage<RequestConfigStore>();

export const runWithRequestConfig = <T>(overrides: RequestConfigOverrides, callback: () => T): T => storage.run({ overrides, merged: new Map() }, callback);

/**
 * Returns the config namespace as seen by the current request: the instance values with the request-scoped
 * overrides applied on top. Outside of a request-scoped run, or for a namespace without overrides, `base` is returned as is.
 */
export const applyRequestConfig = <T extends object>(namespace: string, base: T): T => {
    const store = storage.getStore();
    const overrides = store?.overrides[namespace];
    if (!store || !overrides) {
        return base;
    }
    let merged = store.merged.get(namespace);
    if (!merged) {
        merged = { ...base, ...overrides };
        store.merged.set(namespace, merged);
    }
    return merged as T;
};
