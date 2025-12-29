import { describe, expect, it } from 'vitest';

import { config } from '@/config';
import trace from '@/middleware/trace';

describe('trace middleware', () => {
    it('skips tracing when debugInfo is disabled', async () => {
        const originalDebug = config.debugInfo;
        config.debugInfo = false;

        let called = false;
        const ctx = {
            req: {
                method: 'GET',
                raw: new Request('http://localhost/test'),
            },
        };
        const next = () => {
            called = true;
        };

        await trace(ctx as any, next);
        expect(called).toBe(true);

        config.debugInfo = originalDebug;
    });
});
