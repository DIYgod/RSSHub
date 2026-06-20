import { describe, expect, it } from 'vitest';

describe('entrypoints', () => {
    it('exports app entrypoint', async () => {
        const app = (await import('@/app')).default;
        expect(typeof app.request).toBe('function');
    });

    it('exports server entrypoint', async () => {
        const server = (await import('@/server')).default;
        expect(typeof server.request).toBe('function');
    });
});
