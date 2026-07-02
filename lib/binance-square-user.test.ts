import { beforeEach, describe, expect, it, vi } from 'vitest';

const ofetchMock = vi.fn();
const tryGetMock = vi.fn();

vi.mock('@/utils/ofetch', () => ({
    default: ofetchMock,
}));

vi.mock('@/utils/cache', () => ({
    default: {
        tryGet: tryGetMock,
    },
}));

vi.mock('@/config', () => ({
    config: {
        trueUA: 'test-user-agent',
    },
}));

const createContext = (username: string, routeParams?: string, limit?: string) => {
    const json: Record<string, unknown> = {};

    return {
        req: {
            param: (name: string) => {
                if (name === 'username') {
                    return username;
                }
                if (name === 'routeParams') {
                    return routeParams;
                }
            },
            query: (name: string) => {
                if (name === 'limit') {
                    return limit;
                }
            },
        },
        set: (_key: string, value: unknown) => {
            Object.assign(json, value as Record<string, unknown>);
        },
        get jsonData() {
            return json;
        },
    };
};

describe('/binance/square/user/:username', () => {
    beforeEach(() => {
        vi.resetModules();
        ofetchMock.mockReset();
        tryGetMock.mockReset();
    });

    it('maps posts into feed items and uses profile username from API', async () => {
        tryGetMock.mockImplementation((_key, fetcher) => fetcher());
        ofetchMock
            .mockResolvedValueOnce({
                code: '000000',
                data: {
                    squareUid: 'uid-1',
                    displayName: 'CZ',
                    username: 'CZ',
                    avatar: 'https://public.bnbstatic.com/avatar.jpg',
                },
            })
            .mockResolvedValueOnce({
                code: '000000',
                success: true,
                data: {
                    contents: [
                        {
                            id: 1,
                            bodyTextOnly: 'Hello Square',
                            createTime: 1_770_000_000_000,
                            webLink: 'https://www.binance.com/en/square/post/1',
                            displayName: 'CZ',
                            commentCount: 10,
                            likeCount: 20,
                        },
                        {
                            id: 2,
                            displayName: 'CZ',
                            imageMetaList: [{ url: 'https://public.bnbstatic.com/image.png' }],
                            createTime: 1_770_000_000_001,
                            webLink: 'https://www.binance.com/en/square/post/2',
                        },
                    ],
                },
            });

        const { route } = await import('@/routes/binance/square-user');
        const ctx = createContext('cz');
        const result = await route.handler(ctx as any);

        expect(result.title).toBe('CZ (@CZ) — Binance Square');
        expect(result.link).toBe('https://www.binance.com/en/square/profile/CZ');
        expect(result.item).toHaveLength(2);
        expect(result.item?.[0]?.title).toBe('Hello Square');
        expect(result.item?.[1]?.title).toBe("CZ's post");
        expect(ofetchMock).toHaveBeenCalledTimes(2);
        expect(ofetchMock.mock.calls[1]?.[0]).toContain('filterType=ALL');
    });

    it('parses filter from routeParams', async () => {
        tryGetMock.mockImplementation((_key, fetcher) => fetcher());
        ofetchMock
            .mockResolvedValueOnce({
                code: '000000',
                data: {
                    squareUid: 'uid-1',
                    displayName: 'CZ',
                    username: 'CZ',
                },
            })
            .mockResolvedValueOnce({
                code: '000000',
                success: true,
                data: { contents: [] },
            });

        const { route } = await import('@/routes/binance/square-user');
        await route.handler(createContext('cz', 'filter=quote') as any);

        expect(ofetchMock.mock.calls[1]?.[0]).toContain('filterType=QUOTE');
    });

    it('throws when profile is not found', async () => {
        tryGetMock.mockImplementation((_key, fetcher) => fetcher());
        ofetchMock.mockResolvedValueOnce({
            code: '000000',
            data: { squareUid: null },
        });

        const { route } = await import('@/routes/binance/square-user');

        await expect(route.handler(createContext('missing-user') as any)).rejects.toThrow('not found on Binance Square');
    });

    it('throws when posts API fails', async () => {
        tryGetMock.mockImplementation((_key, fetcher) => fetcher());
        ofetchMock
            .mockResolvedValueOnce({
                code: '000000',
                data: {
                    squareUid: 'uid-1',
                    displayName: 'CZ',
                    username: 'CZ',
                },
            })
            .mockResolvedValueOnce({
                code: '000002',
                success: false,
                message: 'illegal parameter',
                data: null,
            });

        const { route } = await import('@/routes/binance/square-user');

        await expect(route.handler(createContext('cz') as any)).rejects.toThrow('illegal parameter');
    });

    it('respects limit query parameter', async () => {
        tryGetMock.mockImplementation((_key, fetcher) => fetcher());
        ofetchMock
            .mockResolvedValueOnce({
                code: '000000',
                data: {
                    squareUid: 'uid-1',
                    displayName: 'CZ',
                    username: 'CZ',
                },
            })
            .mockResolvedValueOnce({
                code: '000000',
                success: true,
                data: {
                    contents: Array.from({ length: 10 }, (_, index) => ({
                        id: index,
                        bodyTextOnly: `Post ${index}`,
                        createTime: 1_770_000_000_000 + index,
                        webLink: `https://www.binance.com/en/square/post/${index}`,
                    })),
                },
            });

        const { route } = await import('@/routes/binance/square-user');
        const result = await route.handler(createContext('cz', undefined, '3') as any);

        expect(result.item).toHaveLength(3);
    });

    it('passes language headers when lang=zh-CN', async () => {
        tryGetMock.mockImplementation((_key, fetcher) => fetcher());
        ofetchMock
            .mockResolvedValueOnce({
                code: '000000',
                data: {
                    squareUid: 'uid-1',
                    displayName: 'CZ',
                    username: 'CZ',
                },
            })
            .mockResolvedValueOnce({
                code: '000000',
                success: true,
                data: { contents: [] },
            });

        const { route } = await import('@/routes/binance/square-user');
        const result = await route.handler(createContext('cz', 'lang=zh-CN') as any);

        expect(result.link).toBe('https://www.binance.com/zh-CN/square/profile/CZ');
        const postsHeaders = ofetchMock.mock.calls[1]?.[1]?.headers;
        expect(postsHeaders?.lang).toBe('zh-CN');
        expect(postsHeaders?.['Accept-Language']).toBe('zh-CN');
        expect(postsHeaders?.Referer).toBe('https://www.binance.com/zh-CN/square/profile/cz');
    });

    it('uses translatedData content when language is not English', async () => {
        tryGetMock.mockImplementation((_key, fetcher) => fetcher());
        ofetchMock
            .mockResolvedValueOnce({
                code: '000000',
                data: {
                    squareUid: 'uid-1',
                    displayName: 'CZ',
                    username: 'CZ',
                },
            })
            .mockResolvedValueOnce({
                code: '000000',
                success: true,
                data: {
                    contents: [
                        {
                            id: 3,
                            bodyTextOnly: 'English body',
                            translatedData: {
                                content: '中文正文',
                            },
                            createTime: 1_770_000_000_000,
                            webLink: 'https://www.binance.com/zh-CN/square/post/3',
                        },
                    ],
                },
            });

        const { route } = await import('@/routes/binance/square-user');
        const result = await route.handler(createContext('cz', 'lang=zh-CN') as any);

        expect(result.item?.[0]?.title).toBe('中文正文');
        expect(result.item?.[0]?.description).toContain('中文正文');
        expect(result.item?.[0]?.description).not.toContain('English body');
    });

    it('supports combined filter and language routeParams', async () => {
        tryGetMock.mockImplementation((_key, fetcher) => fetcher());
        ofetchMock
            .mockResolvedValueOnce({
                code: '000000',
                data: {
                    squareUid: 'uid-1',
                    displayName: 'CZ',
                    username: 'CZ',
                },
            })
            .mockResolvedValueOnce({
                code: '000000',
                success: true,
                data: { contents: [] },
            });

        const { route } = await import('@/routes/binance/square-user');
        await route.handler(createContext('cz', 'filter=quote&lang=zh-CN') as any);

        expect(ofetchMock.mock.calls[1]?.[0]).toContain('filterType=QUOTE');
        expect(ofetchMock.mock.calls[1]?.[1]?.headers?.lang).toBe('zh-CN');
    });

    it('normalizes language aliases from routeParams', async () => {
        tryGetMock.mockImplementation((_key, fetcher) => fetcher());
        ofetchMock
            .mockResolvedValueOnce({
                code: '000000',
                data: {
                    squareUid: 'uid-1',
                    displayName: 'CZ',
                    username: 'CZ',
                },
            })
            .mockResolvedValueOnce({
                code: '000000',
                success: true,
                data: { contents: [] },
            });

        const { route } = await import('@/routes/binance/square-user');
        const result = await route.handler(createContext('cz', 'lang=zh') as any);

        expect(result.link).toBe('https://www.binance.com/zh-CN/square/profile/CZ');
        expect(ofetchMock.mock.calls[1]?.[1]?.headers?.lang).toBe('zh-CN');
    });
});
