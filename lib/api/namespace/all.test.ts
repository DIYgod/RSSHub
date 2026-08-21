import type { Next } from 'hono';
import { describe, expect, it } from 'vitest';

import { handler as allHandler } from '@/api/namespace/all';
import { namespaces } from '@/registry';

const noopNext: Next = () => Promise.resolve();

const createCtx = (param: Record<string, string> = {}) =>
    ({
        req: {
            valid: () => param,
        },
        json: (data: unknown) => data,
    }) as any;

describe('api/namespace/all', () => {
    it('returns all namespaces', async () => {
        const result = await allHandler(createCtx(), noopNext);
        expect(result).toBe(namespaces);
    });
});
