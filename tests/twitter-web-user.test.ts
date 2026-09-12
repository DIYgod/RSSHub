import { beforeEach, describe, expect, it, vi } from 'vitest';

import { config } from '../lib/config';
import InvalidParameterError from '../lib/errors/types/invalid-parameter';
import api from '../lib/routes/twitter/api/web-api/api';
import { gatherLegacyFromData, paginationTweets, twitterGot } from '../lib/routes/twitter/api/web-api/utils';
import cache from '../lib/utils/cache';
import ofetch from '../lib/utils/ofetch';

vi.mock('../lib/config', () => ({ config: { twitter: {}, cache: { routeExpire: 300 } } }));
vi.mock('../lib/utils/cache', () => ({ default: { tryGet: vi.fn(), set: vi.fn() } }));
vi.mock('../lib/utils/ofetch', () => ({ default: vi.fn() }));
vi.mock('../lib/routes/twitter/utils', () => ({ getTwitterUserCacheKey: vi.fn(() => 'tweet-cache') }));
vi.mock('../lib/routes/twitter/api/web-api/constants', () => ({
    baseUrl: 'https://x.com/i/api',
    gqlMap: { UserByScreenName: '/graphql/user-by-name', UserByRestId: '/graphql/user-by-id' },
    gqlFeatures: { UserByScreenName: {}, UserByRestId: {} },
    initGqlMap: vi.fn(),
}));
vi.mock('../lib/routes/twitter/api/web-api/utils', () => ({ twitterGot: vi.fn(), paginationTweets: vi.fn(), gatherLegacyFromData: vi.fn() }));

const cached = new Map<string, unknown>();
const user = {
    data: {
        user: {
            result: {
                __typename: 'User',
                rest_id: '123',
                core: { name: 'Example', screen_name: 'example' },
                avatar: { image_url: 'https://example.com/avatar.png' },
                profile_bio: { description: 'Example bio' },
            },
        },
    },
};

beforeEach(() => {
    vi.clearAllMocks();
    cached.clear();
    config.twitter.thirdPartyApi = undefined;
    vi.mocked(cache.tryGet).mockImplementation(async (key, fetchValue) => {
        if (cached.has(key)) {
            return cached.get(key);
        }
        const value = await fetchValue();
        cached.set(key, value);
        return value;
    });
    vi.mocked(twitterGot).mockResolvedValue(structuredClone(user));
    vi.mocked(ofetch).mockResolvedValue(structuredClone(user));
});

