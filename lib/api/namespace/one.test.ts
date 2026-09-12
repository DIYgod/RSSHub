import { describe, expect, it } from 'vitest';

import api from '@/api';
import { namespaces } from '@/registry';

describe('api/namespace/one', () => {
    const nestedKey = Object.keys(namespaces).find((key) => key.includes('/')) as string;

    it('serves a single namespace over HTTP', async () => {
        expect(namespaces.github).toBeDefined();
        const response = await api.request('/namespace/github');
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toEqual(namespaces.github);
    });

    it('serves a nested namespace over HTTP', async () => {
        expect(nestedKey).toBeDefined();
        const response = await api.request(`/namespace/${nestedKey}`);
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toEqual(namespaces[nestedKey]);
    });
});
