declare module 'cloudflare:workers' {
    import type { KVNamespace } from '@cloudflare/workers-types';

    export const env: {
        CACHE: KVNamespace;
    };
}
