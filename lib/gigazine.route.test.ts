import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ROOT_URL = 'https://gigazine.net';
const LIST_URL = `${ROOT_URL}/gsc_news/en/`;
const ofetchMock = vi.hoisted(() => vi.fn());
const tryGetMock = vi.hoisted(() => vi.fn());

vi.mock('@/utils/ofetch', () => ({
    default: ofetchMock,
}));

vi.mock('@/utils/cache', () => ({
    default: {
        tryGet: tryGetMock,
    },
}));

const loadRoute = async () => (await import('./routes/gigazine/en')).route;

const createCtx = (limit?: string) => ({
    req: {
        query: (key: string) => (key === 'limit' ? limit : undefined),
    },
});

const createCard = (path: string, title: string, dateTime: string, category: string, imagePath: string) => `
    <article class="card">
        <div class="thumb">
            <img data-src="${imagePath}">
        </div>
        <div class="catab">${category}</div>
        <time datetime="${dateTime}"></time>
        <h2>
            <a href="${path}">
                <span>${title}</span>
            </a>
        </h2>
    </article>
`;

const createListHtml = (...cards: string[]) => `<div>${cards.join('')}</div>`;

const createArticleHtml = ({ body, author = 'Jane Doe', categories = ['AI', 'Science'], ogImage = '/images/og.jpg' }: { body: string; author?: string; categories?: string[]; ogImage?: string }) => `
    <html>
        <head>
            <meta property="og:image" content="${ogImage}" />
        </head>
        <body>
            <div id="article">
                <div class="items">
                    <p>Posted by ${author}</p>
                    <p>
                        ${categories.map((category, index) => `<a href="/gsc_news/en/C${index + 1}/">${category}</a>`).join('')}
                    </p>
                </div>
                <div class="cntimage">
                    ${body}
                </div>
            </div>
        </body>
    </html>
`;

