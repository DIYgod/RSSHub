// No-op shim for @sentry/node in Cloudflare Workers
export const withScope = (callback: (scope: unknown) => void) => callback({});
export const captureException = () => {};
