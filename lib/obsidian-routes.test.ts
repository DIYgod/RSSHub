import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { route as pluginsRoute } from './routes/obsidian/plugins';
import { route as themesRoute } from './routes/obsidian/themes';

const searchConfigHtml = '<script>{"config":{"apiKey":"test-search-key","url":"https://community.obsidian.md/api/search"}}</script>';

describe('/obsidian', () => {
    it('builds the plugins feed from the community search API sorted by creation time', async () => {
        const { default: server } = await import('@/setup.test');

        server.use(
            http.get('https://community.obsidian.md/search', ({ request }) => {
                const url = new URL(request.url);

                expect(url.searchParams.get('type')).toBe('plugin');
                expect(url.searchParams.get('sort')).toBe('created');

                return HttpResponse.html(searchConfigHtml);
            }),
            http.get('https://community.obsidian.md/api/search/collections/entries/documents/search', ({ request }) => {
                const url = new URL(request.url);

                expect(request.headers.get('x-typesense-api-key')).toBe('test-search-key');
                expect(url.searchParams.get('q')).toBe('*');
                expect(url.searchParams.get('query_by')).toBe('name,authors,short_desc');
                expect(url.searchParams.get('filter_by')).toBe('type:=plugin');
                expect(url.searchParams.get('sort_by')).toBe('github_created_at:desc');
                expect(url.searchParams.get('per_page')).toBe('54');

                return HttpResponse.json({
                    hits: [
                        {
                            document: {
                                authors: ['slaymish'],
                                downloads: 2,
                                github_created_at: '2026-05-14T05:08:50Z',
                                id: '5757',
                                name: 'Synod',
                                short_desc: 'Run a council of LLM value agents over your journal.',
                                slug: 'synod',
                                tags: ['ai', 'import'],
                                type: 'plugin',
                            },
                        },
                    ],
                });
            })
        );

        const feed = await pluginsRoute.handler();

        expect(feed.title).toBe('Obsidian Plugins');
        expect(feed.link).toBe('https://community.obsidian.md/search?type=plugin&sort=created');
        expect(feed.item).toHaveLength(1);
        expect(feed.item[0]).toMatchObject({
            title: 'Synod',
            description: 'Run a council of LLM value agents over your journal.',
            link: 'https://community.obsidian.md/plugins/synod',
            guid: 'plugin:5757',
            author: 'slaymish',
            category: ['ai', 'import'],
        });
        expect(feed.item[0].pubDate?.toISOString()).toBe('2026-05-14T05:08:50.000Z');
    });

    it('builds the themes feed from the community search API sorted by creation time', async () => {
        const { default: server } = await import('@/setup.test');

        server.use(
            http.get('https://community.obsidian.md/search', ({ request }) => {
                const url = new URL(request.url);

                expect(url.searchParams.get('type')).toBe('theme');
                expect(url.searchParams.get('sort')).toBe('created');

                return HttpResponse.html(searchConfigHtml);
            }),
            http.get('https://community.obsidian.md/api/search/collections/entries/documents/search', ({ request }) => {
                const url = new URL(request.url);

                expect(request.headers.get('x-typesense-api-key')).toBe('test-search-key');
                expect(url.searchParams.get('filter_by')).toBe('type:=theme');
                expect(url.searchParams.get('sort_by')).toBe('github_created_at:desc');

                return HttpResponse.json({
                    hits: [
                        {
                            document: {
                                authors: ['jshuntley'],
                                downloads: 0,
                                github_created_at: '2026-05-14T00:28:26Z',
                                id: '5749',
                                name: 'Fjord',
                                short_desc: 'Fjord colorscheme for Obsidian.',
                                slug: 'fjord',
                                tags: [],
                                type: 'theme',
                            },
                        },
                    ],
                });
            })
        );

        const feed = await themesRoute.handler();

        expect(feed.title).toBe('Obsidian Themes');
        expect(feed.link).toBe('https://community.obsidian.md/search?type=theme&sort=created');
        expect(feed.item).toHaveLength(1);
        expect(feed.item[0]).toMatchObject({
            title: 'Fjord',
            description: 'Fjord colorscheme for Obsidian.',
            link: 'https://community.obsidian.md/themes/fjord',
            guid: 'theme:5749',
            author: 'jshuntley',
            category: [],
        });
        expect(feed.item[0].pubDate?.toISOString()).toBe('2026-05-14T00:28:26.000Z');
    });
});
