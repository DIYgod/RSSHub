import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Data } from '@/types';

import { route } from './blog';

const mocks = vi.hoisted(() => ({
    ofetch: vi.fn(),
    tryGet: vi.fn(),
}));

vi.mock('@/utils/ofetch', () => ({
    default: mocks.ofetch,
}));

vi.mock('@/utils/cache', () => ({
    default: {
        tryGet: mocks.tryGet,
    },
}));

const listPageUrl = 'https://www.uber.com/us/en/blog/engineering/';
const articleUrl = 'https://www.uber.com/us/en/blog/example-article/';
const hostPrefixedArticleUrl = 'https://www.uber.com/us/en/blog/scaling-exact-count/';

const listPageHtml = (fullURL = '/us/en/blog/example-article/') =>
    `<script id="__LOCAL_REDUX_STATE_Newsroom_Article Feed Store_%2Fus%2Fen%2Fblog%2Fengineering%2F__">${encodeURIComponent(
        JSON.stringify({
            relatedPages: {
                relatedPages: [
                    {
                        categoryIDs: ['8e047a28-7b55-4d5e-9bcb-7d8d3d42e3f5', 'ff41e9c2-5cae-42dc-a0ca-399f25c96e92'],
                        fullURL,
                        publishedAt: '2026-07-30T13:15:00Z',
                        title: 'Example Engineering Article',
                    },
                ],
            },
            listCategories: {
                newsroomCategories: [
                    { ID: '8e047a28-7b55-4d5e-9bcb-7d8d3d42e3f5', name: 'Engineering' },
                    { ID: 'ff41e9c2-5cae-42dc-a0ca-399f25c96e92', name: 'Backend' },
                ],
            },
        })
    )}</script>`;

const articlePageHtml = '<div data-testid="content" class="rich-lfc-content"><p>Full article body</p></div>';
const hostPrefixedListPageHtml = listPageHtml('www.uber.com/us/en/blog/scaling-exact-count/');
const validArticle = {
    categoryIDs: [1],
    fullURL: '/us/en/blog/example-article/',
    publishedAt: '2026-07-30T13:15:00Z',
    title: 'Example Engineering Article',
};
const validCategory = { ID: 1, name: 'Engineering' };
const listPageStateScript = (article: unknown, categories: unknown) =>
    `<script id="__LOCAL_REDUX_STATE_Newsroom_Article Feed Store__">${encodeURIComponent(
        JSON.stringify({
            relatedPages: { relatedPages: [article] },
            listCategories: { newsroomCategories: categories },
        })
    )}</script>`;

beforeEach(() => {
    mocks.ofetch.mockReset();
    mocks.tryGet.mockReset();
    mocks.tryGet.mockImplementation((_key: string, getValue: () => Promise<unknown>) => getValue());
});

