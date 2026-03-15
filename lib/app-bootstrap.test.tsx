import { describe, expect, it, vi } from 'vitest';

const errorSpy = vi.fn();

vi.mock('@/utils/logger', () => ({
    default: {
        error: errorSpy,
    },
}));

describe('app-bootstrap', () => {
    it('logs uncaught exceptions', async () => {
        const before = new Set(process.listeners('uncaughtException'));
        await import('@/app-bootstrap');
        const after = process.listeners('uncaughtException');
        const listener = after.find((fn) => !before.has(fn));

        expect(listener).toBeDefined();
        listener?.(new Error('boom'));
        expect(errorSpy).toHaveBeenCalled();

        if (listener) {
            process.removeListener('uncaughtException', listener);
        }
    });
});
