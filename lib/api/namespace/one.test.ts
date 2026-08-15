import type { Next } from 'hono';
import { describe, expect, it } from 'vitest';

import api from '@/api';
import { handler as oneHandler } from '@/api/namespace/one';
import { namespaces } from '@/registry';

const noopNext: Next = () => Promise.resolve();

const createCtx = (param: Record<string, string> = {}) =>
    ({
        req: {
            valid: () => param,
        },
        json: (data: unknown) => data,
    }) as any;

describe('api/namespace/one', () => {
    const nestedKey = Object.keys(namespaces).find((key) => key.includes('/')) as string;

    it('returns a single namespace', async () => {
        const result = await oneHandler(createCtx({ namespace: 'test' }), noopNext);
        expect(result).toBe(namespaces.test);
    });

    it('returns a nested namespace', async () => {
        expect(nestedKey).toBeDefined();
        const [namespace, sub] = nestedKey.split('/', 2);
        const result = await oneHandler(createCtx({ namespace, sub }), noopNext);
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
