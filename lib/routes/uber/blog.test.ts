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
const requestOptions = { headers: { accept: 'text/html' }, redirect: 'manual' };

const listPageStateScript = (article: object) =>
    `<script id="__LOCAL_REDUX_STATE_Newsroom_Article Feed Store_%2Fus%2Fen%2Fblog%2Fengineering%2F__">${encodeURIComponent(
        JSON.stringify({
            relatedPages: { relatedPages: [article] },
            listCategories: { newsroomCategories: [{ ID: 'engineering', name: 'Engineering' }] },
        })
    )}</script>`;

beforeEach(() => {
    mocks.ofetch.mockReset();
    mocks.tryGet.mockReset();
    mocks.tryGet.mockImplementation((_key: string, getValue: () => Promise<unknown>) => getValue());
});

describe('Uber Engineering Blog', () => {
    it('builds cached full-text items from the SSR list state', async () => {
        const article = {
            categoryIDs: ['engineering'],
            fullURL: '/us/en/blog/example-article/',
            ogTitle: 'Open Graph Engineering Article',
            publishedAt: '2026-07-30T13:15:00.123Z',
            title: 'Fallback Engineering Article',
        };
        mocks.ofetch.mockImplementation((url: string) => {
            if (url === listPageUrl) {
                return listPageStateScript(article);
            }
            if (url === articleUrl) {
                return '<div data-testid="content" class="rich-lfc-content"><p>Full article body</p></div>';
            }
            throw new Error(`Unexpected request: ${url}`);
        });

        const result = (await route.handler({} as never)) as Data;

        expect(result).toMatchObject({
            title: 'Uber Engineering Blog',
            link: listPageUrl,
            item: [
                {
                    title: 'Open Graph Engineering Article',
                    link: articleUrl,
                    description: '<p>Full article body</p>',
                    pubDate: new Date('2026-07-30T13:15:00.123Z'),
                    category: ['Engineering'],
                },
            ],
        });
        expect(mocks.tryGet).toHaveBeenCalledWith(articleUrl, expect.any(Function));
        expect(mocks.ofetch).toHaveBeenNthCalledWith(1, listPageUrl, requestOptions);
        expect(mocks.ofetch).toHaveBeenNthCalledWith(2, articleUrl, requestOptions);
    });

    it('rejects an invalid article publication date in the SSR list state', async () => {
        mocks.ofetch.mockResolvedValue(
            listPageStateScript({
                categoryIDs: ['engineering'],
                fullURL: '/us/en/blog/example-article/',
                publishedAt: '2026-02-31T13:15:00Z',
                title: 'Example Engineering Article',
            })
        );

        await expect(route.handler({} as never)).rejects.toThrow('Unable to extract Uber Engineering article list from page state');
    });
});