describe('gigazine english route', () => {
    beforeEach(() => {
        ofetchMock.mockReset();
        tryGetMock.mockReset();
        tryGetMock.mockImplementation((_key: string, callback: () => Promise<unknown>) => callback());
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('fetches full article content, metadata, and normalized media', async () => {
        const detailUrl = `${LIST_URL}article-1/`;
        const listHtml = createListHtml(createCard('/gsc_news/en/article-1/', 'Article 1', '2026-04-18T10:30:00+09:00', 'Tech', '/images/list.jpg'));
        const articleHtml = createArticleHtml({
            body: `
                <h1 class="title">Remove me</h1>
                <time class="yeartime">2026-04-18</time>
                <div class="sbn">Sidebar</div>
                <p>Main article body</p>
                <img data-src="/images/detail.jpg">
                <a href="/gsc_news/en/related/">Read more</a>
                <script>alert(1)</script>
                <noscript>fallback</noscript>
            `,
        });

        ofetchMock.mockImplementation((url: string) => {
            if (url === LIST_URL) {
                return listHtml;
            }
            if (url === detailUrl) {
                return articleHtml;
            }
            throw new Error(`Unexpected URL: ${url}`);
        });

        const route = await loadRoute();
        const data = await route.handler(createCtx('1'));

        expect(data.title).toBe('GIGAZINE - English News');
        expect(data.link).toBe(LIST_URL);
        expect(data.language).toBe('en');
        expect(data.item).toHaveLength(1);
        expect(tryGetMock).toHaveBeenCalledWith(detailUrl, expect.any(Function));
        expect(ofetchMock).toHaveBeenNthCalledWith(
            1,
            LIST_URL,
            expect.objectContaining({
                headers: expect.objectContaining({
                    Referer: ROOT_URL,
                    'User-Agent': expect.any(String),
                }),
            })
        );
        expect(ofetchMock).toHaveBeenNthCalledWith(
            2,
            detailUrl,
            expect.objectContaining({
                headers: expect.objectContaining({
                    Referer: LIST_URL,
                    'User-Agent': expect.any(String),
                }),
            })
        );

        const [item] = data.item;
        expect(item.title).toBe('Article 1');
        expect(item.link).toBe(detailUrl);
        expect(item.pubDate).toBeDefined();
        expect(item.author).toBe('Jane Doe');
        expect(item.category).toEqual(['AI', 'Science']);
        expect(item.image).toBe(`${ROOT_URL}/images/og.jpg`);
        expect(item.description).toContain('<p>Main article body</p>');
        expect(item.description).toContain(`src="${ROOT_URL}/images/detail.jpg"`);
        expect(item.description).toContain(`href="${LIST_URL}related/"`);
        expect(item.description).not.toContain('Remove me');
        expect(item.description).not.toContain('Sidebar');
        expect(item.description).not.toContain('fallback');
        expect(item.description).not.toContain('<script');
    });

    it('skips remaining detail fetches after a 403 and falls back to list metadata', async () => {
        const firstDetailUrl = `${LIST_URL}blocked-1/`;
        const secondDetailUrl = `${LIST_URL}blocked-2/`;
        const listHtml = createListHtml(
            createCard('/gsc_news/en/blocked-1/', 'Blocked 1', '2026-04-18T10:30:00+09:00', 'First', '/images/first.jpg'),
            createCard('/gsc_news/en/blocked-2/', 'Blocked 2', '2026-04-18T10:40:00+09:00', 'Second', '/images/second.jpg')
        );

        ofetchMock.mockImplementation((url: string) => {
            if (url === LIST_URL) {
                return listHtml;
            }
            if (url === firstDetailUrl) {
                throw { status: 403 };
            }
            if (url === secondDetailUrl) {
                return createArticleHtml({ body: '<p>Should not be fetched</p>' });
            }
            throw new Error(`Unexpected URL: ${url}`);
        });

        const route = await loadRoute();
        const data = await route.handler(createCtx('2'));

        expect(data.item).toHaveLength(2);
        expect(tryGetMock).toHaveBeenCalledTimes(1);
        expect(ofetchMock).toHaveBeenCalledTimes(2);
        expect(ofetchMock).not.toHaveBeenCalledWith(secondDetailUrl, expect.anything());

        expect(data.item[0]).toEqual(
            expect.objectContaining({
                title: 'Blocked 1',
                link: firstDetailUrl,
                category: ['First'],
                image: `${ROOT_URL}/images/first.jpg`,
            })
        );
        expect(data.item[0].description).toBeUndefined();
        expect(data.item[1]).toEqual(
            expect.objectContaining({
                title: 'Blocked 2',
                link: secondDetailUrl,
                category: ['Second'],
                image: `${ROOT_URL}/images/second.jpg`,
            })
        );
        expect(data.item[1].description).toBeUndefined();
    });

    it('waits before the second uncached detail fetch', async () => {
        vi.useFakeTimers();

        const firstDetailUrl = `${LIST_URL}article-1/`;
        const secondDetailUrl = `${LIST_URL}article-2/`;
        const listHtml = createListHtml(
            createCard('/gsc_news/en/article-1/', 'Article 1', '2026-04-18T10:30:00+09:00', 'First', '/images/first.jpg'),
            createCard('/gsc_news/en/article-2/', 'Article 2', '2026-04-18T10:40:00+09:00', 'Second', '/images/second.jpg')
        );

        ofetchMock.mockImplementation((url: string) => {
            if (url === LIST_URL) {
                return listHtml;
            }
            if (url === firstDetailUrl || url === secondDetailUrl) {
                return createArticleHtml({ body: `<p>${url}</p>`, categories: ['Detail'] });
            }
            throw new Error(`Unexpected URL: ${url}`);
        });

        const route = await loadRoute();
        const handlerPromise = route.handler(createCtx('2'));
        await vi.runAllTimersAsync();
        const data = await handlerPromise;

        expect(data.item).toHaveLength(2);
        expect(tryGetMock).toHaveBeenCalledTimes(2);
        expect(ofetchMock).toHaveBeenCalledWith(secondDetailUrl, expect.anything());
        expect(data.item[0].description).toContain(firstDetailUrl);
        expect(data.item[1].description).toContain(secondDetailUrl);
    });
});
