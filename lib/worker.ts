// Cloudflare Worker entry point
// This file contains Worker-specific initialization and polyfills

// Initialize request-rewriter (sets up fetch wrapper with proper headers)
import '@/utils/request-rewriter';

// Polyfill MessagePort for undici compatibility
// undici uses MessagePort for type checking in webidl
if (globalThis.MessagePort === undefined) {
    // @ts-expect-error Minimal polyfill for undici compatibility
    globalThis.MessagePort = class MessagePort extends EventTarget {
        onmessage: ((event: MessageEvent) => void) | null = null;
        onmessageerror: ((event: MessageEvent) => void) | null = null;
        start() {}
        close() {}
        postMessage(_message: unknown, _transfer?: Transferable[]) {}
    };
}

// Import and re-export the main app
// Worker-specific module replacements are handled by tsdown aliases
export { default } from './app.worker';
