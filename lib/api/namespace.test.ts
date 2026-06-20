import { describe, expect, it } from 'vitest';

import api from '@/api';
import { handler as allHandler } from '@/api/namespace/all';
import { handler as oneHandler } from '@/api/namespace/one';
import { namespaces } from '@/registry';

const createCtx = (param: Record<string, string> = {}) =>
    ({
        req: {
            valid: () => param,
        },
        json: (data: unknown) => data,
    }) as any;

describe('api/namespace', () => {
    const nestedKey = Object.keys(namespaces).find((key) => key.includes('/')) as string;

    it('returns all namespaces', () => {
        const result = allHandler(createCtx());
        expect(result).toBe(namespaces);
    });

    it('returns a single namespace', () => {
        const result = oneHandler(createCtx({ namespace: 'test' }));
        expect(result).toBe(namespaces.test);
    });

    it('returns a nested namespace', () => {
        expect(nestedKey).toBeDefined();
        const [namespace, sub] = nestedKey.split('/');
        const result = oneHandler(createCtx({ namespace, sub }));
        expect(result).toBe(namespaces[nestedKey]);
    });

    it('serves a single namespace over HTTP', async () => {
        expect(namespaces.github).toBeDefined();
        const response = await api.request('/namespace/github');
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual(namespaces.github);
    });

    it('serves a nested namespace over HTTP', async () => {
        expect(nestedKey).toBeDefined();
        const response = await api.request(`/namespace/${nestedKey}`);
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual(namespaces[nestedKey]);
    });
});
