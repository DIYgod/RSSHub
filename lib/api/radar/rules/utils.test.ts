import { describe, expect, it, vi } from 'vitest';

import { getRadarRules } from '@/api/radar/rules/utils';

// The dev registry holds the route modules themselves, so function targets are still functions here
vi.mock('@/registry', () => ({
    ensureAllLoaded: () => Promise.resolve(),
    namespaces: {
        example: {
            name: 'Example',
            routes: {
                '/item/:id': {
                    name: 'Item',
                    radar: [{ source: ['example.com/item/:id'], target: (params) => `/example/item/${params.id}` }],
                },
                '/list/:id': {
                    name: 'List',
                    radar: [{ source: ['example.com/list/:id'], target: '/list/:id' }],
                },
            },
        },
    },
}));

describe('api/radar/rules/utils', () => {
    it('falls back to the route path for function targets', async () => {
        const rules = await getRadarRules();
        expect(rules['example.com']['.'].map((rule) => rule.target)).toEqual(['/example/item/:id', '/example/list/:id']);
    });
});