describe('Uber Engineering Blog', () => {
    it('builds cached full-text items from the SSR list state', async () => {
        mocks.ofetch.mockImplementation((url: string) => {
            if (url === listPageUrl) {
                return listPageHtml();
            }
            if (url === articleUrl) {
                return articlePageHtml;
            }
            throw new Error(`Unexpected request: ${url}`);
        });

        const result = (await route.handler({} as never)) as Data;

        expect(result).toMatchObject({
            title: 'Uber Engineering Blog',
            link: listPageUrl,
            item: [
                {
                    title: 'Example Engineering Article',
                    link: articleUrl,
                    description: '<p>Full article body</p>',
                    pubDate: new Date('2026-07-30T13:15:00Z'),
                    category: ['Engineering', 'Backend'],
                },
            ],
        });
        expect(mocks.ofetch).toHaveBeenNthCalledWith(1, listPageUrl, { headers: { accept: 'text/html' }, redirect: 'manual' });
        expect(mocks.ofetch).toHaveBeenNthCalledWith(2, articleUrl, { headers: { accept: 'text/html' }, redirect: 'manual' });
        expect(mocks.tryGet).toHaveBeenCalledWith(articleUrl, expect.any(Function));
    });

    it('resolves host-prefixed article URLs from the SSR list state', async () => {
        mocks.ofetch.mockImplementation((url: string) => {
            if (url === listPageUrl) {
                return hostPrefixedListPageHtml;
            }
            if (url === hostPrefixedArticleUrl) {
                return articlePageHtml;
            }
            throw new Error(`Unexpected request: ${url}`);
        });

        const result = (await route.handler({} as never)) as Data;

        expect(result.item?.[0].link).toBe(hostPrefixedArticleUrl);
        expect(mocks.tryGet).toHaveBeenCalledWith(hostPrefixedArticleUrl, expect.any(Function));
    });

    it('reports a missing article-feed state script', async () => {
        mocks.ofetch.mockResolvedValue('<main></main>');

        await expect(route.handler({} as never)).rejects.toThrow('Unable to extract Uber Engineering article list from page state');
    });

    it.each([
        { name: 'malformed URL encoding', scriptText: '%' },
        { name: 'invalid JSON', scriptText: encodeURIComponent('{') },
        { name: 'missing related pages', scriptText: encodeURIComponent(JSON.stringify({ listCategories: { newsroomCategories: [] } })) },
        { name: 'missing categories', scriptText: encodeURIComponent(JSON.stringify({ relatedPages: { relatedPages: [] } })) },
    ])('reports $name in article-feed state', async ({ scriptText }) => {
        mocks.ofetch.mockResolvedValue(`<script id="__LOCAL_REDUX_STATE_Newsroom_Article Feed Store__">${scriptText}</script>`);

        await expect(route.handler({} as never)).rejects.toThrow('Unable to extract Uber Engineering article list from page state');
    });

    it.each([
        { name: 'article entry', article: {}, categories: [validCategory] },
        { name: 'article title', article: { ...validArticle, title: null }, categories: [validCategory] },
        { name: 'article publication date', article: { ...validArticle, publishedAt: null }, categories: [validCategory] },
        { name: 'empty article URL', article: { ...validArticle, fullURL: '' }, categories: [validCategory] },
        { name: 'unparseable article URL', article: { ...validArticle, fullURL: 'https://' }, categories: [validCategory] },
        { name: 'off-origin absolute article URL', article: { ...validArticle, fullURL: 'https://attacker.invalid/article' }, categories: [validCategory] },
        { name: 'off-origin protocol-relative article URL', article: { ...validArticle, fullURL: '//attacker.invalid/article' }, categories: [validCategory] },
        { name: 'invalid article publication date', article: { ...validArticle, publishedAt: 'not-a-date' }, categories: [validCategory] },
        { name: 'impossible article publication date', article: { ...validArticle, publishedAt: '2026-02-31T13:15:00Z' }, categories: [validCategory] },
        { name: 'article category IDs', article: { ...validArticle, categoryIDs: [false] }, categories: [validCategory] },
        { name: 'category ID', article: validArticle, categories: [{ ...validCategory, ID: false }] },
        { name: 'category name', article: validArticle, categories: [{ ...validCategory, name: null }] },
    ])('reports malformed $name in article-feed state', async ({ article, categories }) => {
        mocks.ofetch.mockImplementation((url: string) => (url === listPageUrl ? listPageStateScript(article, categories) : articlePageHtml));

        await expect(route.handler({} as never)).rejects.toThrow('Unable to extract Uber Engineering article list from page state');
    });

    it('reports a whitespace-only full-text container', async () => {
        mocks.ofetch.mockImplementation((url: string) => (url === listPageUrl ? listPageHtml() : '<div data-testid="content" class="rich-lfc-content"> \n\t </div>'));

        await expect(route.handler({} as never)).rejects.toThrow(`Unable to extract Uber Engineering article content from ${articleUrl}`);
    });

    it('reports a missing full-text container', async () => {
        mocks.ofetch.mockImplementation((url: string) => (url === listPageUrl ? listPageHtml() : '<article></article>'));

        await expect(route.handler({} as never)).rejects.toThrow(`Unable to extract Uber Engineering article content from ${articleUrl}`);
    });
});
