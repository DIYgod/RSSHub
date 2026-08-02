import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const UID = '999999999';

// Only the username-lookup collaborator is mocked (it independently drives its own
// Playwright/WBI-signing network chain, orthogonal to the bug under test). The rest of
// the handler — querystring parsing, the dynamics-feed request, and the emoji-processing
// branch — runs unmodified against a real, msw-intercepted Bilibili API payload.
vi.mock('./cache', () => ({
    default: {
        getUsernameFromUID: vi.fn(() => 'test-up'),
    },
}));

function createCtx(routeParams: string) {
    return {
        req: {
            param: (key: string) => (key === 'uid' ? UID : routeParams),
        },
    } as any;
}

describe('/bilibili/followings/dynamic', () => {
    beforeEach(() => {
        process.env.BILIBILI_COOKIE_999999999 = 'SESSDATA=test';
    });

    it('does not throw when a dynamic has emoji_info without emoji_details and showEmoji=1 (#21916)', async () => {
        const { default: server } = await import('@/setup.test');
        const apiResponse = {
            code: 0,
            data: {
                cards: [
                    {
                        desc: {
                            dynamic_id: 123_456_789,
                            user_profile: { info: { uname: 'test-up' } },
                        },
                        card: JSON.stringify({ item: { content: 'A plain dynamic with no custom emoji' } }),
                        // Real Bilibili payload shape: `display.emoji_info` exists as an
                        // object but has no `emoji_details` array when there's nothing to
                        // resolve for this particular dynamic.
                        display: { emoji_info: {} },
                    },
                ],
            },
        };

        server.use(http.get('https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new', () => HttpResponse.text(JSON.stringify(apiResponse))));

        const { route } = await import('./followings-dynamic');
        const feed = await route.handler(createCtx('showEmoji=1'));

        expect(feed.item).toHaveLength(1);
        expect(feed.item[0].description).toContain('A plain dynamic with no custom emoji');
    });

    it('still substitutes emoji when emoji_details is present and showEmoji=1', async () => {
        const { default: server } = await import('@/setup.test');
        const apiResponse = {
            code: 0,
            data: {
                cards: [
                    {
                        desc: {
                            dynamic_id: 987_654_321,
                            user_profile: { info: { uname: 'test-up' } },
                        },
                        card: JSON.stringify({ item: { content: 'Look at this [smile]' } }),
                        display: {
                            emoji_info: {
                                emoji_details: [{ text: '[smile]', url: 'https://example.com/smile.png' }],
                            },
                        },
                    },
                ],
            },
        };

        server.use(http.get('https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new', () => HttpResponse.text(JSON.stringify(apiResponse))));

        const { route } = await import('./followings-dynamic');
        const feed = await route.handler(createCtx('showEmoji=1'));

        expect(feed.item[0].description).toContain('<img alt="[smile]" src="https://example.com/smile.png"');
    });
});
