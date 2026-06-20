import { describe, expect, it, vi } from 'vitest';

const notify = vi.fn();

vi.mock('@honeybadger-io/js', () => ({
    default: { notify },
}));

vi.mock('@sentry/node', () => ({
    withScope: vi.fn(),
    captureException: vi.fn(),
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

describe('error handler honeybadger', () => {
    it('sends errors to honeybadger when enabled', async () => {
        process.env.HONEYBADGER_API_KEY = 'hbp_test_key';
        vi.resetModules();

        // Re-mock after resetModules
        vi.doMock('@honeybadger-io/js', () => ({
            default: { notify },
        }));
        vi.doMock('@sentry/node', () => ({
            withScope: vi.fn(),
            captureException: vi.fn(),
        }));
        vi.doMock('hono/route', () => ({
            routePath: () => '/test/path',
        }));
        vi.doMock('@/utils/logger', () => ({
            default: { error: vi.fn() },
        }));
        vi.doMock('@/utils/otel', () => ({
            requestMetric: { error: vi.fn() },
        }));

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

        expect(notify).toHaveBeenCalledWith(expect.any(Error), {
            context: { name: 'test' },
        });

        delete process.env.HONEYBADGER_API_KEY;
    });
});
