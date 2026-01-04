// Runtime detection of Cloudflare Workers environment
// Workers have specific global objects like caches and WebSocketPair
export const isWorker = globalThis.caches !== undefined && (globalThis as unknown as Record<string, unknown>).WebSocketPair !== undefined;
