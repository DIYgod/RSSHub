// Worker-compatible request-rewriter
// Only wraps globalThis.fetch, http/https not needed in Workers
import fetch from '@/utils/request-rewriter/fetch';

Object.defineProperties(globalThis, {
    fetch: { value: fetch, writable: true, configurable: true },
});
