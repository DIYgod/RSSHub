import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { config as ConfigType } from '@/config';

import { route } from './lib/routes/facebook/search';

vi.mock('@/config', async (importOriginal) => {
    const original = await importOriginal<{ config: typeof ConfigType }>();
    return {
        ...original,
        config: {
            ...original.config,
            facebook: {
                ...original.config.facebook,
                cookie: 'c_user=123; xs=test',
            },
        },
    };
});

type Story = {
    post_id: string;
    creation_time: number;
    permalink_url: string;
    comet_sections: {
        content: {
            story: {
                message: { text: string };
            };
        };
    };
    feedback: {
        owning_profile: { name: string };
    };
};

function edge(id: string, timestamp = 1_700_000_000) {
    const story: Story = {
        post_id: id,
        creation_time: timestamp,
        permalink_url: `https://www.facebook.com/posts/${id}`,
        comet_sections: {
            content: {
                story: {
                    message: { text: `Post ${id}` },
                },
            },
        },
        feedback: {
            owning_profile: { name: 'Test Author' },
        },
    };

    return {
        rendering_strategy: {
            view_model: {
                click_model: { story },
            },
        },
    };
}

function page(ids: string[], cursor?: string) {
    return {
        edges: ids.map((id) => edge(id)),
        page_info: {
            has_next_page: Boolean(cursor),
            end_cursor: cursor,
        },
    };
}

function html(results: ReturnType<typeof page>) {
    return `<html><script type="application/json">${JSON.stringify({
        data: {
            serpResponse: { results },
        },
    })}</script></html>`;
}

function response(body: string, status = 200) {
    return new Response(body, { status });
}

function context(params: Record<string, string> = {}) {
    const url = new URL('http://localhost:1200/facebook/search/test');
    for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
    }

    return {
        req: {
            url: url.href,
            param: (key: string) => (key === 'query' ? 'test' : undefined),
            query: (key: string) => url.searchParams.get(key) ?? undefined,
        },
    } as Parameters<typeof route.handler>[0];
}

async function run(params: Record<string, string> = {}) {
    const result = await route.handler(
        context({
            start: '2026-11-20',
            end: '2026-11-23',
            ...params,
        })
    );

    if (!result || result instanceof Response || !('item' in result)) {
        throw new Error('Expected Facebook search feed data');
    }

    return result as {
        item: Array<{
            title: string;
            author: string;
            guid: string;
            pubDate?: string;
        }>;
    };
}

function mockFacebook(initial: ReturnType<typeof page>, subsequent: Array<ReturnType<typeof page>> = []) {
    const fetchMock = vi.fn((input: string | URL, init?: RequestInit) => {
        const url = String(input);

        if (url.includes('/ajax/dtsg/')) {
            return Promise.resolve(
                response(
                    'for (;;);' +
                        JSON.stringify({
                            payload: { token: 'test-token' },
                        })
                )
            );
        }

        if (url.includes('/api/graphql/')) {
            const next = subsequent.shift();
            if (!next) {
                return Promise.resolve(response('GraphQL unavailable', 500));
            }
            return Promise.resolve(
                response(
                    JSON.stringify({
                        data: {
                            serpResponse: { results: next },
                        },
                    })
                )
            );
        }

        if (url.includes('/search/posts/')) {
            return Promise.resolve(response(html(initial)));
        }

        throw new Error(`Unexpected request: ${url} ${init?.method ?? 'GET'}`);
    });

    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
}

describe('Facebook search', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('extracts posts from initial HTML', async () => {
        mockFacebook(page(['101', '102']));

        const result = await run();

        expect(result.item).toHaveLength(2);
        expect(result.item[0]).toMatchObject({
            title: 'Post 101',
            author: 'Test Author',
            guid: 'facebook:101',
        });
    });

    it('rejects HTML without search results', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(() => Promise.resolve(response('<html></html>')))
        );

        await expect(run()).rejects.toThrow('Facebook search results not found');
    });

    it('rejects invalid dates and reversed ranges', async () => {
        await expect(run({ start: '2026-02-30' })).rejects.toThrow('Invalid date');
        await expect(run({ start: '2026-11-24' })).rejects.toThrow('start must not be after end');
    });

    it('deduplicates posts across pages', async () => {
        mockFacebook(page(['101', '102'], 'cursor-1'), [page(['102', '103'])]);

        const result = await run({ pages: '1' });

        expect(result.item.map((item) => item.guid)).toEqual(['facebook:101', 'facebook:102', 'facebook:103']);
    });

    it('passes the previous cursor to GraphQL', async () => {
        const fetchMock = mockFacebook(page(['101'], 'cursor-1'), [page(['102'], 'cursor-2'), page(['103'])]);

        const result = await run({ pages: '2' });

        expect(result.item).toHaveLength(3);

        const graphqlCalls = fetchMock.mock.calls.filter(([url]) => String(url).includes('/api/graphql/'));

        expect(graphqlCalls).toHaveLength(2);

        const cursors = graphqlCalls.map(([, init]) => {
            const body = new URLSearchParams(String(init?.body));
            return JSON.parse(body.get('variables')!).cursor;
        });

        expect(cursors).toEqual(['cursor-1', 'cursor-2']);
    });

    it('preserves initial results if pagination fails', async () => {
        mockFacebook(page(['101'], 'cursor-1'));

        const result = await run({ pages: '1' });

        expect(result.item.map((item) => item.guid)).toEqual(['facebook:101']);
    });
});
