import { describe, expect, it, vi } from 'vitest';

describe('api/follow/config', () => {
    it('returns follow config payload', async () => {
        process.env.FOLLOW_OWNER_USER_ID = 'owner';
        process.env.FOLLOW_DESCRIPTION = 'desc';
        process.env.FOLLOW_PRICE = '123';
        process.env.FOLLOW_USER_LIMIT = '10';

        vi.resetModules();
        const { handler } = await import('@/api/follow/config');

        const ctx = {
            json: (data: unknown) => data,
        };

        const result = handler(ctx as any) as Record<string, unknown>;

        expect(result).toMatchObject({
            ownerUserId: 'owner',
            description: 'desc',
            price: 123,
            userLimit: 10,
        });
        expect(typeof result.cacheTime).toBe('number');
        expect(typeof result.gitHash).toBe('string');

        delete process.env.FOLLOW_OWNER_USER_ID;
        delete process.env.FOLLOW_DESCRIPTION;
        delete process.env.FOLLOW_PRICE;
        delete process.env.FOLLOW_USER_LIMIT;
    });
});
