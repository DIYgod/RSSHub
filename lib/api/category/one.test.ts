import { describe, expect, it } from 'vitest';

import { handler, route } from '@/api/category/one';
import { namespaces } from '@/registry';

const createCtx = (param: Record<string, string>, query: Record<string, any> = {}) =>
    ({
        req: {
            valid: (type: string) => (type === 'param' ? param : query),
        },
        json: (data: unknown) => data,
    }) as any;

const findCategory = (requireLang = false) => {
    for (const [namespace, data] of Object.entries(namespaces)) {
        for (const route of Object.values(data.routes)) {
            const categories = route.categories || [];
            if (categories.length > 0) {
                if (requireLang && !data.lang) {
                    continue;
                }
                return { namespace, categories, lang: data.lang };
            }
        }
    }
    throw new Error('No categories found in registry data');
};

describe('api/category/one', () => {
    it('returns namespaces that match a category', () => {
        const { categories } = findCategory();
        const category = categories[0];

        const result = handler(createCtx({ category }, {}));
        expect(Object.keys(result)).not.toHaveLength(0);

        for (const namespace of Object.values(result)) {
            for (const route of Object.values((namespace as { routes: Record<string, { categories?: string[] }> }).routes)) {
                expect(route.categories || []).toContain(category);
            }
        }
    });

    it('intersects categories and filters by lang', () => {
        const { namespace, categories, lang } = findCategory(true);
        const [primary, secondary] = categories.length > 1 ? categories : [categories[0], categories[0]];
        const selectedLang = lang || namespaces[namespace].lang;

        const result = handler(
            createCtx(
                { category: primary },
                {
                    categories: [secondary],
                    lang: selectedLang,
                }
            )
        );

        expect(Object.keys(result)).toContain(namespace);
        for (const ns of Object.values(result)) {
            expect((ns as { lang?: string }).lang).toBe(selectedLang);
        }
    });

    it('parses categories query string into array', () => {
        const parsed = route.request?.query?.parse({ categories: 'a,b', lang: 'en' });
        expect(parsed?.categories).toEqual(['a', 'b']);
        expect(parsed?.lang).toBe('en');
    });

    it('returns empty result for unknown categories', () => {
        const result = handler(createCtx({ category: 'rsshub-unknown-category' }, {}));
        expect(result).toEqual({});
    });
});
