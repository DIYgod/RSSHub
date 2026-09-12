import { Context, type Next } from 'hono';
import { describe, expect, it } from 'vitest';

import { config } from '@/config';
import trace from '@/middleware/trace';

describe('trace middleware', () => {
    it('skips tracing when debugInfo is disabled', async () => {
        const originalDebug = config.debugInfo;
        config.debugInfo = '';

        let called = false;
        const ctx = new Context(new Request('http://localhost/test'));
        const next: Next = () => {
            called = true;
            return Promise.resolve();
        };

        await trace(ctx, next);
        expect(called).toBe(true);

        config.debugInfo = originalDebug;
    });
});
