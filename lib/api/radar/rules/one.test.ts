import type { Next } from 'hono';
import { describe, expect, it, vi } from 'vitest';

import { handler } from '@/api/radar/rules/one';

const noopNext: Next = () => Promise.resolve();

describe('api/radar/rules/one', () => {
    it('returns radar data for a domain param', async () => {
        const ctx = {
            req: {
                valid: vi.fn(() => ({ domain: 'unknown.invalid' })),
            },
            json: vi.fn((value) => value),
        };

        const result = await handler(ctx as any, noopNext);

        expect(ctx.req.valid).toHaveBeenCalledWith('param');
        expect(ctx.json).toHaveBeenCalledWith(undefined);
        expect(result).toBeUndefined();
    });
});
