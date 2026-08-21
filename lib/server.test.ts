import { describe, expect, it } from 'vitest';

describe('server', () => {
    it('exports server entrypoint', async () => {
        const server = (await import('@/server')).default;
        expect(typeof server.request).toBe('function');
    });
});
