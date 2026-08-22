// Runtime detection of Cloudflare Workers environment
// Workers have specific global objects like caches and WebSocketPair
export const isWorker = 'caches' in globalThis && 'WebSocketPair' in globalThis;
