// No-op shim for @sentry/node in Cloudflare Workers
type Scope = {
    setTag: (key: string, value: string) => void;
};

export const withScope = (callback: (scope: Scope) => void) => callback({ setTag: () => {} });
export const captureException = () => {};
