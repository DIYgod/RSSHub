import { describe, expect, it } from 'vitest';

process.env.OPENAI_API_KEY = 'sk-1234567890';
process.env.OPENAI_API_ENDPOINT = 'https://api.openai.mock/v1';

const { config } = await import('@/config');
const { default: parameter } = await import('@/middleware/parameter');

const runMiddleware = async (data: any, query: Record<string, string | undefined>) => {
    const store = new Map<string, unknown>([['data', data]]);
    const ctx = {
        req: {
            query: (key: string) => query[key],
        },
        get: (key: string) => store.get(key),
        set: (key: string, value: unknown) => store.set(key, value),
    };
    await parameter(ctx as any, async () => {});
    return store.get('data') as any;
};

describe('parameter middleware branches', () => {
    it('normalizes base urls and updates quote links', async () => {
        const data = {
            link: 'example.com/base',
            item: [
                {
                    title: 'Item 1',
                    link: '/relative',
                    description: '<div class="rsshub-quote">Quote</div><a href="/foo">Foo</a>',
                    _extra: {
                        links: [{ href: 'https://example.com' }],
                    },
                },
                {
                    title: 'Item 2',
                    description: '<img src="/img.png" />',
                },
            ],
            allowEmpty: true,
        };

        const result = await runMiddleware(data, {});
        expect(result.item[0].link).toBe('http://example.com/relative');
        expect(result.item[1].description).toContain('http://example.com/img.png');
        expect(result.item[0]._extra.links[0].content_html).toContain('rsshub-quote');
    });

    it('filters with RegExp engine', async () => {
        const originalEngine = config.feature.filter_regex_engine;
        config.feature.filter_regex_engine = 'regexp';

        const data = {
            link: 'https://example.com',
            item: [
                { title: 'Keep', description: 'A' },
                { title: 'Drop', description: 'B' },
            ],
        };

        const result = await runMiddleware(data, { filter: 'Keep' });
        expect(result.item).toHaveLength(1);
        expect(result.item[0].title).toBe('Keep');

        config.feature.filter_regex_engine = originalEngine;
    });

    it('filters by category when title and description do not match', async () => {
        const originalEngine = config.feature.filter_regex_engine;
        config.feature.filter_regex_engine = 'regexp';

        const data = {
            link: 'https://example.com',
            item: [
                {
                    title: 'Nope',
                    description: 'Also nope',
                    author: 'Still nope',
                    category: ['Match'],
                },
            ],
        };

        const result = await runMiddleware(data, { filter: 'Match' });
        expect(result.item).toHaveLength(1);
        expect(result.item[0].category).toContain('Match');

        config.feature.filter_regex_engine = originalEngine;
    });

    it('keeps items without link in tgiv mode', async () => {
        const data = {
            link: 'https://example.com',
            item: [{ title: 'NoLink' }],
        };

        const result = await runMiddleware(data, { tgiv: 'hash' });
        expect(result.item[0].link).toBeUndefined();
    });

    it('rewrites links for scihub', async () => {
        const data = {
            link: 'https://example.com',
            item: [
                { title: 'With DOI', doi: '10.1000/xyz' },
                { title: 'With link', link: 'https://example.com/paper' },
            ],
        };

        const result = await runMiddleware(data, { scihub: '1' });
        expect(result.item[0].link).toBe(`${config.scihub.host}10.1000/xyz`);
        expect(result.item[1].link).toBe(`${config.scihub.host}https://example.com/paper`);
    });

    it('throws on invalid brief value', async () => {
        const data = {
            link: 'https://example.com',
            item: [{ title: 'Item', description: 'Desc' }],
        };

        await expect(runMiddleware(data, { brief: '10' })).rejects.toThrow('Invalid parameter brief');
    });

    it('processes openai description and title', async () => {
        const originalInput = config.openai.inputOption;

        const descriptionData = {
            link: 'https://example.com',
            item: [
                {
                    title: 'Title',
                    description: 'Description',
                    link: `https://example.com/${Date.now()}/desc`,
                },
            ],
        };
        config.openai.inputOption = 'description';
        const descriptionResult = await runMiddleware(descriptionData, { chatgpt: 'true' });
        expect(descriptionResult.item[0].description).toContain('AI processed content.');

        const titleData = {
            link: 'https://example.com',
            item: [
                {
                    title: 'Title',
                    description: 'Description',
                    link: `https://example.com/${Date.now()}/title`,
                },
            ],
        };
        config.openai.inputOption = 'title';
        const titleResult = await runMiddleware(titleData, { chatgpt: 'true' });
        expect(titleResult.item[0].title).toContain('AI processed content.');

        config.openai.inputOption = originalInput;
    });
});
