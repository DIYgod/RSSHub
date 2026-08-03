import { beforeEach, describe, expect, it, vi } from 'vitest';

import developerApi from '@/routes/twitter/api/developer-api/api';
import webApi from '@/routes/twitter/api/web-api/api';
import { getTwitterUserCacheKey } from '@/utils/twitter-cache-key';

const mocks = vi.hoisted(() => ({
    tryGet: vi.fn(),
    set: vi.fn(),
    userData: undefined as unknown,
}));

vi.mock('@/utils/cache', () => ({
    default: {
        clients: {
            redisClient: null,
        },
        tryGet: mocks.tryGet,
        set: mocks.set,
    },
}));

beforeEach(() => {
    mocks.tryGet.mockReset();
    mocks.set.mockReset();
    mocks.tryGet.mockImplementation((key: string) => Promise.resolve(key.startsWith('twitter-userdata-') ? mocks.userData : key));
});

describe('Twitter user timeline cache keys', () => {
    it('preserves the existing user and parameter key segments', () => {
        expect(getTwitterUserCacheKey('123', 'getUserTweets', { count: 17 })).toBe('twitter:123:getUserTweets:{"count":17}');
    });

    it('separates web API operations for the same user and parameters', async () => {
        mocks.userData = { data: { user: { result: { rest_id: '123' } } } };
        const params = { count: 17 };

        const keys = await Promise.all([
            webApi.getUserTweets('RSSHub', params),
            webApi.getUserTweetsAndReplies('RSSHub', params),
            webApi.getUserMedia('RSSHub', params),
            webApi.getUserLikes('RSSHub', params),
            webApi.getUserTweet('RSSHub', params),
        ]);

        expect(keys).toEqual([
            'twitter:123:getUserTweets:{"count":17}',
            'twitter:123:getUserTweetsAndReplies:{"count":17}',
            'twitter:123:getUserMedia:{"count":17}',
            'twitter:123:getUserLikes:{"count":17}',
            'twitter:123:getUserTweet:{"count":17}',
        ]);
        expect(new Set(keys).size).toBe(keys.length);
    });

    it('separates developer API operations for the same user and parameters', async () => {
        mocks.userData = { id_str: '123' };
        const params = { count: 17 };

        const keys = await Promise.all([
            developerApi.getUserTweets('RSSHub', params),
            developerApi.getUserTweetsAndReplies('RSSHub', params),
            developerApi.getUserMedia('RSSHub', params),
            developerApi.getUserLikes('RSSHub', params),
            developerApi.getUserTweet('RSSHub', params),
        ]);

        expect(keys).toEqual([
            'twitter:123:getUserTweets:{"count":17}',
            'twitter:123:getUserTweetsAndReplies:{"count":17}',
            'twitter:123:getUserMedia:{"count":17}',
            'twitter:123:getUserLikes:{"count":17}',
            'twitter:123:getUserTweet:{"count":17}',
        ]);
        expect(new Set(keys).size).toBe(keys.length);
    });
});
