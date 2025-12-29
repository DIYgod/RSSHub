import { describe, expect, it, vi } from 'vitest';

import { handler } from '@/api/radar/rules/one';

describe('api/radar/rules/one', () => {
    it('returns radar data for a domain param', () => {
        const ctx = {
            req: {
                valid: vi.fn(() => ({ domain: 'unknown.invalid' })),
            },
            json: vi.fn((value) => value),
        };

        const result = handler(ctx as any);

        expect(ctx.req.valid).toHaveBeenCalledWith('param');
        expect(ctx.json).toHaveBeenCalledWith(undefined);
        expect(result).toBeUndefined();
    });
});
