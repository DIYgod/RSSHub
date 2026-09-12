import { describe, expect, it, vi } from 'vitest';

import logger from '@/utils/logger';

describe('app-bootstrap', () => {
    it('logs uncaught exceptions', async () => {
        const errorSpy = vi.spyOn(logger, 'error').mockImplementation(() => logger);
        const before = new Set(process.listeners('uncaughtException'));
        await import('@/app-bootstrap');
        const after = process.listeners('uncaughtException');
        const listener = after.find((fn) => !before.has(fn) && String(fn).includes('uncaughtException: '));

        expect(listener).toBeDefined();
        listener?.(new Error('boom'), 'uncaughtException');
        expect(errorSpy).toHaveBeenCalled();

        if (listener) {
            process.removeListener('uncaughtException', listener);
        }
        errorSpy.mockRestore();
    });
});
