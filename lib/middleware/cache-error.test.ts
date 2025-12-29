import { describe, expect, it, vi } from 'vitest';

const setSpy = vi.fn(() => null);
const getSpy = vi.fn(() => null);

vi.mock('xxhash-wasm', () => ({
    default: () =>
        Promise.resolve({
            h64ToString: () => 'hash',
        }),
}));

vi.mock('@/utils/cache/index', () => ({
    default: {
        status: { available: true },
        globalCache: {
            get: getSpy,
            set: setSpy,
        },
    },
}));

describe('cache middleware', () => {
    it('clears control key when downstream throws', async () => {
        const { default: cacheMiddleware } = await import('@/middleware/cache');

        const ctx = {
            req: {
                path: '/test',
                query: () => null,
            },
            res: {
                headers: new Headers(),
            },
            status: vi.fn(),
            header: vi.fn(),
            set: vi.fn(),
            get: vi.fn(),
        };

        await expect(
            cacheMiddleware(ctx as any, () => {
                throw new Error('boom');
            })
        ).rejects.toThrow('boom');

        expect(setSpy.mock.calls.some(([, value]) => value === '0')).toBe(true);
    });
});
