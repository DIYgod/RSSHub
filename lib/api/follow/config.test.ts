import { describe, expect, it, vi } from 'vitest';

interface FollowConfigPayload {
    ownerUserId?: string;
    description?: string;
    price?: number;
    userLimit?: number;
    cacheTime: number;
    gitHash: string;
    gitDate?: number;
}

describe('api/follow/config', () => {
    it('returns follow config payload', async () => {
        process.env.FOLLOW_OWNER_USER_ID = 'owner';
        process.env.FOLLOW_DESCRIPTION = 'desc';
        process.env.FOLLOW_PRICE = '123';
        process.env.FOLLOW_USER_LIMIT = '10';

        vi.resetModules();
        const { default: api } = await import('@/api');

        const response = await api.request('/follow/config');
        expect(response.status).toBe(200);
        const result: FollowConfigPayload = await response.json();

        expect(result).toMatchObject({
            ownerUserId: 'owner',
            description: 'desc',
            price: 123,
            userLimit: 10,
        });
        expect(result.cacheTime).toEqual(expect.any(Number));
        expect(result.gitHash).toEqual(expect.any(String));

        delete process.env.FOLLOW_OWNER_USER_ID;
        delete process.env.FOLLOW_DESCRIPTION;
        delete process.env.FOLLOW_PRICE;
        delete process.env.FOLLOW_USER_LIMIT;
    });
});
