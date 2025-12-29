import { describe, expect, it, vi } from 'vitest';

const captureException = vi.fn();
const setTag = vi.fn();

vi.mock('@sentry/node', () => ({
    withScope: (cb: (scope: { setTag: typeof setTag }) => void) => cb({ setTag }),
    captureException,
}));

vi.mock('hono/route', () => ({
    routePath: () => '/test/path',
}));

vi.mock('@/utils/logger', () => ({
    default: {
        error: vi.fn(),
    },
}));

vi.mock('@/utils/otel', () => ({
    requestMetric: {
        error: vi.fn(),
    },
}));

describe('error handler sentry', () => {
    it('sends errors to sentry when enabled', async () => {
        process.env.SENTRY = 'dsn';
        vi.resetModules();

        const { errorHandler } = await import('@/errors');

        const ctx = {
            req: {
                path: '/test/path',
                method: 'GET',
                query: () => 'json',
            },
            res: {
                status: 500,
                headers: new Headers(),
            },
            status: vi.fn(),
            header: vi.fn(),
            json: (payload: unknown) => payload,
            html: (payload: unknown) => payload,
        };

        errorHandler(new Error('boom'), ctx as any);

        expect(setTag).toHaveBeenCalledWith('name', 'test');
        expect(captureException).toHaveBeenCalled();

        delete process.env.SENTRY;
    });
});
