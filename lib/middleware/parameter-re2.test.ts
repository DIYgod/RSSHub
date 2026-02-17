import { describe, expect, it, vi } from 'vitest';

class FakeRE2 {
    static CASE_INSENSITIVE = 1;
    private pattern: string;

    constructor(pattern: string) {
        this.pattern = pattern;
    }

    static compile(pattern: string) {
        return new FakeRE2(pattern);
    }

    matcher(text: string) {
        return {
            find: () => text.includes(this.pattern),
        };
    }
}

// Ensure instanceof checks behave as expected.
vi.mock('re2js', () => ({
    RE2JS: FakeRE2,
}));

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

describe('parameter middleware with RE2 engine', () => {
    it('filters items using re2 matcher', async () => {
        const originalEngine = config.feature.filter_regex_engine;
        config.feature.filter_regex_engine = 're2';

        const data = {
            link: 'https://example.com',
            item: [
                { title: 'Hit', description: 'Match' },
                { title: 'Miss', description: 'Nope' },
            ],
        };

        const result = await runMiddleware(data, { filter: 'Hit' });
        expect(result.item).toHaveLength(1);
        expect(result.item[0].title).toBe('Hit');

        config.feature.filter_regex_engine = originalEngine;
    });

    it('matches categories when other fields do not match', async () => {
        const originalEngine = config.feature.filter_regex_engine;
        config.feature.filter_regex_engine = 're2';

        const data = {
            link: 'https://example.com',
            item: [
                {
                    title: 'Nope',
                    description: 'Also nope',
                    author: 'Still nope',
                    category: ['OnlyCategory'],
                },
            ],
        };

        const result = await runMiddleware(data, { filter: 'OnlyCategory' });
        expect(result.item).toHaveLength(1);
        expect(result.item[0].category).toContain('OnlyCategory');

        config.feature.filter_regex_engine = originalEngine;
    });
});
