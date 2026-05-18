import { beforeEach, describe, expect, it, vi } from 'vitest';

const cacheMock = {
    getCookie: vi.fn(),
    getConfiguredCookie: vi.fn(),
    getUsernameAndFaceFromUID: vi.fn(),
    getVideoSubtitleAttachment: vi.fn(),
};

const destroy = vi.fn();
const getPlaywrightPage = vi.fn();
const goto = vi.fn();
const on = vi.fn();
const setCookie = vi.fn();
const setRequestInterception = vi.fn();
const waitForResponse = vi.fn();

const page = {
    goto,
    on,
    setCookie,
    setRequestInterception,
    waitForResponse,
};

vi.mock('@/routes/bilibili/cache', () => ({
    default: cacheMock,
}));

vi.mock('@/utils/playwright', () => ({
    getPlaywrightPage,
}));

vi.mock('@/utils/logger', () => ({
    default: {
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
    },
}));

const createContext = () =>
    ({
        req: {
            param: (name: string) => {
                if (name === 'uid') {
                    return '646730844';
                }
            },
            query: (name: string) => {
                if (name === 'format') {
                    return 'json';
                }
            },
        },
    }) as any;

describe('/bilibili/user/video/:uid', () => {
    beforeEach(() => {
        vi.resetModules();
        cacheMock.getCookie.mockReset();
        cacheMock.getConfiguredCookie.mockReset();
        cacheMock.getUsernameAndFaceFromUID.mockReset();
        cacheMock.getVideoSubtitleAttachment.mockReset();
        destroy.mockReset();
        getPlaywrightPage.mockReset();
        goto.mockReset();
        on.mockReset();
        setCookie.mockReset();
        setRequestInterception.mockReset();
        waitForResponse.mockReset();
    });

    it('falls back to browser mode by opening the video page and reading a single video list response', async () => {
        cacheMock.getCookie.mockRejectedValueOnce(new Error('cookie unavailable'));
        cacheMock.getConfiguredCookie.mockReturnValue(undefined);
        cacheMock.getUsernameAndFaceFromUID.mockResolvedValue(['雷军', 'https://example.com/face.jpg']);
        cacheMock.getVideoSubtitleAttachment.mockResolvedValue([]);
        waitForResponse.mockResolvedValue({
            headers: () => ({ 'content-type': 'application/json; charset=utf-8' }),
            json: () => ({
                code: 0,
                data: {
                    list: {
                        vlist: [
                            {
                                aid: 1,
                                author: '雷军',
                                bvid: 'BV1xx411c7mD',
                                comment: 10,
                                created: 1_700_000_000,
                                description: 'video description',
                                length: '01:02',
                                pic: 'https://example.com/cover.jpg',
                                title: 'Video title',
                            },
                        ],
                    },
                },
            }),
            request: () => ({
                method: () => 'GET',
                resourceType: () => 'fetch',
            }),
            status: () => 200,
            url: () => 'https://api.bilibili.com/x/space/wbi/arc/search',
        });
        goto.mockResolvedValue(undefined);
        getPlaywrightPage.mockImplementation(async (_url, options) => {
            await options.onBeforeLoad?.(page);
            return {
                destroy,
                page,
            };
        });

        const { route } = await import('@/routes/bilibili/video');
        const data = await route.handler(createContext());

        expect(getPlaywrightPage).toHaveBeenCalledWith(
            'https://space.bilibili.com/646730844/video',
            expect.objectContaining({
                closeTimeout: 90000,
                gotoConfig: { waitUntil: 'domcontentloaded' },
                noGoto: true,
            })
        );
        expect(waitForResponse.mock.invocationCallOrder[0]).toBeLessThan(goto.mock.invocationCallOrder[0]);
        expect(waitForResponse).toHaveBeenCalledWith(expect.any(Function), { timeout: 45000 });
        const isVideoListResponse = waitForResponse.mock.calls[0][0];
        expect(
            isVideoListResponse({
                headers: () => ({ 'content-type': 'application/json; charset=utf-8' }),
                request: () => ({
                    method: () => 'GET',
                    resourceType: () => 'fetch',
                }),
                url: () => 'https://api.bilibili.com/x/space/wbi/arc/search',
            })
        ).toBe(true);
        expect(
            isVideoListResponse({
                headers: () => ({ 'content-type': 'text/html' }),
                request: () => ({
                    method: () => 'GET',
                    resourceType: () => 'fetch',
                }),
                url: () => 'https://api.bilibili.com/x/space/wbi/arc/search',
            })
        ).toBe(true);
        expect(goto).toHaveBeenCalledTimes(1);
        expect(goto).toHaveBeenCalledWith('https://space.bilibili.com/646730844/video', { timeout: 45000, waitUntil: 'domcontentloaded' });
        expect(cacheMock.getCookie).toHaveBeenCalledTimes(1);
        expect(data.item).toHaveLength(1);
        expect(data.item[0].title).toBe('Video title');
    });

    it('throws when the single video list response returns 412', async () => {
        cacheMock.getCookie.mockRejectedValueOnce(new Error('cookie unavailable'));
        cacheMock.getConfiguredCookie.mockReturnValue(undefined);
        waitForResponse.mockResolvedValue({
            headers: () => ({ 'content-type': 'text/html' }),
            request: () => ({
                method: () => 'GET',
                resourceType: () => 'fetch',
            }),
            status: () => 412,
            url: () => 'https://api.bilibili.com/x/space/wbi/arc/search',
        });
        goto.mockResolvedValue(undefined);
        getPlaywrightPage.mockImplementation(async (_url, options) => {
            await options.onBeforeLoad?.(page);
            return {
                destroy,
                page,
            };
        });

        const { route } = await import('@/routes/bilibili/video');

        await expect(route.handler(createContext())).rejects.toThrow('Bilibili browser mode returned unexpected video list API status 412');
        expect(goto).toHaveBeenCalledTimes(1);
        expect(waitForResponse).toHaveBeenCalledTimes(1);
        expect(destroy).toHaveBeenCalledTimes(1);
    });
});
