import { describe, expect, it } from 'vitest';

import api from '@/api';
import { route } from '@/api/category/one';
import type { NamespacesType } from '@/registry';
import { namespaces } from '@/registry';

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
    it('returns namespaces that match a category', async () => {
        const { categories } = findCategory();
        const category = categories[0];

        const response = await api.request(`/category/${category}`);
        expect(response.status).toBe(200);
        const result: NamespacesType = await response.json();
        expect(Object.keys(result)).not.toHaveLength(0);

        for (const namespace of Object.values(result)) {
            for (const route of Object.values(namespace.routes)) {
                expect(route.categories || []).toContain(category);
            }
        }
    });

    it('intersects categories and filters by lang', async () => {
        const { namespace, categories, lang } = findCategory(true);
        const [primary, secondary] = categories.length > 1 ? categories : [categories[0], categories[0]];
        const selectedLang = lang || namespaces[namespace].lang;

        const response = await api.request(`/category/${primary}?categories=${secondary}&lang=${selectedLang}`);
        expect(response.status).toBe(200);
        const result: NamespacesType = await response.json();

        expect(Object.keys(result)).toContain(namespace);
        for (const ns of Object.values(result)) {
            expect(ns.lang).toBe(selectedLang);
        }
    });

    it('parses categories query string into array', () => {
        const parsed = route.request?.query?.parse({ categories: 'a,b', lang: 'en' });
        expect(parsed?.categories).toEqual(['a', 'b']);
        expect(parsed?.lang).toBe('en');
    });

    it('returns empty result for unknown categories', async () => {
        const response = await api.request('/category/rsshub-unknown-category');
        expect(response.status).toBe(200);
        const result = await response.json();
        expect(result).toEqual({});
    });
});
