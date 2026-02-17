import { describe, expect, it } from 'vitest';

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
    it('returns all namespaces', () => {
        const result = allHandler(createCtx());
        expect(result).toBe(namespaces);
    });

    it('returns a single namespace', () => {
        const result = oneHandler(createCtx({ namespace: 'test' }));
        expect(result).toBe(namespaces.test);
    });
});
