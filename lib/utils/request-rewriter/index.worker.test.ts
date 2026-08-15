import { describe, expect, it } from 'vitest';

describe('worker request-rewriter', () => {
    it('replaces globalThis.fetch with the wrapped fetch', async () => {
        const { default: wrappedFetch } = await import('@/utils/request-rewriter/fetch.worker');
        await import('@/utils/request-rewriter/index.worker');

        expect(fetch).toBe(wrappedFetch);
    });
});
