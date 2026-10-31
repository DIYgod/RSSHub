import type * as Undici from 'undici';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { fetchMock, getClientTransactionIdMock } = vi.hoisted(() => ({
    fetchMock: vi.fn(),
    getClientTransactionIdMock: vi.fn(),
}));

vi.mock('undici', async (importOriginal) => {
    const actual = await importOriginal<typeof Undici>();
    return { ...actual, default: { ...actual, fetch: fetchMock } };
});
vi.mock('@/utils/ofetch', () => ({ default: vi.fn().mockResolvedValue('') }));
vi.mock('./client-transaction-id', () => ({ getClientTransactionId: getClientTransactionIdMock }));

const { twitterGot } = await import('./utils');

const response = (status: number, body: Record<string, string> = {}) => Response.json(body, { status });

describe('twitterGot x-client-transaction-id', () => {
    beforeEach(() => {
        fetchMock.mockReset();
        getClientTransactionIdMock.mockReset();
        getClientTransactionIdMock.mockResolvedValue('tid');
    });

    it('refreshes transaction keys and retries once on 404', async () => {
        fetchMock.mockResolvedValueOnce(response(404)).mockResolvedValueOnce(response(200, { data: 'ok' }));

        const data = await twitterGot('https://x.com/i/api/graphql/abc/UserTweetsAndReplies', {}, { allowNoAuth: true });

        expect(data).toEqual({ data: 'ok' });
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(getClientTransactionIdMock.mock.calls).toEqual([
            ['GET', '/i/api/graphql/abc/UserTweetsAndReplies', undefined],
            ['GET', '/i/api/graphql/abc/UserTweetsAndReplies', true],
        ]);
    });

    it('throws after the retry also gets 404', async () => {
        fetchMock.mockResolvedValue(response(404));

        await expect(twitterGot('https://x.com/i/api/graphql/abc/SearchTimeline', {}, { allowNoAuth: true })).rejects.toThrow('Twitter API error: 404');
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('does not retry endpoints without a transaction id', async () => {
        fetchMock.mockResolvedValue(response(404));

        await expect(twitterGot('https://x.com/i/api/graphql/abc/UserTweets', {}, { allowNoAuth: true })).rejects.toThrow('Twitter API error: 404');
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(getClientTransactionIdMock).not.toHaveBeenCalled();
    });
});