describe('Twitter web user lookup', () => {
    it('preserves valid user metadata and caches only the verified web response', async () => {
        cached.set('twitter-userdata-example', { errors: [{ code: 88, message: 'Legacy cached failure' }] });
        expect(await api.getUser('example')).toEqual({
            name: 'Example',
            screen_name: 'example',
            profile_image_url: 'https://example.com/avatar.png',
            description: 'Example bio',
        });
        await api.getUser('example');
        expect(twitterGot).toHaveBeenCalledTimes(1);
        expect(cache.tryGet).toHaveBeenCalledWith('twitter:web:userdata:v2:example', expect.any(Function));
        expect(cached.get('twitter-userdata-example')).toEqual({ errors: [{ code: 88, message: 'Legacy cached failure' }] });
        expect(cache.set).not.toHaveBeenCalled();
    });

    it.each([
        [{ errors: [{ code: 88, message: 'Private upstream details' }] }, 'Twitter API user lookup failed (codes: 88)'],
        [{ ...user, errors: [{ code: 89 }] }, 'Twitter API user lookup failed (codes: 89)'],
        [{ errors: [{ message: 'Private upstream details' }] }, 'Twitter API user lookup failed'],
        [{ errors: { message: 'Malformed errors' } }, 'Twitter API user lookup failed'],
        [{ code: 500, message: 'Private provider error details' }, 'Twitter API user lookup failed (code: 500)'],
        [{ code: 404, message: 'Unrecognized provider error' }, 'Twitter API user lookup failed (code: 404)'],
        [{ code: 429, message: 'Private rate-limit details' }, 'Twitter API user lookup failed (code: 429)'],
        [{ data: {} }, 'Twitter API returned an incomplete user response'],
        [{ data: { user: {} } }, 'Twitter API returned an incomplete user response'],
        [{ data: { user: { result: { __typename: 'User' } } } }, 'Twitter API returned an incomplete user response'],
        [undefined, 'Twitter API returned an incomplete user response'],
        ['<html>Unexpected upstream response</html>', 'Twitter API returned an incomplete user response'],
    ])('rejects an upstream failure without caching or reporting a missing account', async (response, message) => {
        vi.mocked(twitterGot).mockResolvedValueOnce(response);
        let result: unknown;
        try {
            await api.getUser('example');
        } catch (error) {
            result = error;
        }
        expect(result).toBeInstanceOf(Error);
        expect(result).not.toBeInstanceOf(InvalidParameterError);
        expect((result as Error).message).toBe(message);
        expect(cached.size).toBe(0);
        expect(cache.set).not.toHaveBeenCalled();
    });

    it.each([
        [{ data: { user: null } }, "This account doesn't exist"],
        [{ data: { user: { result: null } } }, "This account doesn't exist"],
        [{ data: { user: { result: { __typename: 'UserUnavailable', message: 'Upstream details' } } } }, 'Twitter user is unavailable'],
    ])('distinguishes an explicitly missing or unavailable user', async (response, message) => {
        vi.mocked(twitterGot).mockResolvedValueOnce(response);
        await expect(api.getUser('example')).rejects.toThrow(new InvalidParameterError(message));
        expect(cached.size).toBe(0);
    });

    it('classifies the observed HTTP-200 provider not-found envelope without caching it', async () => {
        config.twitter.thirdPartyApi = 'https://api.example.com';
        vi.mocked(ofetch).mockResolvedValueOnce({ code: 404, message: 'User not found' });
        await expect(api.getUser('example')).rejects.toThrow(new InvalidParameterError('Twitter API could not find this user'));
        expect(cached.size).toBe(0);
        expect(cache.set).not.toHaveBeenCalled();
        expect(twitterGot).not.toHaveBeenCalled();
    });

    it('retries normally after a GraphQL error and accepts an empty errors array', async () => {
        vi.mocked(twitterGot)
            .mockResolvedValueOnce({ errors: [{ code: 88 }] })
            .mockResolvedValueOnce({ ...user, errors: [] });
        await expect(api.getUser('example')).rejects.toThrow('Twitter API user lookup failed');
        expect((await api.getUser('example')).name).toBe('Example');
        expect(twitterGot).toHaveBeenCalledTimes(2);
    });

    it('validates cached data before dereferencing it', async () => {
        cached.set('twitter:web:userdata:v2:example', { data: {} });
        await expect(api.getUser('example')).rejects.toThrow('Twitter API returned an incomplete user response');
        expect(twitterGot).not.toHaveBeenCalled();
        expect(cache.set).not.toHaveBeenCalled();
    });

    it('preserves numeric-ID lookup parameters and auth requirements', async () => {
        await api.getUser('+123');
        expect(twitterGot).toHaveBeenCalledWith('https://x.com/i/api/graphql/user-by-id', expect.objectContaining({ variables: JSON.stringify({ userId: '123', withSafetyModeUserFields: true }) }), {
            allowNoAuth: false,
        });
    });

    it('validates third-party GraphQL errors without calling the direct API', async () => {
        config.twitter.thirdPartyApi = 'https://api.example.com';
        vi.mocked(ofetch).mockResolvedValueOnce({ errors: [{ code: 88 }] });
        await expect(api.getUser('example')).rejects.toThrow('Twitter API user lookup failed (codes: 88)');
        expect(cached.size).toBe(0);
        expect(twitterGot).not.toHaveBeenCalled();
        expect(ofetch).toHaveBeenCalledWith('https://api.example.com/graphql/user-by-name', expect.objectContaining({ method: 'GET' }));
    });

    it('does not request tweets or write an empty legacy cache entry when user lookup fails', async () => {
        vi.mocked(twitterGot).mockResolvedValueOnce({ errors: [{ code: 88 }] });
        await expect(api.getUserTweets('example')).rejects.toThrow('Twitter API user lookup failed');
        expect(paginationTweets).not.toHaveBeenCalled();
        expect(cache.set).not.toHaveBeenCalled();
        expect(cached.size).toBe(0);
    });

    it('passes a verified user ID to the existing tweet cache and mapper', async () => {
        vi.mocked(paginationTweets).mockResolvedValueOnce({ tweets: 'upstream result' });
        vi.mocked(gatherLegacyFromData).mockReturnValueOnce([{ id_str: 'tweet-1' }]);
        expect(await api.getUserTweets('example')).toEqual([{ id_str: 'tweet-1' }]);
        expect(paginationTweets).toHaveBeenCalledWith('UserTweets', '123', expect.objectContaining({ count: 20 }));
        expect(cache.tryGet).toHaveBeenCalledWith('tweet-cache', expect.any(Function), 300, false);
    });
});
