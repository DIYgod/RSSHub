import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { route as indexRoute } from './routes/techflowpost';
import { route as expressRoute } from './routes/techflowpost/express';
import { route as featuredRoute } from './routes/techflowpost/featured';

const challengeArg = '7FC0A515A247CA56A8EE791EF40FF1CAEB93AAA6';
const expectedCookie = 'acw_sc__v2=69fef11a2a690097fa41a9b697a798108d4fb906';

const challenge = `<html><script>var arg1='${challengeArg}';</script></html>`;

function createCtx({ category, limit = '1' }: { category?: string; limit?: string } = {}) {
    return {
        req: {
            param: (name: string) => (name === 'category' ? category : undefined),
            query: (name: string) => (name === 'limit' ? limit : undefined),
        },
    };
}

describe('/techflowpost', () => {
    it('builds the article feed from the current client API after acw challenge', async () => {
        const { default: server } = await import('@/setup.test');

        server.use(
            http.post('https://www.techflowpost.com/ashx/index.ashx', () => HttpResponse.json({ message: 'gone' }, { status: 410 })),
            http.get('https://www.techflowpost.com/api/client/articles', ({ request }) => {
                const url = new URL(request.url);
                expect(url.searchParams.get('page')).toBe('1');
                expect(url.searchParams.get('page_size')).toBe('1');

                if (!request.headers.get('cookie')?.includes(expectedCookie)) {
                    return HttpResponse.html(challenge);
                }

                return HttpResponse.json({
                    data: [
                        {
                            id: 31495,
                            title: 'Article title',
                            abstract: 'Article abstract',
                            picture: '/upload/images/article.png',
                            author: { name: 'TechFlow' },
                            category: { name: 'Trading' },
                            labels: [{ label: 'AI' }],
                            created_at: '2026-05-09T06:40:11.209Z',
                            updated_at: '2026-05-09T08:31:01.272Z',
                        },
                    ],
                });
            }),
            http.get('https://www.techflowpost.com/api/client/articles/31495', ({ request }) => {
                expect(request.headers.get('cookie')).toContain(expectedCookie);

                return HttpResponse.json({
                    article: {
                        content: '<p>Full article content</p>',
                    },
                });
            })
        );

        const feed = await indexRoute.handler(createCtx());
        expect(feed.item).toHaveLength(1);
        expect(feed.item[0].title).toBe('Article title');
        expect(feed.item[0].link).toBe('https://www.techflowpost.com/zh-CN/article/31495');
        expect(feed.item[0].description).toContain('Full article content');
        expect(feed.item[0].category).toEqual(['Trading', 'AI']);
    });

    it('passes category_id for featured article feeds', async () => {
        const { default: server } = await import('@/setup.test');

        server.use(
            http.post('https://www.techflowpost.com/ashx/index.ashx', () => HttpResponse.json({ message: 'gone' }, { status: 410 })),
            http.get('https://www.techflowpost.com/api/client/articles', ({ request }) => {
                const url = new URL(request.url);
                expect(url.searchParams.get('category_id')).toBe('2043');

                if (!request.headers.get('cookie')?.includes(expectedCookie)) {
                    return HttpResponse.html(challenge);
                }

                return HttpResponse.json({
                    data: [
                        {
                            id: 31496,
                            title: 'Featured article',
                            abstract: 'Featured abstract',
                            author: { name: 'TechFlow' },
                            category: { name: 'Trading' },
                            labels: [],
                            created_at: '2026-05-09T07:27:22.240Z',
                            updated_at: '2026-05-09T08:32:09.789Z',
                        },
                    ],
                });
            }),
            http.get('https://www.techflowpost.com/api/client/articles/31496', () =>
                HttpResponse.json({
                    article: {
                        content: '<p>Featured content</p>',
                    },
                })
            )
        );

        const feed = await featuredRoute.handler(createCtx({ category: '2043' }));
        expect(feed.item[0].title).toBe('Featured article');
        expect(feed.item[0].description).toContain('Featured content');
    });

    it('builds the express feed from the current newsflash API', async () => {
        const { default: server } = await import('@/setup.test');

        server.use(
            http.post('https://www.techflowpost.com/ashx/newflash_index.ashx', () => HttpResponse.json({ message: 'gone' }, { status: 410 })),
            http.get('https://www.techflowpost.com/api/client/newsflashes', ({ request }) => {
                const url = new URL(request.url);
                expect(url.searchParams.get('page')).toBe('1');
                expect(url.searchParams.get('page_size')).toBe('1');

                if (!request.headers.get('cookie')?.includes(expectedCookie)) {
                    return HttpResponse.html(challenge);
                }

                return HttpResponse.json({
                    data: [
                        {
                            id: 122059,
                            title: 'Newsflash title',
                            abstract: 'Newsflash abstract',
                            url: 'https://example.com/source',
                            created_at: '2026-05-09T08:21:45.537Z',
                            updated_at: '2026-05-09T08:33:21.834Z',
                        },
                    ],
                });
            }),
            http.get('https://www.techflowpost.com/api/client/newsflashes/122059', ({ request }) => {
                expect(request.headers.get('cookie')).toContain(expectedCookie);

                return HttpResponse.json({
                    content: '<p>Newsflash content</p>',
                });
            })
        );

        const feed = await expressRoute.handler(createCtx());
        expect(feed.item).toHaveLength(1);
        expect(feed.item[0].title).toBe('Newsflash title');
        expect(feed.item[0].link).toBe('https://www.techflowpost.com/zh-CN/newsletter/122059');
        expect(feed.item[0].description).toContain('Newsflash content');
    });
});
