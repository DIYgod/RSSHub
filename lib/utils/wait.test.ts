import { describe, expect, it } from 'vitest';
import wait from '@/utils/wait';

describe('wait', () => {
    it('wait 0.1 second', async () => {
        const startDate = Date.now();

        await wait(0.1 * 1000);

        const endDate = Date.now();
        expect(endDate - startDate).toBeGreaterThan(90);
        expect(endDate - startDate).toBeLessThan(150);
    });
});
